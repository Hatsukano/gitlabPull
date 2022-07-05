# gitlabPull
gitlab搬迁用代码,gitlab迁移,gitlab批量下载,gitlab批量clone。

# How To Use
1. clone this repo
2. cd to your directory

```bash
npm i
node pull
```

3.Wait until it finish.
4.In case of broken ssh pipes,you need to check the running state of this script.If that happens,you just run this script again.And the local database should have recorded which one you haved pulled/cloned.So this script will just ignore them,dont need to worry to pull or clone again.
