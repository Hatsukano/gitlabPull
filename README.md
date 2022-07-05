# gitlabPull
gitlab搬迁用代码,gitlab迁移,gitlab批量下载,gitlab批量clone。

# How To Use
__I didnt run on other language bashes.So you need to configure the success requirement of async function cloneCode__

1. clone this repo And configure your gitlab and clone infos in the scirpt from line 12 to line 14.
2. cd to your directory And run commands

```bash
npm i
node pull
```

3. Wait until it finish.
4. In case of broken ssh pipes,you need to check the running state of this script.If that happens,you just run this script again.And the local database should have recorded which one you haved pulled/cloned.So this script will just ignore them,dont need to worry to pull or clone again.

# 如何使用
1. 克隆这个 repo 并在第 12 行到第 14 行的脚本中配置你的 gitlab 和要求。
2. cd 到你克隆的目录下并运行命令

```bash
npm i
node pull
```

3. 等待完成。
4. 为了防止 ssh 管道损坏导致代码拉取中断，你需要检查此脚本的运行状态。如果发生这种情况，你只需要再次运行此脚本即可。本地数据库应该已经记录了你拉取/克隆过的仓库。这个脚本再次运行时会忽略它们，无需担心再次拉取或克隆。
