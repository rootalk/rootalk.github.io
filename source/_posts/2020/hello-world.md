---
title: 测试 Markdown 渲染效果
date: 2020-12-17 12:00:00
updated: 2021-12-11 10:36:44
tag:
  - 测试
---
markdown test

<!--more-->
文本。

# 这是 H1

## 这是 H2

###### 这是 H6

代码：
```js
console.log('hello world');
```
```bash
npm install gulp
```

表格:

| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |

> ## 这是一个标题。
>
> 1.   这是第一行列表项。
> 2.   这是第二行列表项。
>
> 给出一些例子代码：
>
>     return shell_exec("echo $input | $markdown_script");

列表：

*   Red
*   Green
*   Blue

+   Red
+   Green
+   Blue

1.  Bird
1.  McHale
1.  Parish

段落：

*   A list item with a blockquote:

    > This is a blockquote
    > inside a list item.

分隔线

***

链接内容：

[This link](https://hinpc.com) has no title attribute.

强调

*single asterisks*

**double asterisks**

Use the `printf()` function.

![Alt text](/images/logo.png)

自动链接

<https://hinpc.com>

\*literal asterisks\*