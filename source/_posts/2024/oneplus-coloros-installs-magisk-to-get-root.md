---
title: 一加 ColorOS 手动安装 Magisk 获取 root 
date: 2024-07-01 19:45:45
updated: 2024-07-01 19:45:45
tag:
  - 安卓
  - root
---

简要记录 ColorOS 13 获取 root 的过程。需要手机已解锁 Bootloader，电脑已安装 adb 和 fastboot，准备手机固件的全量包。

<!--more-->


## 一、前提条件

- 手机已解锁 Bootloader
- 电脑已安装 adb 和 fastboot
- 电脑已安装 Python3.6+ 环境
- 准备手机固件对应版本的全量包（示例使用的机型为：一加8Pro，系统版本为 ColorOS IN2020_13.1.0.190(CN01) F.74，全量包文件名：021b80f8051047d7b63dcc373f074969.zip）

## 二、安装 Magisk APP

[APP 下载地址](https://github.com/topjohnwu/Magisk/releases)

## 三、提取 boot.img

1. 解压 zip 全量包。这里注意一些解压软件可能会解压报错，可以尝试换几种解压软件。经测试 MacOS 使用 [Keka](https://www.keka.io) 可以正常解压。
2. 下载 [payload_dumper](https://github.com/vm03/payload_dumper) 项目
3. 将全量包解压出来的 `payload.bin` 移动到 payload_dumper 项目根目录
4. 在 payload_dumper 项目根目录执行如下命令：

```sh
# 安装依赖
pip install protobuf==3.20.3
pip install bsdiff4

# 解包
python payload_dumper.py payload.bin
```

5. 解包过程中可以中断，只要生成了 `output/boot.img` 即可。

## 四、patch boot.img

1. 将前面生成的 boot.img 复制到手机中，打开 Magisk，点击安装 – 选择 boot.img – 开始修补文件 – 修补完成(新生成的文件在 Download 目录)。可以参考[这里的文章](https://magiskcn.com/)
2. 将生成的 magisk_patched-xxx.img 文件复制到电脑中。

## 五、刷入 patched img

1. 关键状态下，长按`音量减 & 电源键` 10秒进入 fastboot，最终会停留在[这个界面](http://www.romleyuan.com:9001/attach/photo/5c86e2c5ce934b5d804d38de69fd2ae9.jpg)就表示处于 fastboot 模式中了。
2. 手机通过 USB 连接电脑。
3. 电脑终端运行如下命令（Windows 系统需要修改对应的 fastboot 命令）：

```sh
# 检测是否存在已连接的设备
fastboot devices
# 刷入
fastboot flash boot [magisk_patched-xxx.img 文件路径]
# 终端输出 Finished 表示成功
# 重启
fastboot reboot
```

4. 重启后打开 Magisk 查看版本信息，可能会要求重启设备做一些修复，按提示操作即可。
