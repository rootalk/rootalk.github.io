---
title: Vue CLI 升级到 v5 以及 Webpack5 缓存配置
date: 2023-02-17 10:48:05
updated: 2023-02-17 10:48:05
tag:
  - vue
  - 前端开发
---
Vue2 项目为优化构建速度，将`vue/cli-service`从 v4 升级到 v5，并配置 webpack5 的持久化缓存。

<!--more-->

## Vue CLI

1. 升级依赖项 `@vue/cli-xxx` 到 v5.x.x。如果是 Vue2.7 应该不低于 5.0.6（`~5.0.6`）
2. 升级 `eslint` 到最新版本（8+）

## Typescript

1. 升级 `@typescript-eslint/eslint-plugin` 到最新版本（5+）

## Webpack 持久化缓存

如果之前使用了 `hard-source-webpack-plugin`，它只适用于 webpack v4，应该移除此依赖。

在 Vue 项目中开启 Webpack 持久化缓存：

```js
// vue.config.js
module.exports = {
  configureWebpack: {
    cache: {
      type: "filesystem",
    },
  }
}
```

更多的配置项可以参考：https://webpack.js.org/configuration/cache/

## Webpack 资源模块

如果之前用到了 `raw-loader`、 `url-loader`、 `file-loader`，现在应该替换为使用[资源模块(asset module)](https://webpack.docschina.org/guides/asset-modules/)

## 参考

* https://blog.vuejs.org/posts/vue-2-7-naruto.html
