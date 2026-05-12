---
title: 学习 Emby Server 解锁及优化
date: 2023-12-30 23:41:50
tag:
  - Emby
---

<img src="/images/2023/emby_plugin.jpg" alt="Emby Plugin" width="100%">

网上很多 Emby 的资源都失效了，不过教程还是挺多，本文主要参考文章「重新学习并解锁emby」，总结在折腾 Emby 过程中的一些心得。

<!--more-->

> 本文不提供任何破解文件下载，仅作分享交流，请[支持正版](https://emby.media/premiere.html)。

## 2024-05-17 补充

### 修改服务端文件的详细步骤

1. 这几个 dll 直接使用[网盘](https://act.jiawei.xin:10086/tmp/?dir=emby/4.8.6.0)里改好的文件，因为它们不涉及域名修改可以直接用
![](/images/2024/embyserver/11.png)

2. 打开 dnSpy 并关闭默认文件
![](/images/2024/embyserver/1.png)

3. 把 Emby.web.dll 拖入软件然后找到资源
![](/images/2024/embyserver/2.png)

4. 导出 JS 文件进行
![](/images/2024/embyserver/3.png)

5. 修改 JS 内容后替换回去

![](/images/2024/embyserver/4.png)

先把原来的 `connectionmanager.js` 删除
![](/images/2024/embyserver/5.png)


![](/images/2024/embyserver/6.png)

6. Emby.Server.Implementations.dll文件修改(这个文件要改 2 处)

![](/images/2024/embyserver/7.png)

切换 IL 修改, 可以搜索域名找到对应行
![](/images/2024/embyserver/8.png)
![](/images/2024/embyserver/9.png)
再弹窗中修改即可。
![](/images/2024/embyserver/10.png)

7. 剩余 2 个前端 JS 文件。可以把网盘里提供的两个 JS 文件下载后替换域名链接即可。


***

## 起因

解锁的方式其实分两类，一种是改客户端，一种是改服务端。最终原理一样，都是搭建仿冒认证服务器，让客户端访问到伪服务器从而获取授权信息。

* 改客户端：有了伪服务器的前提下（关键词「搭建 EMBY 伪验证服务」），通过修改 hosts 文件的方式将 mb3admin.com 的 IP 解析到伪服务器，同时伪服务器和客户端都需要安装自签名证书。
* 改服务端：修改服务端源文件，将默认的认证服务器 mb3admin.com 地址直接改成自建或别人提供的伪服务器，这样就不需要在每个客户端安装自签名证书了。

起初可以白嫖的伪认证服务现在要么下线要么仅提供短期试用。好在有人提供了伪服务器的搭建方法，这里就不搬运原文了，访问 [crackemby.mb6.top](http://crackemby.mb6.top/) 即可查看。

因为改服务端的方式可以一劳永逸，本文也是主要介绍这种方式的折腾过程。

测试使用的是 Window 服务端，其他端比如 Linux 或者群晖应该也是一样的步骤。

## 搭建伪认证服务

因为改服务端的方案不需要自签名证书，所以把服务部署到 Serverless 平台上是一个不错的选择。上面提到的大神提供了详细的[补丁文件](https://act.jiawei.xin:10086/tmp/?dir=emby)，其中一个文件是「[emby伪站搭建与去更新](https://act.jiawei.xin:10086/tmp/emby/emby%E4%BC%AA%E7%AB%99%E6%90%AD%E5%BB%BA%E4%B8%8E%E5%8E%BB%E6%9B%B4%E6%96%B0_by%40NOP.rar)」，里面提供了通过 Cloudflare Worker（不懂的请先自行学习） 的方式快速部署一个伪认证服务，但是代码需要改动，以下代码是改后可以直接复制使用的：

```js
// validatedevice
addEventListener("fetch", (event) => {
  const { origin, pathname: path, search } = new URL(event.request.url);

  if (path.endsWith("/admin/service/registration/validateDevice")) {
    return event.respondWith(handleRequest1(event.request));
  }

  if (path.endsWith("/admin/service/registration/getStatus")) {
    return event.respondWith(handleRequest3(event.request));
  }

  if (path.endsWith("/admin/service/registration/validate")) {
    return event.respondWith(handleRequest2(event.request));
  }
});

async function handleRequest1(request) {
  const files = '{"cacheExpirationDays": 365,"message": "Device Valid","resultCode": "GOOD"}';
  return new Response(files, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Method": "*",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

// validate
async function handleRequest2(request) {
  const files = '{"featId":"","registered":true,"expDate":"2099-01-01","key":""}';
  return new Response(files, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Method": "*",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

// getstatus
async function handleRequest3(request) {
  const files = '{"deviceStatus":"0","planType":"Lifetime","subscriptions":{}}';
  return new Response(files, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Method": "*",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
```

部署后将官方的 mb3admin.com 地址换成你自己部署的地址即可。举个例子，你部署好的地址是 `emby.user.workers.dev`，那么你的 Emby 服务器最终的验证请求之一将发送到 `https://emby.user.workers.dev/admin/service/registration/validateDevice`

## 修改服务端源文件

目标就是把源文件中官方的域名 `mb3admin.com` 换成自己的 `emby.user.workers.dev`。

前面说的的文件「[emby伪站搭建与去更新](https://act.jiawei.xin:10086/tmp/emby/emby%E4%BC%AA%E7%AB%99%E6%90%AD%E5%BB%BA%E4%B8%8E%E5%8E%BB%E6%9B%B4%E6%96%B0_by%40NOP.rar)」中有步骤图解，使用到的工具是 [dnSpy](https://github.com/dnSpy/dnSpy)。

打开软件，清空已打开的文件，将要修改的 dll 文件拖进去，按步骤图修改内容。其中有一步需要提取保存 js 文件，修改后放回去，删除原来的 js 再保存，注意删除的 js 不要删错了，删之前可以搜索内容确认一下再执行。

## 验证成功

[HX共享文件索引](https://act.jiawei.xin:10086/tmp/?dir=emby)里提供了修改后的 dll 文件，按不同的 Emby 版本提供的。但里面的 dll 文件都是替换成了服务器 `crackemby.mb6.top`，这个服务只能试用 15 天 😓。

我们只是用这些文件查漏补缺：跟前面自己替换出来的 dll 文件合并，然后替换源程序文件，开始运行。

我在测试时发现替换后服务无法启动没反应。排查发现是 Emby.Server.Implementations.dll 文件导致的，怀疑是修改漏了或者错了某些地方，改用网盘里的 dll 就能启动。

于是，将网盘里的 Emby.Server.Implementations.dll 放到 dnSpy 再次去修改替换服务器地址。最后再将 dll 替换到源程序中，终于成功启动。

打开浏览器控制台，查看网络请求，确认 `validateDevice` 接口都是指向自建的服务器，说明解锁成功了。

进入设置-Emby Premiere，随便输入一串密钥保存便能看到提示：
```
您拥有一个 Lifetime Emby Premiere 计划且您的设备数未达到最大限制数量。
```

<p align="center">
  <img src="/images/2023/emby_premiere.jpg" alt="Emby Premiere" width="100%">
</p>

## Emby 优化

1. 在 Emby 网页中打开本地播放器

详情直接查看：[Emby网页提供调用外部播放器按钮](https://nekocat.top/emby-player/)

这个脚本最新的代码已经迁移到了这个地址 [greasyfork](https://greasyfork.org/en/scripts/459297-embylaunchpotplayer)

效果如下：

<img src="/images/2023/emby_plugin.jpg" alt="Emby Plugin" width="100%">

2. 解决削刮网络问题

通过修改 hosts 解决 `api.themoviedb.org` 无法访问的问题，它的可用 IP 可以通过 [ipip](https://tools.ipip.net/ping.php) 查询。

## 相关链接

- https://blog.jiawei.xin/?p=469
- https://act.jiawei.xin:8090/ns/sharing/imDUa