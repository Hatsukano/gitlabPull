const consola = require("consola");
const path = require("path")
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');
const { default: axios } = require("axios")
const db = new JsonDB(new Config("myDataBase", true, false, path.resolve(__dirname,'/')));
const exec = util.promisify(require('child_process').exec);
const fs = require('fs-extra')
const util = require('util');

// configs
const gitlabAddr = '' // gitlab address
const gitlabToken = '' // gitlabToken
const num = 10 // pull num * 100 = 1000 repo

// init local database first time running the script
try{
    db.getData("/first");
}catch(err){
    let arr = new Array(num * 100).fill(1)
    let map = {}
    arr.forEach((i,idx) => {
        map[idx] = false // init
    })
    db.push("/map",map);
    db.push("/first",true);
}

async function main() {
    consola.log('main')
    const map = db.getData("/map");
    let command = ''
    for (let i = 0; i < num; i++) {
        let url = `http://${gitlabAddr}/api/v4/projects?private_token=${gitlabToken}&per_page=100&page=${i}&order_by=name`
        const temp = await axios.get(url)
        const projects = temp.data
        for (let j = 0; j < projects.length; j++) {
            if(map[i * 100 + j]){
                consola.info(`SKIP ${i * 100 + j + 1}`)
            }else{
                consola.info(`Processing ${i * 100 + j + 1}/${(i + 1) * 100}]`)
                let project = projects[j]
                thisProjectURL = project['ssh_url_to_repo']
                thisProjectPath = project['path_with_namespace']
                if (fs.pathExistsSync(path.resolve(__dirname, thisProjectPath))) {
                    command = `cd /data/git.kissneck.com/script/${thisProjectPath} && git pull`
                    consola.info(`exec ${command}`)
                    await pullCode(command)
                    consola.success(`${thisProjectURL} Pull Success`)
                    db.push("/map",{
                        [i * 100 + j]: true
                    },false);
                } else {
                    command = `git clone ${thisProjectURL} ${thisProjectPath} --progress`
                    consola.info(`exec ${command}`)
                    await cloneCode(command)
                    consola.success(`${thisProjectURL} Clone Success`)
                    db.push("/map",{
                        [i * 100 + j]: true
                    },false);
                }
            }
        }
    }
}

async function pullCode(command) {
    const { exec } = require('child_process');
    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                consola.error(`exec pullCode error: ${error}`);
                if (error.message.includes("no such ref")) {
                    resolve()
                }
            }
            consola.log(`stdout: ${stdout}`);
            if (stdout.includes("up-to-date")) {
                resolve()
            }
            consola.error(`stderr: ${stderr}`);
        });
    })
}

async function cloneCode(command) {
    const { exec } = require('child_process');
    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec cloneCode error: ${error.message}`);
                if (error.message.includes("处理 delta 中: 100%") || error.message.includes("空版本库")) {
                    resolve()
                }
            }
            if (stderr) {
                console.error(`exec cloneCode stderr: ${stderr}`);
                if (stderr.includes("处理 delta 中: 100%") || stderr.includes("空版本库") || stderr.includes("接收对象中: 100%")) {
                    resolve()
                }
            }
        });
    })
}

main()


