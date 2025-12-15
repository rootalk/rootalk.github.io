---
title: URL 编码
date: 2021-05-24 16:00:00
tag:
  - 编码
---
前端经常会遇到解码 URL 的场景，这里对不同编码做个汇总。

<!--more-->

# %xx编码

仅编码中文

```js
encodeURI('http://abcd.com?name=小明')
// "http://abcd.com?name=%E5%B0%8F%E6%98%8E"
```

编码中文和特殊字符（`; / ? : @ & = + $ , #`），得到 `%2F` 之类的字符串

```js
encodeURIComponent('http://abcd.com?name=小明')
// "http%3A%2F%2Fabcd.com%3Fname%3D%E5%B0%8F%E6%98%8E"
```

分别使用 `decodeURI`, `decodeURIComponent` 解码。 [在线解码](https://www.matools.com/code-convert)

# Unicode 编码

会产生 `%uxxxx` 或者 `\uxxxx` 之类的字符串（如果是编码中文）

> 它的具体规则是，除了ASCII字母、数字、标点符号"@ * _ + - . /"以外，对其他所有字符进行编码。

空格会被编码成 `%20`

> escape()不能直接用于URL编码，它的真正作用是返回一个字符的Unicode编码值。

```js
escape('http://abcd.com?name=小明')
// "http%3A//abcd.com%3Fname%3D%u5C0F%u660E"
```

使用 `unescape` 解码。

```js
unescape('\u5C0F\u660E')
// "小明"
unescape('%u5C0F%u660E')
// "小明"
```

# 参考

- http://www.ruanyifeng.com/blog/2010/02/url_encoding.html