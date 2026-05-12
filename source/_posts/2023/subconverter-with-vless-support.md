---
title: 支持 VLESS 的 subconverter
date: 2023-12-11 13:49:59
updated: 2023-12-11 13:49:59
tag:
  - 科学上网
---

原版的 [subconverter](https://github.com/tindy2013/subconverter) 不支持 VLESS 协议，根据[相关 issue](https://github.com/tindy2013/subconverter/issues/611)找到了支持 VLESS 协议的方法。

<!--more-->

根据[提示](https://github.com/tindy2013/subconverter/issues/611#issuecomment-1615503005)使用[改版的 subconverter](https://github.com/MetaCubeX/subconverter) 搭建服务作为后端地址即可。为了更快速的搭建，我构建并推送了 [Docker 镜像](https://hub.docker.com/repository/docker/hvanke/subconverter-meta/general)，你可以使用以下 `docker-compose` 配置一键部署。担心安全问题的话也可以通过[源代码](https://github.com/GallenHu/subconverter)自行构建。

---

```yaml
# docker-compose.yml
version: "3"
services:
  subconverter:
    image: hvanke/subconverter-meta:latest
    container_name: subconverter-meta
    restart: unless-stopped
    ports:
      - 25500:25500
```
