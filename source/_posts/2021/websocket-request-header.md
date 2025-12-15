---
title: Websocket 能否自定义请求头
date: 2021-09-01 11:12:16
tag:
  - Websocket
  - HTTP
---
有些业务场景需要对 Websocket 连接做认证，那么可以用 JS 给 Websocket 添加 `Authorization` 一类的自定义请求头吗？

<!--more-->

**先说结论：不可以，只有 `path` 和 `protocol` 可以被指定。**

在 JavaScript [WebSockets API](https://html.spec.whatwg.org/multipage/web-sockets.html#network) 中没有为浏览器或 (Node) cli 添加额外请求头的方法。 只有请求路径 ("GET /xyz") 和协议 ("Sec-WebSocket-Protocol") 可以在 WebSocket 构造函数中指定。

```js
var ws = new WebSocket("ws://example.com/path", "protocol");
var ws = new WebSocket("ws://example.com/path", ["protocol1", "protocol2"]);
```

上面代码得到的请求头分别是：

```
Sec-WebSocket-Protocol: protocol

Sec-WebSocket-Protocol: protocol1, protocol2
```

为 WebSocket 做认证的常规方案是：服务端实现一个 `ticket` ，客户端在建立连接后，发送第一条信息时，在 URL 或 `query string` 中传递这个 `ticket`，服务端检查其是否有效。关于 WebSocket 安全相关的信息还可以查看[这篇文章](https://devcenter.heroku.com/articles/websocket-security)。

`Basic authentication`(Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=) 在以前是可以实现的，但现代浏览器逐渐抛弃了这个特性。

```js
// 已废弃的用法
var ws = new WebSocket("ws://username:password@example.com")
```

## 参考

- https://stackoverflow.com/questions/4361173/http-headers-in-websockets-client-api
