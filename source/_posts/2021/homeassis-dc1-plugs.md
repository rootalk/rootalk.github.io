---
title: Homeassistant - 免拆机刷机将斐讯 DC1 插排接入 Hass
date: 2021-12-26 23:35:44
tag:
  - home-assistant
---
整合网络上的斐讯 DC1 + node-red + mqtt 教程

<!--more-->
![DC1](/images/2021/homeassistant_dc1.jpg)

网上大多教程是第一步让 DC1 配置入网，实际测试更好的步骤是先劫持 DC1 服务器域名。

## 我的环境

* 华硕路由器
* DC1插排

## 1. 配置网络环境

目标是让网络 wifi 中的域名 `smartplugconnect.phicomm.com` 指向 Homeassistant(HA) 服务器。

华硕路由器修改 hosts 的方法：

进入内部网络(LAN) -> DHCP 服务器

a、设置 DNS Server 1 为你路由器的地址

b、关闭 Forward local domain queries to upstream DNS 以防止您的私人DNS解析请求传递到Inertnet。

c、开启 ssh 功能

d、SSH 进入路由器控制台，新建或编辑文件 `/jffs/configs/dnsmasq.conf.add`

按实际情况修改对应的 IP 地址：

```
address=/.smartplugconnect.phicomm.com/192.168.50.xx
```

保存生效：

```sh
service restart_dnsmasq
```

e、验证方式：

在该网络下用电脑 `ping smartplugconnect.phicomm.com` 看指向 IP 是否正确。


## 2. 为 DC1 插排联网

使用大佬的工具即可：

https://github.com/flymyd/DC1ConnectUtil

* 先连接 dc1 的自带wifi
* 然后使用工具发送要连接的 wifi 信息即可

## 3. Hass 配置

参考： https://bbs.hassbian.com/thread-6726-1-1.html

* hass 安装 `node-red` addon
* 配置 node-red 插件：设置 `credential_secret`, `ssl` 为 false， 设置 `http_static` 用户名密码，用于登录后面的UI. 启动插件
* 进入node-red(NR)，菜单- 节点管理 - 搜索 `node-red-dashboard` 确认安装
* 修改自己的 nr 流文件：

https://github.com/Hinpc/static/blob/master/configfile/DC1_nodered%E6%B5%81%E7%A8%8B%E5%B8%A6%E5%BB%B6%E8%BF%9F.json

全局搜索 `84:F3:EB:55:79:98` 并修改为自己的 MAC 地址。

MAC地址可通过路由器查看，因为DC1联网后，在路由器管理页面可以找到。

* NR 中导入流并部署。**如果出现分组group错误，请更新保存一下重新部署**
* （可选） 进入 NR UI：在nr商店插件页面有个 webUI 按钮，点击进入即可。
* （可选）安装 node-red 集成：https://github.com/zachowj/hass-node-red
* （可选）重启后到集成中搜索 `Node-RED` 安装集成。
* 启动mqtt服务：编辑 configuration.yaml 添加如下内容后重启。

```
mqtt:
  broker: 192.168.50.xxx
  port: 1883
  username: mqtt
  password: mqtt
  discovery: true
```

* 安装官方插件：Mosquitto broker
* 配置插件：

```
logins:
  - username: mqtt
    password: mqtt
anonymous: true
customize:
  active: false
  folder: mosquitto
certfile: fullchain.pem
keyfile: privkey.pem
require_certificate: false
```

* 启动，然后看 NR 页面里，mqtt 节点已经绿色即表示联通了！还需要点击 mqtt 节点，修改安全 - 填入用户名密码 - 确定 - 重新部署。
* 进 hass 集成页面，可以看到一个集成叫 `configuration.yaml mqtt`，点选项可以测试 mqtt 服务， 可以看到发现了实体，就包含了 DC1 插座。


