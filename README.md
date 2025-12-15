# Blog

- 源代码托管于 gitlab，自动同步到 GitHub
- 通过 Vercel 构建并部署 (`npm run deploy` / `sh build.sh`)

## install theme

> Theme folder is not in this repo by default. Run this command at the first time.

```sh
# 更新主题
# rm -rf themes/minos

git clone https://github.com/glenhoooo/hexo-theme-minos.git themes/minos
cp themes/minos/_config.example.yml themes/minos/_config.yml
# node init_script.js
```

## local dev

```sh
yarn serve # hexo s
```

## generate

```sh
yarn build # hexo g
```
