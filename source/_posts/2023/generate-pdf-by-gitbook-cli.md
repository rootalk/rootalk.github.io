---
title: 使用 Gitbook Cli (honkit) 生成 PDF，Markdown 转 PDF
date: 2023-08-08 17:57:56
updated: 2023-03-29 17:57:56
tag:
  - gitbook
  - PDF
---

我们希望有一种在线文档可以方便地导出 PDF 文档，并且导出的 PDF 排版最好与在线文档一致。最终我们选择了已经多年未更新的 Gitbook Cli （的替代品: honkit）。

<!--more-->

> 2024-03-29 更新：加入自定义样式相关内容

## 起因

Gitbook 导出 PDF 的文章很多，按照各种教程尝试发现遍地是坑：首先，使用 大于 v10 的 NodeJS 版本 安装依赖会出现各种错误情况，毕竟 Gitbook Cli 最后一版更新已是 2018 年；其次，依赖安装完成后运行起来又会发现各种问题：编辑文档无法热更新、导出 PDF 各种报错。

等各种坑踩完了才知道有 [HonKit](https://github.com/honkit/honkit) 这个项目。

```
HonKit is building beautiful books using Markdown - Fork of GitBook
```

## Gitbook 替代品

不知道为什么介绍 [HonKit](https://github.com/honkit/honkit) 的文章很少。按照文档可以轻松地使用 v16 版本的 NodeJS 构建、预览在线文档。如果之前用的 Gitbook 也可以无缝迁移。HonKit 自带导出 PDF 的功能

```sh
$ honkit pdf ./ ./mybook.pdf
```

但是，即使解决各种依赖问题生成了 PDF，效果还是不尽人意。

## 导出 PDF

最终推荐的方式是使用 Docker 配合 HonKit 在线文档生成 PDF：[soulteary/docker-gitbook-pdf-generator](https://github.com/soulteary/docker-gitbook-pdf-generator)。

可能上面提到这个项目导出的 PDF 会存在图片不显示的问题，又有人进行了优化：[robertzhangwenjie/gitbook2pdf](https://github.com/robertzhangwenjie/gitbook2pdf)

现在可以比较完美地导出 Gitbook PDF 了

```sh
docker run --rm -it \
    -v `pwd`/fonts:/usr/share/fonts \
    -v `pwd`/output:/app/output \
    zhangwenjie/gitbook2pdf "http://host.docker.internal:4000" output.pdf
```

~~如果自定义程度比较高，推荐使用 [robertzhangwenjie/gitbook2pdf](https://github.com/robertzhangwenjie/gitbook2pdf) 项目的 Python 运行方式。~~

## 自定义样式

根据[源项目描述](https://github.com/fuergaosi233/gitbook2pdf?tab=readme-ov-file#custom)，可以通过修改 gitbook2pdf/libs/gitbook.css 文件来自定义样式。
在当前文件夹下创建子文件夹 `gitbook2pdf/libs/`，下载[源文件](https://github.com/robertzhangwenjie/gitbook2pdf/blob/master/gitbook2pdf/libs/gitbook.css)到该目录下。
修改字体来进行测试：找到 
```css
html{font-family:sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
``` 

修改为 
```css
html{font-family: "Microsoft Yahei", "微软雅黑";-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
```

将准备的字体放入 fonts 目录，我这里使用的微软雅黑字体。
然后修改运行生成命令查看效果：

```sh
docker run --rm -it \
  -v `pwd`/gitbook2pdf/libs/gitbook.css:/app/gitbook2pdf/libs/gitbook.css \
  -v `pwd`/fonts:/usr/share/fonts \
  -v `pwd`/output:/app/output \
  zhangwenjie/gitbook2pdf "http://host.docker.internal:4000" output.pdf
```

PS: HTML DOM 元素的 id， class 可以通过查看输出目录中的 html 文件找到。

### 手动分页、页眉、页脚

gitbook2pdf 核心使用 `weasyprint` 来生成 PDF。根据[相关文章](https://www.volcengine.com/theme/8039831-W-7-1)介绍，可以通过指定的 CSS 代码来实现分页、页眉和页脚。
在 `gitbook.css` 加入以下代码：

```css
/* 设置页眉页脚 */
@page {
  size: A4;
  margin: 2cm;
  @top-center {
    content: "页眉内容";
  }
  @bottom-center {
    content: "页脚内容";
  }
}

/* 在一级标题分页 */
.level1 {
  page-break-before: always;
}
```

再次执行上面提到的生成命令即可查看效果。

### 更多自定义

按需修改 [gitbook2pdf/gitbook2pdf.py](https://github.com/robertzhangwenjie/gitbook2pdf/blob/master/gitbook2pdf/gitbook2pdf.py) 并挂载到容器，可以轻松实现更高程度的自定义效果。

```sh
docker run --rm -it \
  -v `pwd`/gitbook2pdf/libs/gitbook.css:/app/gitbook2pdf/libs/gitbook.css \
  -v `pwd`/gitbook2pdf/gitbook2pdf.py:/app/gitbook2pdf/gitbook2pdf.py \
  -v `pwd`/fonts:/usr/share/fonts \
  -v `pwd`/output:/app/output \
  zhangwenjie/gitbook2pdf "http://host.docker.internal:4000" output.pdf
```
