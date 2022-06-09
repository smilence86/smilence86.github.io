---
title: 免备案解析域名
catalog: true
date: 2022-02-18 16:11:57
subtitle: 套娃曲线救国
sticky: 999
header-img: /img/header_img/newhome_bg.jpg
tags:
- non-censor
categories:
- network
---

2022年，大陆建站依然需要备案，隐私先不说，支持备案域名种数就不得不吐嘈，政策执行那么多年依然只有少得可怜的几种域名能通过备案，逼迫大家寻求邪门歪道曲线救国。

大致思路：user browser < - > CF dns < - > CF worker < - > deno < - > vps in mainland

首先想到用CF worker反代网站，但worker不支持直接解析ip:port，所以要再加一层代理，先用国外边缘计算服务反代一次获得第三方域名再用worker反代，2次套娃转发流量起到免备案效果，代价是访问略慢，好处是cdn隐藏你的vps ip避免攻击提升安全性。

边缘计算服务以deno为例，免费，官网显示支持全球28个节点快速响应

访问：[https://deno.com](https://deno.com)，注册帐号，创建项目，关联代码来自github，建议创建私有private仓库避免暴露vps ip，main分支只需创建一个文件proxy.ts：

```
import { serve } from "https://deno.land/std@0.114.0/http/server.ts";

async function handler(req: Request): Promise<Response> {
  // console.log(req.headers);
  // console.log(req.method, req.url);
  const url = req.url;
  const path = url.substring(url.indexOf('.dev') + 4);
  // 替换ip port
  return await fetch(`http://vps_ip:port${path}`);
}

console.log("Listening on http://localhost:8000");
serve(handler);
```

项目部署好，获得一个deno提供的三方域名：xxx.deno.dev，此时可以用这个域名访问你的网站。

接下来到cloudflare创建一个worker，内容：
```
addEventListener("fetch", (event) => {
  const request = event.request;
  const { pathname } = new URL(request.url);
  const url = new URL(`https://xxx.deno.dev${pathname}`);
  return event.respondWith(fetch(url, request));
});
```

设置dns，ip地址随意填192.0.2.1：

![](dns.png)
\
\
在worker中添加一个路由：

![](route.png)

这样，所有访问 https://blog.example.com 的流量都会经过worker处理，worker获取 https://xxx.deno.dev 的数据，deno获取vps ip数据，达到曲线救国的目的。
