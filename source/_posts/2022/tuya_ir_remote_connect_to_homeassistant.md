---
title: 涂鸦万能遥控接入 home-assistant
date: 2022-05-28 16:29:36
updated: 2022-05-28 16:29:36
tag:
  - home-assistant
  - 涂鸦
---
利用涂鸦智能 APP 的场景功能，配合涂鸦的 IoT 平台，将遥控器控制的设备接入 home-assistant。

<!--more-->

## 创建场景

在涂鸦智能 APP (中国大陆版) 中添加遥控设备，这个不做讲解。
设备加入后，创建场景 - 一键执行，选择要执行的任务。

## 关联设备

进入[涂鸦 IoT 平台](https://iot.tuya.com/)，选择左侧菜单的“云开发” - 云开发。

创建云项目 - 开发方式选择“全屋智能”，数据中心选择“中国数据中心”。

![](/images/2022/tuya_lot_1.jpg)

进入项目 - 选择设备 - 关联涂鸦APP账号。注意右上角切换数据中心。

![](/images/2022/tuya_lot_2.jpg)

然后切至“概况”记下`Access ID/Client ID` 和 `Access Secret/Client Secret`

## Home Assistant

HASS 中，集成 - 添加集成 - 搜索 `tuya` - 进入配置 - 选择国家 - 接入 ID 填上一步的 `Access ID`，接入密钥填上一步的 `Access Secret`, 用户名和密码是涂鸦智能 APP 的登录账号和密码。

确认提交后便能看到之前创建的场景。
