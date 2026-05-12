---
title: Homeassistant - 使用小爱音箱控制 Hass 设备
date: 2022-01-08 23:37:45
tag:
  - home-assistant
  - NodeRed
---
使用小爱音箱 + 小爱开放平台技能开发 + NodeRed 控制 Homeassistant 的设备。

<!--more-->

很多内容基于网上大神的基础总结而来。

## 小爱开放平台

配置参考视频：https://www.bilibili.com/video/BV1Xy4y1i79c

注意的是，

1. 修改 `调用名称`, `语料`后可能会有些延迟才生效？最好把一个一个的下一步都点一遍。
2. 需要提供 https 的调用网址，参考：https://www.bilibili.com/video/BV19h411f7dp 以及之前的文章有说配置 https （实际就是起一个 https 服务，可以非 443 端口，可以 Nginx 代理，也可以程序自己启动 https 服务。用端口映射过去就能访问）。
3. 官网网页提供调试。调试实际就是通过`调用名称`激活/启动自定义命令，然后自定义命令只要命中`语料`，就会调用自己提供的 https 接口服务。大佬提供的 `conversation` 只是帮我们启动了一个服务并内置了一些命令解析。

## 小爱自定义技能接入到 NodeRed

* NodeRed - 节点管理 - 安装 `node-red-contrib-home-assistant-websocket` - `node-red-contrib-xiaoai-tts` （已安装直接下一步）
* 添加节点 - events:state 监听状态改变 - 设置属性：Entity ID 为 `conversation.voice` （语音助手的实体ID）
* 添加节点 - switch - 通过 `payload` 自定义后续事件
* 为了防止这种情况： state change 后，我们的智能设备实际没有变化，我们又发请求 change 同样的 state，此时 state 没有变化就监听不到。
* 所以在监听状态改变后，增加节点 - 延迟 2s - call API - 设置属性：HTTP POST，path:/api/states/conversation.voice, data: {"state":"waiting"}
* 也就是每次状态改变后我们把状态重置一下，下一次下命令就肯定会 state change 了。

![NodeRed](/images/2022/hass_xiaoai.jpg)