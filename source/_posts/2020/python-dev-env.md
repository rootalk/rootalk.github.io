---
title: Python 开发环境配置
date: 2020-12-29 17:19:38
tag:
  - python
# hidden: true
---
记录 Python 多版本(虚拟)环境配置教程。

<!--more-->

## 目录

- [pyenv_安装](#pyenv_安装)
- [pyenv_配置](#pyenv_配置)
- [pipenv_安装](#pipenv_安装)
- [pipenv_使用](#pipenv_使用)

## pyenv_安装

```sh
curl https://pyenv.run | bash
# 国内无法安装使用代理中转
curl -L https://ghproxy.com/https://raw.githubusercontent.com/pyenv/pyenv-installer/master/bin/pyenv-installer | bash
```

通过脚本安装会默认自动安装上 `virtualenv`.

在 `.zshrc` 中增加

```sh
# pyenv
export PATH="/Users/gallen/.pyenv/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
# pyenv END
```

## pyenv_配置

MacOS 默认自带的 Python 不包含 `pip` 命令，所以设置：

```sh
pyenv global 3.6.9
pip -V
```

由于 `pipenv` 推荐使用 `pipx` 进行安装:

```sh
pip install pipx -i https://mirrors.aliyun.com/pypi/simple/
pipx --version
```

pipx 需要增加如下内容到 `.zshrc`:

```sh
# pipx
export PATH="/Users/gallen/.local/bin:$PATH"
# pipx END
```

## pipenv_安装

pipenv 可替代 pip 和 virtualenv 两个工具。

```sh
pipx install pipenv -i https://mirrors.aliyun.com/pypi/simple/
```

让生成的虚拟环境位于工程主目录内，可以在 `.zshrc` 中增加：

```sh
# pipenv
export PIPENV_VENV_IN_PROJECT=1
# pipenv END
```

## pipenv_使用

```sh
cd my_project/
pipenv --python 3.6.9 # 指定 Python 版本创建虚拟环境
pipenv shell        # 进入工作环境
# 安装包
# pipenv install pytest --dev
# 卸载所有依赖
# pipenv uninstall --all
exit                # 退出当前环境
pipenv --rm         # 删除当前虚拟环境
```

项目目录下会生成 `Pipfile`, `Pipfile.lock`，可以上传 Git 仓库。
克隆后使用 `pipenv install` 即可。

更多 [pipenv 文档](https://github.com/pypa/pipenv)
