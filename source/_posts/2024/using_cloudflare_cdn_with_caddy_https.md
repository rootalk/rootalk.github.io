---
title: 使用 Cloudflare CDN 搭配 Caddy 的自动 HTTPS
date: 2024-12-30 18:26:30
updated: 2024-12-30 18:26:30
tag:
  - 网络
---

Caddy 默认的 HTTPS 支持与 Cloudflare CDN 配合使用时无法正常下发证书，这里介绍通过一定的配置让它们正常配合工作。

<!--more-->


## 一、Caddy cloudflare 模块

[Cloudflare module for Caddy](https://github.com/caddy-dns/cloudflare)：This package contains a DNS provider module for Caddy. It can be used to manage DNS records with Cloudflare accounts.

可以下载通过官方编译好的文件：https://caddyserver.com/download

替换已经安装的 `/usr/bin/caddy`

配置说明：https://github.com/caddy-dns/cloudflare/blob/master/README.md

配置时，可以创建两个独立的 token 分别包含权限 Zone.Zone:Read 和 Zone.DNS:Edit，也可以创建一个 token 包含前面提到的两个权限。

例如，在你的网站配置中加入：

```
tls {
    dns cloudflare {env.CF_API_TOKEN}
}
```

详细步骤可以参考[这篇文章](https://acytoo.com/ladder/set-caddy-cloudflare-cdn/)

## 二、示例配置

以 Vaultwarden + Caddy + Cloudflare 为例（Vaultwarden 通过 Docker 运行）：），

- Vaultwarden 暴露出 8080 端口
- Caddy 运行在宿主机
- Cloudflare 开启 CDN 指向服务器

参考 [vaultwarden/wiki](https://github.com/dani-garcia/vaultwarden/wiki/Proxy-examples), 配置如下：

```
{DOMAIN} {
	log {
		level INFO
		output file {LOG_FILE} {
			roll_size 10MB
			roll_keep 10
		}
	}

	encode zstd gzip

	reverse_proxy localhost:8080 {
		header_up X-Real-IP {http.request.header.Cf-Connecting-Ip}
	}

	tls {
		dns cloudflare {env.CF_API_TOKEN}
	}
}
```

其中，{DOMAIN}, {LOG_FILE} 和 {env.CF_API_TOKEN} 可以直接替换成自己的实际字符。
