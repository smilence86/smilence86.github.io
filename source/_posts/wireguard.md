---
title: wireguard远程回家
date: 2022-03-21 20:01:00
tags: wireguard, openwrt
---

远程访问通常可以用向日葵、frp实现，但都有限制，向日葵远程桌面还行，特定系统特定端口无法实现，比如远程访问raspberry pi的ssh端口，frp可以做到但每个服务都要映射端口比较繁琐，我server端显示已经映射了47个服务，第一次配置工作量巨大。

![](../images/wireguard/frp.png)
\
\
换成vpn可以有效解决以上问题，在外远程访问家庭内网只需打开开关即可，使用ip、port跟内网一模一样，无需额外端口映射。

对比发现wireguard效率高，速度快。前提是家庭网络有公网IP，如果是固定公网IP直接绑定域名就行，如果是动态公网IP则用ddns动态绑定，ddns可以跑在家庭局域网任何一台机器，比如openwrt：

![](../images/wireguard/ddns.png)
\
\
或者docker映射: home.example.com
```
docker run -d --name=cf-ddns --restart=always -e API_KEY=*** -e ZONE=example.com -e SUBDOMAIN=home oznu/cloudflare-ddns
```
在内网任何一台机器启动wireguard:
```
docker run -d \
--name=wireguard \
-e WG_HOST=home.example.com \
-e WG_PORT=54321 \
-e PASSWORD=yourPassword \
-e WG_DEFAULT_DNS=192.168.2.1 \
-e TZ=Asia/Shanghai \
-v /path/wg-easy:/etc/wireguard \
-p 54321:51820/udp \
-p 51821:51821/tcp \
--cap-add=NET_ADMIN \
--cap-add=SYS_MODULE \
--sysctl="net.ipv4.conf.all.src_valid_mark=1" \
--sysctl="net.ipv4.ip_forward=1" \
--restart unless-stopped \
weejewel/wg-easy
```
\
\
在openwrt -> 网络 -> 防火墙 -> 端口转发，假设wg运行在debian，其ip为192.168.2.103，让外部54321/udp转发到debian的54321/udp端口，：

![](../images/wireguard/port.png)
\
\
访问wg后台管理界面: http://192.168.2.103:51821

添加一个客户端（peer）：
![](../images/wireguard/wg.png)
\
\
手机扫码即可连接：
<img src="/images/wireguard/wg_android.jpeg" alt="drawing" width="500"/>
\
\
电脑导入配置文件：
![](../images/wireguard/wg_windows.jpg)
\
\
如果没有公网ip则要使用vps中转，配置更复杂，而且通讯速度依赖vps带宽，没有直连快。