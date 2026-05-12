---
title: 斐讯 DC1 拆机后接入 home-assistant
date: 2022-11-01 09:50:33
updated: 2022-11-01 09:50:33
tag:
  - home-assistant
  - 智能家居
---
斐讯 DC1 拆机后刷入固件并接入 home-assistant 相关资源。

<!--more-->

## 固件及刷机教程

参考：[https://github.com/qlwz/esp_dc1](https://github.com/qlwz/esp_dc1)

## 如何配网

1、第一次使用自动进入配网模式

2、以后通过长按【总开关】进入配网模式（连接插座共享出来的 WiFi 网络）

## 接入 HomeAssistant

1、HomeAssistant 中配置 MQTT 服务：[HomeAssistant集成mosquitto broker，实现收发MQTT消息-哔哩哔哩](https://b23.tv/o0kpoCS)
2、修改MQTT设置中的：地址、用户名、密码，保存连接
3、WEB页面开启MQTT自动发现
4、稍等一会就可以在实体列表中看到 DC1 插座了

## Lovelace 卡片

参考：[https://github.com/fineemb/lovelace-dc1-card](https://github.com/fineemb/lovelace-dc1-card)
