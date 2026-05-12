---
title: 安卓7以上版本安装 Charles 证书进行 HTTPS 抓包的方法
date: 2024-03-24 21:38:29
updated: 2024-03-24 21:38:29
tag:
  - 安卓
  - 抓包
---

有几年没做移动端开发了，发现 Android 7 以上版本即使安装了 Charles 导出的证书也无法解析 HTTPS 请求，最终 root 手机后找到了解决方法。主要是如何安装证书到系统证书目录。

<!--more-->

## 方案一：将 Charles 证书导入到系统证书目录

参考文章：[charles系统证书安装](https://aaaaaandy.github.io/blog/2021/02/01/charles/charles%E7%B3%BB%E7%BB%9F%E8%AF%81%E4%B9%A6%E5%AE%89%E8%A3%85/)

本人测试时，因为手机系统原因（不确定是否是因为 KernelSU 的 root 方式），无法在 adb shell 中切换到 root 权限，因此找到了方案二。

## 方案二：Trust User Certs

[NVISOsecurity/MagiskTrustUserCerts: A Magisk/KernelSU module that automatically adds user certificates to the system root CA store](https://github.com/NVISOsecurity/MagiskTrustUserCerts)

首先按照常规方式安装证书（导出 .pem 文件，在设置中手动安装用户证书），在安装模块后，重启手机即可（重启的过程中会复制证书到系统证书目录）。经测试 Charles 可以正常解析 HTTPS 请求及响应。

#### Android手机安装证书

来源：https://www.cnblogs.com/tianpin/p/17503604.html

**小米手机**

一.使用QQ浏览器下载证书，证书格式未pem，无法直接打开，可以查看“详情”，在QQ浏览器里找到该文件，并移动到一个自己能记住的目录。

现在的**小米、华为**等设备，安装证书的正确步骤是：
1.chls.pro/ssl 下载证书
2.进入到设置-wifi，点击高级，安装证书

二.按照路径找到刚刚移动的pem文件，起一个文件名，即可安装成功。
 

**OPPO手机**

设置——密码与安全——系统安全——凭据存储——从存储设备安装证书


**vivo手机**

设置——安全——更多安全设置——从手机存储安装——CA证书

## HttpCanary 小黄鸟抓包

HttpCanary 3.3.6

1. 进入设置中心，导出根证书
2. 使用上一节中 Magisk Trust User Certs 安装证书到系统证书目录
3. 目标应用-选择抓包应用
4. 抓包
