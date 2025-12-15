---
title: 在 macOS 上通过脚本管理 OpenVPN CLI
date: 2025-12-15 18:28:39
updated: 2025-12-15 18:28:39
tag:
  - 网络
---

在 macOS 上通过 Homebrew 安装 OpenVPN 后，确实不像 GUI 客户端那样直观，为了关联自动化让大模型写了一份 Shell 管理方案。

<!--more-->

## 一、创建脚本

前提条件：

- OpenVPN 已安装：`brew install openvpn`
- 基础命令能运行：`sudo openvpn --config ~/Downloads/myvpn.ovpn`

创建脚本 `~/Downloads/ovpn.sh` 并修改 CONFIG_FILE 的路径为你实际 .ovpn 文件的路径:

```bash
#!/bin/bash

# --- 配置区域 ---

# 1. 你的 .ovpn 配置文件路径
CONFIG_FILE="$HOME/openvpn/client.ovpn"

# 2. 你的账号密码文件路径
PASS_FILE="$HOME/openvpn/pass.txt"

# 3. PID 文件 (用于管理进程)
PID_FILE="/tmp/openvpn_script.pid"

# 4. 日志文件
LOG_FILE="/tmp/openvpn_script.log"

# --- 功能函数 ---

start_vpn() {
    # 检查密码文件是否存在
    if [ ! -f "$PASS_FILE" ]; then
        echo "❌ 错误: 找不到密码文件: $PASS_FILE"
        echo "请创建一个包含两行(用户名/密码)的文本文件。"
        exit 1
    fi

    if [ -f "$PID_FILE" ]; then
        echo "⚠️  OpenVPN 似乎已经在运行 (PID: $(cat $PID_FILE))。"
        echo "如果确定未运行，请删除 $PID_FILE 后重试。"
    else
        echo "🚀 正在启动 OpenVPN (使用自动登录)..."

        # --- 核心启动命令 ---
        # --daemon: 后台运行
        # --writepid: 写入进程ID
        # --config: 指定配置
        # --log: 指定日志
        # --auth-user-pass: [新增] 指定密码文件，实现自动登录
        # --allow-compression yes: 试服务器配置添加

        openvpn --daemon \
             --writepid "$PID_FILE" \
             --config "$CONFIG_FILE" \
             --log "$LOG_FILE" \
             --auth-user-pass "$PASS_FILE"

        sleep 2

        # 检查进程是否存活
        if [ -f "$PID_FILE" ] && ps -p $(cat $PID_FILE) > /dev/null; then
            echo "✅ OpenVPN 启动成功! (PID: $(cat $PID_FILE))"
            echo "📄 日志位置: $LOG_FILE"
        else
            echo "❌ 启动失败，请检查日志: $LOG_FILE"
            echo "常见原因: sudo权限、密码错误、证书过期或配置文件路径不对。"
            # 如果启动失败，清理残留的 PID 文件
            rm -f "$PID_FILE"
        fi
    fi
}

stop_vpn() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        echo "🛑 正在停止 OpenVPN (PID: $PID)..."
        kill "$PID"
        rm -f "$PID_FILE"
        echo "✅ OpenVPN 已停止。"
    else
        echo "⚠️  未找到运行中的 OpenVPN (PID 文件不存在)。"
    fi
}

status_vpn() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null; then
            echo "🟢 OpenVPN 正在运行 (PID: $PID)"
            echo "--- 最后 5 行日志 ---"
            tail -n 5 "$LOG_FILE"
        else
            echo "🔴 PID 文件存在 ($PID) 但进程未运行。可能已崩溃。"
        fi
    else
        echo "⚪ OpenVPN 未运行。"
    fi
}

# --- 主逻辑 ---

case "$1" in
    start)
        start_vpn
        ;;
    stop)
        stop_vpn
        ;;
    restart)
        stop_vpn
        sleep 1
        start_vpn
        ;;
    status)
        status_vpn
        ;;
    log)
        echo "📄 正在追踪日志 (按 Ctrl+C 退出)..."
        tail -f "$LOG_FILE"
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status|log}"
        exit 1
        ;;
esac
```

## 二、配置“免密运行”白名单

由于上面的脚本需要 Root 权限才能正常运行，每次执行脚本都要输入密码，因此做一下调整

1. **移动脚本**

```
sudo mv ovpn.sh /usr/local/bin/myvpn
```

把名字改成了 myvpn，这样你以后在终端直接敲 myvpn 就行

2. **修改权限**（关键步骤）

我们要把脚本的所有者设为 root，这样普通用户就无法修改脚本内容（防止有人往里面加恶意代码然后利用免密权限运行）。

```bash
sudo chown root:wheel /usr/local/bin/myvpn
sudo chmod 755 /usr/local/bin/myvpn
```

3. **获取你的用户名**

```bash
whoami
```

4. **编辑 sudoers 配置文件**

我们需要使用 visudo 命令来编辑权限，它会检查语法错误，防止你把系统改坏。

```bash
sudo visudo -f /etc/sudoers.d/myvpn_config
```

**请把 your_username 替换为你在上一步查到的用户名！**

```
your_username ALL=(ALL) NOPASSWD: /usr/local/bin/myvpn
```

保存退出。

## 三、最后成果

以后你需要管理 VPN 时，只需要在终端输入以下命令：

- **启动**： `sudo myvpn start`
- **停止**： `sudo myvpn stop`
- **状态**： `sudo myvpn status`

神奇之处在于： 虽然你加了 `sudo`，但因为我们配置了白名单，系统不会再要求你输入密码了！