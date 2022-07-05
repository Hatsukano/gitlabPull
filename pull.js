const consola = require("consola");
const path = require("path")
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');
const { default: axios } = require("axios")
const db = new JsonDB(new Config("myDataBase", true, false, path.resolve(__dirname,'/')));
const exec = util.promisify(require('child_process').exec);
const fs = require('fs-extra')
const util = require('util');

// 配置项
const gitlabAddr = '' // gitlab地址
const gitlabToken = '' // gitlabToken
const num = 10 // 拉取 num * 100 = 1000个代码仓库

// 第一次运行时初始化数据库
try{
    db.getData("/first");
}catch(err){
    let arr = new Array(1000).fill(1)
    let map = {}
    arr.forEach((i,idx) => {
        map[idx] = false // 未拉取的全部标记为false
    })
    db.push("/map",map);
    db.push("/first",true);
}

async function main() {
    console.log('main')
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
                consola.info(`正在处理[${i * 100 + j + 1}/${(i + 1) * 100}]`)
                let project = projects[j]
                thisProjectURL = project['ssh_url_to_repo']
                thisProjectPath = project['path_with_namespace']
                if (fs.pathExistsSync(path.resolve(__dirname, thisProjectPath))) {
                    command = `cd /data/git.kissneck.com/script/${thisProjectPath} && git pull`
                    consola.info(`exec ${command}`)
                    await pullCode(command)
                    consola.success(`${thisProjectURL} 更新完毕`)
                    db.push("/map",{
                        [i * 100 + j]: true
                    },false);
                } else {
                    command = `git clone ${thisProjectURL} ${thisProjectPath} --progress`
                    consola.info(`exec ${command}`)
                    await cloneCode(command)
                    consola.success(`${thisProjectURL} 拉取完毕`)
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
                console.error(`exec pullCode error: ${error}`);
                if (error.message.includes("no such ref")) {
                    resolve()
                }
            }
            console.log(`stdout: ${stdout}`);
            if (stdout.includes("up-to-date")) {
                resolve()
            }
            console.error(`stderr: ${stderr}`);
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


