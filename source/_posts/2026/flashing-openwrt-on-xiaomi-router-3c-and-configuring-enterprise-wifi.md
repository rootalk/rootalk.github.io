---
title: 小米路由器3c刷 OpenWrt 并配置连接企业 WPA2/WPA3 Enterprise Wi-Fi
date: 2026-05-12 18:08:00
updated: 2026-05-12 18:08:00
tag:
  - 网络
---

本文记录将旧设备小米路由器3c刷 OpenWrt 系统，并配置连接企业 WPA2/WPA3 Enterprise 认证 Wi-Fi 的过程。

<!--more-->

## 一、刷机

### 1.刷入官方开发版固件

直接在路由器后台手动升级，固件[下载地址](http://bigota.miwifi.com/xiaoqiang/rom/r3l/miwifi_r3l_firmware_5e1a6_2.13.7.bin)

### 2.开启 telnet

其他教程都是使用 Windows 系统运行 `patches/0.start_main.bat`，我这里使用的 MacOS，于是让 LLM 改了一个 MacOS 可以运行的版本，新建 `main.py` 内容如下：

```python
import sys
import re
import time
import random
import hashlib
import requests
import subprocess

# 1. 获取网关 IP (针对 macOS 修改)
try:
    # macOS 使用 traceroute，-n 不解析域名，-m 1 最大跳数为 1
    output = subprocess.check_output(["traceroute", "-n", "-m", "1", "1.1.1.1"]).decode()
    # 在输出中匹配第一个出现的 IP 地址
    router_ip_address = re.findall(r'\d+\.\d+\.\d+\.\d+', output)[-1] 
    print(f"Detected Router IP: {router_ip_address}")
except Exception as e:
    print(f"Failed to get router IP: {e}")
    sys.exit(1)

# 2. 访问路由器页面获取关键信息
try:
    r0 = requests.get(f"http://{router_ip_address}/cgi-bin/luci/web", timeout=5)
except:
    print("Xiaomi router not found...")
    sys.exit(1)

try:
    mac = re.findall(r"deviceId = '(.*?)'", r0.text)[0]
    key = re.findall(r"key: '(.*?)',", r0.text)[0]
except IndexError:
    print("Could not find deviceId or key. Is this a compatible Xiaomi router?")
    sys.exit(1)

# 3. 加密计算密码
nonce = f"0_{mac}_{int(time.time())}_{random.randint(1000, 10000)}"
password_input = input("Enter router password: ")
account_str = hashlib.sha1((password_input + key).encode('utf-8')).hexdigest()
password_final = hashlib.sha1((nonce + account_str).encode('utf-8')).hexdigest()

# 4. 登录获取 stok
data = {
    "username": "admin",
    "password": password_final,
    "logtype": "2",
    "nonce": nonce
}

r1 = requests.post(
    f"http://{router_ip_address}/cgi-bin/luci/api/xqsystem/login",
    data=data,
    headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    }
)

try:
    stok = re.findall(r'"token":"(.*?)"', r1.text)[0]
    print(f"Success! stok: {stok}")
except IndexError:
    print("Login failed. Check your password.")
    sys.exit(1)

# 5. 上传配置文件 (请确保当前目录下有 data/main.tar.gz)
print("Start uploading config file...")
try:
    with open("data/main.tar.gz", 'rb') as f:
        upload_url = f"http://{router_ip_address}/cgi-bin/luci/;stok={stok}/api/misystem/c_upload"
        requests.post(upload_url, files={"image": f})
except FileNotFoundError:
    print("Error: 'data/main.tar.gz' not found.")
    sys.exit(1)

# 6. 触发漏洞开启 telnet/ftpd
print("Run telnet+ftpd...")
requests.get(f"http://{router_ip_address}/cgi-bin/luci/;stok={stok}/api/xqnetdetect/netspeed")

print("Done. You can now try to telnet into the router.")
```

运行前的准备：

- 可能需要将代码中的 `1.1.1.1` 改为路由器的 IP
- 确保你的 macOS 已安装 requests 库：`pip3 install requests`。
- 确保脚本运行目录下存在 `data/main.tar.gz` 文件。（[下载地址](https://1drv.ms/f/c/32f48b14a53ccfc5/IgDjmDJEt4ZXRJSi9P63c3_WAR0LTepEYZvG_YZXI78vJlo?e=xHZcIW)，密码:1111）
- 运行脚本：`uv run main.py` 或者 `python3 main.py`。

### 3.Telnet 连接并刷入 Breed

建议网线连接路由器，假定路由器的 IP 为 192.168.31.1

```sh
telnet 192.168.31.1
# 用户名: root
```

- 输入 `cat /proc/mtd` 查看分区信息，确定包含 `Bootloader`
- 下载 breed.bin （[下载地址](https://1drv.ms/f/c/32f48b14a53ccfc5/IgDjmDJEt4ZXRJSi9P63c3_WAR0LTepEYZvG_YZXI78vJlo?e=xHZcIW)，密码:1111）
- 输入 `mtd write /tmp/breed.bin Bootloader`，将 breed.bin 刷入到 Bootloader 分区
- 进入 breed：长按路由器背后的 reset 键约5秒，打开浏览器，地址栏输入 192.168.1.1，进入 Breed Web 恢复控制台
- 在 Breed 界面中，**备份 EEPROM**

### 4.刷入 OpenWrt 固件

- telnet 进入 192.168.1.1
- 通过 wget 下载固件 `openwrt-22.03.3-ramips-mt76x8-xiaomi_miwifi-3c-squashfs-sysupgrade.bin`。（[下载地址](https://1drv.ms/f/c/32f48b14a53ccfc5/IgDjmDJEt4ZXRJSi9P63c3_WAR0LTepEYZvG_YZXI78vJlo?e=xHZcIW)，密码:1111）(我测试使用OpenWrt官网最新的固件无法成功启动到 web 界面，原因不明) "注意查看下载完成后路由器返回的信息，记下固件大小 0x5c0133 和固件保存位置 0x80000000 这两个信息。"

![breed](/images/2026/breed_wget.png)
<center><span style="font-size:12px">图片来源：www.cnblogs.com/snoopy1866/p/17278237.html</span></center>
<br />

- "输入 `flash erase 0x140000 0x600000` 擦除 flash 原有数据。这里的 0x140000 表示 firmware 的地址，可以在 OpenWrt 官方的设备详情页面查看 openwrt.log 获取，0x600000 表示设定空间大小，这个空间大小必须大于固件大小 0x5c0133。"
- "输入 `flash write 0x140000 0x80000000 0x600000` 写入固件，这行命令的意思是在地址 0x140000 处将保存在 0x80000000 位置的固件写入到已分配好的空间 0x600000 中。"
- 输入 `boot flash 0x140000` 重启路由器，这行命令的意思是在 0x140000 处启动固件
- 查看路由器指示灯，当指示灯由黄灯闪烁变为蓝灯时，浏览器地址栏输入 192.168.1.1，如果成功进入 openwrt 登录界面，代表固件已经成功刷入并启动了。此时先不着急配置网络，按住路由器的 reset 键插上电源，进入 breed
- **设置 Breed 环境变量**
- 在 Breed 界面中，启用环境变量功能，位置选择 Breed 内部，点击设置，然后选择重启使设置生效
- 再次进入 Breed 界面，编辑环境变量，增加字段 autoboot.command，值设为 boot flash 0x140000，表示从 0x140000 处启动固件，再次重启路由器
- 通过浏览器输入 192.168.1.1 进入 OpenWrt 后台管理界面，初始会要求设置 root 密码。
- “点击 System → Backup/Flash Firmware → Flash new firmware image，将刚刚刷入的 OpenWrt 再重新刷写一遍，然后点击 System → Reboot，重启路由器。这一步是为了将运行在 ram 中的固件真正地写入 rom 中，防止重启路由器后配置丢失。”


## 二、配置网络实现无线中继

- **准备一条网线连接 lan 口进行网络配置**
- 将路由器先连接上外网可以避免很多问题

### 1.路由器作为 client 连接外网

- 打开“网络”-“无线”-找“radio0”-"扫描"
- 加入网络，注意，接口配置中的模式为客户端(Client)
- 加入的网络可以是 GUEST 网页认证方式，客户端连接上 OpenWrt 网络后打开网页一样认证

### 2.安装完整版 wpad

- OpenWrt 官方镜像默认的 wpad-basic 无法连接企业的 WPA2/WPA3 Enterprise Wi-Fi
- SSH 进入路由器
- `opkg update`
- 先下载 wpad-openssl(防止卸载 wpad-basic 后断网)：`opkg download wpad-openssl`
- 此时下载了一个 `.ipk` 文件
- `opkg remove wpad-basic`
- 安装刚刚下载的文件
- `opkg install wpad-openssl_xxxxxxxx.ipk`

### 3.OpenWrt 连接到企业 Wi-Fi

- “网络”-“无线”-“扫描”
- 选择并加入网络
- 如果你平时是用“工号/邮箱 + 密码”登录的，大概率是这个配置：
- EAP Method: PEAP
- Auth (Phase 2): MSCHAPV2
- Identity: 你的用户名（工号或邮箱）

![配置](/images/2026/eap-wifi-config.png)

### 4.OpenWrt创建自己的 Wi-Fi 热点

- 回到 网络 -> 无线 页面
- 点击 添加 按钮
- 模式 选择 Access Point
- 设置 ESSID
- 切换到安全
- Encryption 选择 `WPA2-PSK`
- 输入 Key （WI-FI密码）
- 保存

### 5.（可选）配置 DHCP DNS 和禁用 IPv6

**DNS 配置：**

- 导航到 网络 (Network) -> 接口 (Interfaces)
- 找到 LAN 接口，点击右侧的 修改 (Edit)
- 找到 DHCP 服务器 (DHCP Server) 区域 - 高级设置 (Advanced Settings)
- 找到 DHCP 选项 (DHCP-Options) 输入框：`6,223.5.5.5,223.6.6.6`
- (注：6 代表 DNS 选项，后面的 IP 是你希望下发的 DNS 地址，用逗号隔开)
- 保存并应用 (Save & Apply)

**禁用 IPv6**

- 导航到 网络 (Network) -> 接口 (Interfaces)
- 找到名为 WAN6 的接口，点击右侧的 删除 (Delete)，并保存
- 回到 接口 (Interfaces) 列表，找到 LAN 接口，点击右侧的 修改 (Edit)。
- 在 基本设置 (General Setup) 选项卡中，找到 IPv6 分配长度 (IPv6 assignment length)，将其设置为 已禁用 (disabled)。
- 找到 DHCP 服务器 (DHCP Server) 区域，点击 IPv6 设置 (IPv6 Settings)
- 禁用：路由通告服务 (Router Advertisement-Service / RA Service)
- 禁用：DHCPv6 服务 (DHCPv6-Service)
- 禁用：NDP 代理 (NDP-Proxy)
- 保存并应用 (Save & Apply)

## 参考内容

- https://www.debugmi.com/article/43
- https://www.hyh0.com/?p=238