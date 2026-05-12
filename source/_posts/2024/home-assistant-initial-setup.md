---
title: Home Assistant 安装后的一些初始设置
date: 2024-07-19 19:13:30
updated: 2024-07-19 19:13:30
tag:
  - home-assistant
---

<img src="/images/2024/hass-init-setup/cover.jpg" width="100%">

本文主要介绍在 Home Assistant 安装后的初始设置，包括常用插件和集成安装、主题美化以及 Lovelace 配置等内容。

<!--more-->

## 常用插件安装

1. 解决插件不显示的问题

当插件商店页面无法显示或者部分内容不显示时，通常是由于无法连接到 GitHub。可以通过将网关配置到软路由来解决这个问题。软路由的搭建和配置不在本文讨论范围内，您可以参考其他教程。关于如何在 Home Assistant 中配置静态 IP 和网关，可以参考[这篇文章](https://www.ymyc.site/archives/439/)，在网页中也可以通过修改网络配置项达到相同目的。

```sh
ha > login  # ha 命令行输入login
nmcli dev status   #查看当前网络

nmcli con edit "Supervisor enp6s18"   #改为自己的网口名字

print ipv4  #查看网络配置
set ipv4.addresses 192.168.50.211/24 # 设置ip
set ipv4.dns 192.168.50.10  # 设置DNS
set ipv4.gateway 192.168.50.10  # 设置网关
print ipv4 #查看修改后的网络配置
save #保存配置
quit #退出配置

nmcli con reload  #启用新的网络配置
```

2. SSH

对于使用本地终端的用户，官方插件 Terminal & SSH 就能满足需求。安装后，配置好用户名和密码，并记得修改默认端口（通常为 22）。重启插件后，即可从本地进行 SSH 连接。

3. Samba

启用 SMB 共享后，可以使用文件浏览器和本地编辑器来打开和编辑 HASS 的配置文件。首先安装 Samba share 插件，然后修改配置项中的用户名和密码（可以与登录账号和密码一致）。保存配置并启动插件后，即可实现文件共享。

## HACS

- 安装：参考官方文档 https://hacs.xyz/docs/setup/download/
- 集成推荐：https://github.com/justbin95/HA_Tutorials/wiki/All_in_HA

## 主题

1. 可以直接在 HACS 中搜索 `theme` 来查找喜欢的主题。推荐一个比较受欢迎的: [lovelace-ios-themes](https://github.com/basnijholt/lovelace-ios-themes)
2. 主题安装后，可以在左侧边栏点击 [用户名] 并选择主题，来应用一个已安装的主题。这里推荐深色主题 ios-dark-mode-dark-green-alternative。
3. 修改背景图的方法：在 `configuration.yaml` 的同一级创建文件 `lovelace-ui.yaml`，内容写入 `background: var(--background-image)`。然后修改 `themes/ios-theme` 下的 `ios-theme.yaml` 文件。找到你应用的主题名，比如 `ios-light-mode-blue-red-alternative`，修改下面的 `background-image` 值。可以参考[这个说明](https://github.com/basnijholt/lovelace-ios-dark-mode-theme/tree/master/backgrounds)以选择合适的背景图。

## Lovelace

1. HACS 搜索安装 `mushroom` 和 `button-card` 来扩展卡片
2. 合理使用垂直布局、水平布局、网格布局来排版


<br />
<br />
<br />

<small>
* 封面图来源：https://github.com/basnijholt/lovelace-ios-themes
</small>
