---
title: macOS 前端开发环境配置
date: 2020-12-18 22:40:25
tag:
  - mac
---
在 macOS 配置前端开发环境。

<!--more-->

## 目录

- [Git](#git)
- [Iterm2](#Iterm2)
- [Homebrew](#Homebrew)
- [ZSH](#ZSH)
- [Nodejs](#Nodejs)

## Git

```sh
git --version
# 或者
xcode-select --install
```

## Iterm2

![iterm配置](/images/2020/itermconfigure.png)


## Homebrew

为加速安装，先进行 Git 代理配置：

- 加速 ssh 协议的 clone，修改/新增文件：`~/.ssh/config`:

```conf
Host github.com
   HostName github.com
   User git
   # 走 socks5 代理
   ProxyCommand nc -v -x 127.0.0.1:7890 %h %p
```

- 加速 http 协议的 clone

```sh
git config --global http.https://github.com.proxy http://127.0.0.1:7890
git config --global https.https://github.com.proxy http://127.0.0.1:7890
```

设置终端代理:

```sh
export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7890
```

官网安装脚本：[https://brew.sh/index_zh-cn](https://brew.sh/index_zh-cn)

## ZSH

配置oh-my-zsh，参考：[Mac 环境安装并配置终端神器 oh-my-zsh](https://a1049145827.github.io/2019/05/15/Mac-%E7%8E%AF%E5%A2%83%E5%AE%89%E8%A3%85%E5%B9%B6%E9%85%8D%E7%BD%AE%E7%BB%88%E7%AB%AF%E7%A5%9E%E5%99%A8-oh-my-zsh/)

zsh 插件安装：

- `.zshrc`配置:

```conf
plugins=(autojump sudo zsh-autosuggestions zsh-syntax-highlighting)
```

- 安装

```sh
# 请先挂代理：
brew install autojump
# zsh-autosuggestions
git clone git://github.com/zsh-users/zsh-autosuggestions $ZSH_CUSTOM/plugins/zsh-autosuggestions
# zsh-syntax-highlighting
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

## Nodejs

1. 使用脚本安装 nvm: [链接](https://github.com/nvm-sh/nvm#install--update-script)
2. `nvm install v12.x.x`
3. 使用脚本安装 yarn: (因为 brew 安装方式的 `--without-node` 选项已失效)

```sh
curl -o- -L https://yarnpkg.com/install.sh | bash
```
