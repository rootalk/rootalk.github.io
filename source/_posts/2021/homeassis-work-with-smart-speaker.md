---
title: Homeassistant - 使用智能音箱控制 Hass 设备
date: 2021-12-26 00:51:18
tag:
  - home-assistant
---
使用天猫精灵或者小度音箱来控制家里已经接入 Homeassistant 的设备。

<!--more-->

![](/images/2021/havcs-devices.jpg)

我的环境：

* HassOS: core-2021.11.1
* 动态公网IP
* 小度音箱

## 1. 使用 https 访问 hass

1.1 我使用的是官方插件 NGINX Home Assistant SSL proxy，配置内容是：

```
domain: your.domain.com
certfile: fullchain.pem
keyfile: key.pem
hsts: max-age=31536000; includeSubDomains
cloudflare: false
customize:
  active: false
  default: nginx_proxy_default*.conf
  servers: nginx_proxy/*.conf
```

证书文件放到 `/ssl/` 目录下，我的证书文件名分别是 fullchain.pem, key.pem。
网络设置部分 443 端口保持不变。

然后修改 configuration.yaml 加入内容：

```
http:
  use_x_forwarded_for: true
  trusted_proxies:
    - 172.30.33.0/24
```

1.2 配置路由器端口映射/端口转发

（注意，部分运营商会封锁 80 和 443 端口。）

* 外网:8123 --- 内网hass的ip:443

配置完成外网访问的地址是：

https://your.domain.com:8123

能正常访问到自家的 hass 则第一步成功。

## 2. havcs 插件

2.1 下载插件到 custom_components 并重启 hass：

https://github.com/cnk700i/havcs

2.2 添加配置文件内容到 configuration.yaml

其中，clients 下面是自定义的 key 和 secret，后面配置集成的时候会用到

```
havcs:
  platform:
    - dueros

  http:
    clients:
      dueros123: 123456
  device_config: ui
```

参考：https://ljr.im/articles/plugin-smart-speaker-access-home-assistant-integration-plusplus/

2.3 保存重启 hass

2.4 进入集成 - 搜索 havcs 添加 - **使用方案1** - 填入前面配置文件里自定义的 key 和 secret

2.5 检查 开发者工具——>服务——>havcs.reload 存在，则表示 havcs 部署成功

3. 智能音箱开发平台（以小度为例）

其他音箱参考：

https://ljr.im/

3.1 百度云技能：https://dueros.baidu.com/open
  * 登陆百度云账号。注意，一定是我们智能音箱绑定的账号
  * 选择“技能开放平台”，拉到底“立即体验”。
  * 创建“技能”，“智能家居”

  弹出的表单填写方法参考：https://ljr.im/articles/plugins-havcs-edible-instructions/

  使用 `#方案一 使用HA自带的授权页面 v3版` 的填写方法

```sh
#授权页面网址
https://{你的域名及端口}/auth/authorize

#Token页面网址
https://{你的域名及端口}/havcs/auth/token

#WebService（服务网关）网址
https://{你的域名及端口}/havcs/service

#Client Id，填回调（重定向）地址域名那一串即可（HA要求格式）
小度：https://xiaodu.baidu.com
天猫：https://open.bot.tmall.com
叮咚：https://alphadev.jd.com

#Client Secret
随便填写，不做校验
```

点击保存 - 授权 - 会跳转到我们自己搭建的公网地址，登录 - 授权

**注意，这时候可能会授权失败，经测试，重新授权几次又成功了**

## 3. havcs 配置

hass 的左侧菜单有了 `HAVCS设备` 一项，进入点 `添加设备`，内容实际就是把 hass 实体跟 havcs 实体绑定, 然后同步给音箱。
添加完点“同步设备”，小度app上就能看到设备了。

## 参考

* https://ljr.im/articles/plugins-havcs-edible-instructions/
* https://bbs.hassbian.com/thread-9309-1-1.html