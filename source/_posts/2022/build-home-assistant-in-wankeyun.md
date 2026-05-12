---
title: 使用玩客云搭建 home-assistant 智能家居系统
date: 2022-03-27 13:51:56
updated: 2022-03-27 13:52:01
tag:
  - home-assistant
  - 智能家居
---
2022年使用玩客云刷机编译环境后安装 home-assistant。

<!--more-->

## 刷机

起初是看到[这个视频](https://www.bilibili.com/video/BV1g44y1L788)才开始折腾，[刷机底包](https://pan.baidu.com/s/1uOjSynMPeHMfiS7vrDEHow?pwd=9x2u)也来自于 UP 主，网上也能找到玩客云的各种刷机教程。
> 刷机替换原固件一次后，以后刷机只需长按 reset 并插入电源即可。

## 使用 armbian 安装 home-assistant

上面提到的固件包发现并不好用，于是找到[另一种方案](https://post.smzdm.com/p/a5o85wpk/)。文章内容看起来是转载的别人的，代码格式、间隔都有问题。我研究整理了一下正确步骤：

1. 刷固件 [WKY-Armbian_20.12_5.9.0.img](https://www.right.com.cn/forum/thread-4111603-1-1.html)

百度云：https://pan.baidu.com/s/1grataYyhlNAQ5MjdMc2L9A 提取码：daqo
天翼云：https://cloud.189.cn/t/fmemqafYzAfm  访问码：com8
谷歌云：https://drive.google.com/drive/folders/1gVwEj1KWvR0yKuzusSGmNzdfcAtz2kxH?usp=sharing

当刷好了 armbian 后 ssh 进入开始准备安装。

2. 升级Python

参考[教程](https://wgznz.com/zhinan/10606-1.html)

```sh
apt-get update
python3 -V

apt-get purge python3.7
reboot

apt-get install python3-dev python3-pip python3-venv

apt-get install zlib1g-dev libbz2-dev libssl-dev libncurses5-dev libsqlite3-dev libreadline-dev tk-dev libgdbm-dev libdb-dev libpcap-dev xz-utils libexpat1-dev liblzma-dev libffi-dev libc6-dev openssl sqlite3 tcl-dev uuid-dev

cd /usr/local
mkdir python3
wget https://www.python.org/ftp/python/3.9.12/Python-3.9.12.tgz
tar -zxvf Python-3.9.12.tgz
cd Python-3.9.12
./configure --prefix=/usr/local/python3
make && make install

# 完成安装后，你会发现python版本还是3.5.3，那是因为没有重新做软连接。
cd /usr/bin/
rm python3
ln -s /usr/local/python3/bin/python3  /usr/bin/python3
ls -l /usr/bin/python3

python3 -V


vim /etc/profile
# 添加
export PATH=/usr/local/python3/bin:$PATH
```

3. 安装编译cryptography所需环境

```sh
curl https://sh.rustup.rs -sSf | sh
# 安装会让选择，选1

export CRYPTOGRAPHY_DONT_BUILD_RUST=1
export CARGO_NET_GIT_FETCH_WITH_CLI=true

source $HOME/.cargo/env
```

4. 安装最新版SQLite

系统自带SQLite版本太低，会出现报警

```sh
# 任意目录
wget https://sqlite.org/2022/sqlite-autoconf-3380100.tar.gz
tar -xvf sqlite-autoconf-3380100.tar.gz
cd sqlite-autoconf-3380100
./configure
make && make install

# make完会生成文件到/usr/local/lib/
# 替换老版本SQLite
cp /usr/local/lib/*sql* /usr/lib/arm-linux-gnueabihf/
chmod a+x /usr/lib/arm-linux-gnueabihf/*sql*
```

5. 安装 hass

```
mkdir homeassistant
cd homeassistant
pip3 install homeassistant -i https://mirrors.aliyun.com/pypi/simple
```

安装完成测试启动：

```sh
# 安装依赖
pip3 install sqlalchemy -i https://mirrors.aliyun.com/pypi/simple

/usr/local/python3/bin/hass -c "/root/.homeassistant"
```

6. 配置ha开机自启动

vim /etc/systemd/system/home-assistant@root.service

```
[Unit]
Description=Home Assistant
After=network-online.target

[Service]
Type=simple
User=%i
ExecStart=/usr/local/python3/bin/hass -c "/root/.homeassistant"

[Install]
WantedBy=multi-user.target
```

最后输入以下指令让自动启动配置生效


```
systemctl daemon-reload
```

在重启设备就可以启动home assistant了
