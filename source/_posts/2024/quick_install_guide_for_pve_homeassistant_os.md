---
title: PVE 虚拟机快速安装 HomeAssistant OS 教程
date: 2024-07-16 19:47:24
updated: 2024-07-16 19:47:24
tag:
  - PVE
  - 智能家居
---

<img src="/images/2024/pve-haos/cover.png" width="100%">

本文主要介绍了如何在 PVE 虚拟机上快速安装 HomeAssistant OS，入门智能家居控制中心。

<!--more-->

## 一、下载安装包

下载 `.qcow2.xz` 后缀的安装包，注意区分架构，HassOS 发布地址：https://github.com/home-assistant/operating-system/releases

## 二、传输文件到 PVE

传输的方式有很多，我使用的方式是，局域网本地（MacOS 或 Linus）启动 HTTP 服务：

```sh
cd ~/Downloads
python3 -m http.server
```

然后进入 PVE shell，通过 wget 下载：

```
wget [你本地电脑ip]:8000/haos_ova-12.4.qcow2.xz
```

当然也可以直接在 PVE 中 `wget` Github 的下载链接。

## 三、创建 PVE 虚拟机

除了以下说明的地方，其他都可以按默认选择直接下一步：

1. 设置名称

![设置名称](/images/2024/pve-haos/1.png)

2. 操作系统选择：不使用任何介质

![操作系统](/images/2024/pve-haos/2.png)

3. 根据硬件情况选择 CPU。内存可以保持默认的 2G。

![CPU](/images/2024/pve-haos/3.png)

## 四、挂载磁盘

1. 先将创建虚拟机时附带的磁盘分离：

![磁盘](/images/2024/pve-haos/4.png)

分离后再点击磁盘就能看到删除按钮，点击删除。

2. 将第一、二步下载的 qcow2 文件作为磁盘挂载到虚拟机。具体步骤如下：

下载并传输到 PVE 中的文件是 `.xy` 后缀的压缩文件，先要到 PVE shell 中做解压操作

```sh
xz -dk haos_ova-12.4.qcow2.xz
```

解压后得到 haos_ova-12.4.qcow2 文件，再执行

```sh
qm importdisk 106 haos_ova-12.4.qcow2 local-lvm
```

(请将 106 替换成你刚刚创建的虚拟机的 ID)

## 五、虚拟机配置

1. 回到虚拟机 - 硬件，可以看到一个未使用的磁盘。选中后点击上方编辑，弹窗按默认选择，最后点击添加。
2. 虚拟机 - 硬件 - BIOS，修改为 UEFI。
3. 虚拟机 - 选项 - 引导顺序，仅勾选刚刚添加的磁盘（scsi0）
4. （可选）虚拟机 - 选项 - QEMU Guest Agent，勾选 “使用 QEMU Guest Agent”，这样的话虚拟机启动后可以在概要中看到 IP 地址。

## 六、启动虚拟机

启动并等待初始化工作完成，视网络情况可能会耗时较长。访问 http://虚拟机 ip:8123 可以看到配置界面表示安装成功。
