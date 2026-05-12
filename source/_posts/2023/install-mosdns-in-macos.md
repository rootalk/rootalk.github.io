---
title: Linux 和 macOS 平台配置 mosdns 为系统服务
date: 2023-05-20 19:35:16
updated: 2023-06-08 16:35:38
tag:
  - macOS
  - DNS
---

mosdns 是一个支持分流等功能的 DNS 转发器。在 mosdns wiki 文档中对系统服务安装方式说明不太详尽，主要是解决如何注册服务并设置为开机自动运行。

<!--more-->

本文记录的内容主要针对 mosdns v5 版本。

## 安装

下载[二进制文件](https://github.com/IrineSistiana/mosdns/releases)并授予执行权限 `chmod +x mosdns`

## 安装至系统服务

### Linux 平台

按照 mosdns 官方文档 `mosdns service install` 的方式测试无法正常运行。参考另一个知名软件的[配置文档](https://dreamacro.github.io/clash/introduction/service.html)实测可用：

```sh
cp mosdns /usr/local/bin
# 创建配置文件
cp config.yaml /etc/mosdns/
touch /etc/mosdns/hosts
```

运行测试一次：

```sh
/usr/local/bin/mosdns start -c /etc/mosdns/config.yaml -d /etc/mosdns
```

新建服务 `/etc/systemd/system/mosdns.service`：

```
[Unit]
Description=mosdns daemon, DNS server.
After=network-online.target

[Service]
Type=simple
Restart=always
ExecStart=/usr/local/bin/mosdns start -c /etc/mosdns/config.yaml -d /etc/mosdns

[Install]
WantedBy=multi-user.target
```

reload systemd:

```sh
systemctl daemon-reload
```

设置开机启动：

```
systemctl enable mosdns
```

启动服务：

```
systemctl start mosdns
```

查看日志

```
systemctl status mosdns
journalctl -xe
```

### macOS 平台

需要使用管理员权限执行：

```
sudo mosdns service install -d 工作目录绝对路径 -c 配置文件路径
```

安装完成后可以看到注册的服务：

```
cat /Library/LaunchDaemons/mosdns.plist
```

修改 `RunAtLoad` 的值为 `true`

启动：

```sh
sudo mosdns service start
```

此时很可能因为权限报错，参考 [[BUG] macOS 下 mosdns -s 安装成系统服务因权限问题不启动 · Issue #357 · IrineSistiana/mosdns](https://github.com/IrineSistiana/mosdns/issues/357)

解决方式为：

进入系统偏好设置 - 安全性与隐私 - 隐私 - 完全磁盘访问权限 - 加入 mosdns 文件。

重新执行启动命令，显示服务状态为 running 表示已正常启动。

电脑重启后查看进程是否存在：

```sh
ps -ef | grep mosdns
```

如果修改了配置需要重启服务：

```sh
sudo mosdns service restart
```

## 分流配置

[https://github.com/IrineSistiana/mosdns/discussions/605](https://github.com/IrineSistiana/mosdns/discussions/605)

创建自定义 hosts 文件，并根据实际情况调整配置中的 txt 文件路径。
