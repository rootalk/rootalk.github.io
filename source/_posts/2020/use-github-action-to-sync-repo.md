---
title: 使用 GitHub Action 同步仓库代码到 Gitee
date: 2020-12-19 16:14:01
tag:
  - GitHub
---
GitHub 账号被封过一段时间，所以记录一下代码备份方案。

<!--more-->

## 目录

- [hub-mirror-action](#hub-mirror-action)
- [说明](#说明)

## hub-mirror-action

使用到的 [Action](https://github.com/marketplace/actions/hub-mirror-action)，主页中已经详细介绍了用法。

## 说明

- 只想 push 后立即同步 .action.yml 所在的仓库，需要支持私有库同步。
- `GITEE_PRIVATE_KEY`: 也就是本地电脑的 `cat ~/.ssh/id_rsa` 的值。action 会把这个 key 视为对 **GitHub** 和 Gitee 都有效!（你需要确保已经把 `cat ~/.ssh/id_rsa.pub` 的值录入到 GitHub 和 Gitee 上）
- `clone_style`: 默认 http 方式 clone 私有库会失败。ssh 方式因为前面`PRIVATE_KEY`的存在便可行了。
- `static_list`: 实现只同步 .action.yml 所在的仓库。
- Gitee 这边不存在同名仓库时，会自动创建一个，并且是**公开**库（可以到 Gitee 设置页面修改为私有，不影响后期同步）。

`.github/workflows/gitee_sync.yml`:

```yml
name: Sync to Gitee
on: [ push ]
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
    - name: Black list
      uses: Yikun/hub-mirror-action@master
      with:
        src: github/gallenhu
        dst: gitee/gallenhu
        dst_key: ${{ secrets.GITEE_PRIVATE_KEY }}
        dst_token: ${{ secrets.GITEE_TOKEN }}
        clone_style: "ssh"
        static_list: ${{ github.event.repository.name }}
        force_update: true
        debug: true
        timeout: '1h'
```
