---
title: 内网搭建 gitea 通过 Cloudflare Tunnel 在公网提供服务
date: 2025-07-03 20:04:03
updated: 2025-07-03 20:04:03
tag:
  - git
  - 网络
---

内网搭建 Gitea，结合 Cloudflare Tunnel，可轻松实现安全、便捷的公网访问，无需公网 IP。本文主要记录 Gitea 的 Docker 部署流程及 Cloudflare Tunnel 配置方法，助你快速将私有 Git 服务安全暴露到互联网。

<!--more-->

## 一、使用 Docker Compose 搭建 Gitea 服务

首先，使用如下配置文件通过 docker compose 启动 Gitea 服务：

```yaml
networks:
  cloudflared:
    name: cloudflared
    ipam:
      config:
        - subnet: 172.19.0.0/24

services:
  server:
    image: docker.gitea.com/gitea:1.24.2
    container_name: gitea_server_1
    environment:
      - USER_UID=1000
      - USER_GID=1000
      - GITEA__database__DB_TYPE=postgres
      - GITEA__database__HOST=db:5432
      - GITEA__database__NAME=key_for_gitea
      - GITEA__database__USER=key_for_gitea
      - GITEA__database__PASSWD=key_for_gitea
    restart: always
    networks:
      cloudflared:
        ipv4_address: 172.19.0.10
    volumes:
      - ./gitea:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3000:3000"
      - "222:22"
    depends_on:
      - db

  db:
    image: docker.io/library/postgres:14
    restart: always
    environment:
      - POSTGRES_USER=key_for_gitea
      - POSTGRES_PASSWORD=key_for_gitea
      - POSTGRES_DB=key_for_gitea
    networks:
      cloudflared:
        ipv4_address: 172.19.0.11
    volumes:
      - ./postgres:/var/lib/postgresql/data
```

上述配置中，我们创建了一个名为 cloudflared 的网络，后续会与 Cloudflare Tunnel 共享。Gitea 服务（静态IP）和数据库服务都运行在该网络下，方便后续的内网通信。

## 二、通过 Cloudflare Tunnel 实现公网访问

- 登录 Cloudflare 控制台
- 从菜单 `Zero Trust` > `Networks` > `Tunnels` 进入并点击 Create a tunnel
- 选择 Tunnel 类型为 `Cloudflared`
- 填写一个名称，例如：git-server
- Choose your environment 这里我使用 Docker
- 在“Install and run a connector”下方复制生成的命令
- 在搭建 Gitea 的服务器上运行上一步复制的命令。这里我们同样使用 docker compose 方式运行：

```yaml
services:
  cloudflared:
    image: cloudflare/cloudflared
    container_name: cloudflared
    environment:
      - TZ=Asia/Shanghai
      - TUNNEL_TOKEN=<your-token>
    restart: always
    command: tunnel --no-autoupdate run
    networks:
      cloudflared:
        ipv4_address: 172.19.0.234

networks:
  cloudflared:
    name: cloudflared
    ipam:
      config:
        - subnet: 172.19.0.0/24
```

- `cloudflared` 服务启动后，回到 Cloudflare Tunnel 管理页面
- 在“Public hostnames”下点击“Add a public hostname”
- 填写：`git-server.your-domain.com`，指向 `http://172.19.0.10:3000`
- 保存设置。

> 注意，这里 `172.19.0.10:3000` 指向的是 docker 容器的 IP 和端口，可以使用命令 `docker inspect <container_ID> | grep IPAddress` 查询到。

此时从公网访问 git-server.your-domain.com 即可打开你搭建的 Gitea 服务。

## 二、通过 Tunnel 使用 ssh

如果你尝试通过 `git clone git@git-server.your-domain.com:name/repo.git` 进行克隆，会发现 SSH 连接无法直接使用。我们还需要为 SSH 服务做额外配置：

- 进入前面创建的 Tunnel git-server，再新建一个 public hostname
- 填入：git-ssh.your-domain.com --> ssh://172.19.0.10:22
- 保存设置
- 在客户端进行 git 操作前，还需要配置 cloudflared
- 根据操作系统[下载客户端](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/#latest-release)
- 比如 macOS 使用：`brew install cloudflared`
- 安装后还需要配置 ssh 连接命令

```sh
vim ~/.ssh/config

# 添加内容
Host ssh.example.com
  ProxyCommand /usr/local/bin/cloudflared access ssh --hostname %h
```
- 现在即可通过 SSH 正常连接到内网的 Gitea 服务。