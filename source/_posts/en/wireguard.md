---
title: wireguard远程回家
catalog: true
date: 2022-03-21 20:01:00
subtitle: 异地组网神器
sticky: 999
header-img: /img/header_img/newhome_bg.jpg
tags:
- wireguard
- openwrt
categories:
- network
---

远程访问通常可以用向日葵、frp实现，但有限制，向日葵远程桌面还行，特定系统特定端口无法实现，比如linux系统ssh端口，frp可以做到但每个服务都要映射端口很繁琐，尤其是端口多的情况挨个配置很费劲:

![](frp.png)
<br/>
换成vpn异地组网可以有效解决以上问题，在外远程访问家庭内网只需打开开关即可，使用ip、port跟内网一模一样，无需额外端口映射。

对比发现wireguard效率高，速度快，接下来介绍2种方案，分别有公网ip、无公网ip。

<br/>
<br/>

# 一、有公网ip

如果是固定公网IP直接A记录绑定域名就行，如果是动态公网IP则用ddns绑定，ddns可以跑在家内网任何一台机器，比如openwrt：

![](ddns.png)

<br/>

或者docker映射域名: home.example.com

docker run -d --name=cf-ddns --restart=always -e API_KEY=*** -e ZONE=example.com -e SUBDOMAIN=home oznu/cloudflare-ddns

除openwrt自身docker，在内网任何一台机器运行wireguard:

```
mkdir -p /opt/wg-easy

docker run -d \
    --name=wireguard \
    -e WG_HOST=home.example.com \
    -e WG_PORT=54321 \
    -e PASSWORD=yourPassword \
    -e WG_DEFAULT_DNS=192.168.2.1 \
    -e WG_DEFAULT_ADDRESS=10.13.100.x \
    -e TZ=Asia/Shanghai \
    -v /opt/wg-easy:/etc/wireguard \
    -p 54321:51820/udp \
    -p 51821:51821/tcp \
    --cap-add=NET_ADMIN \
    --cap-add=SYS_MODULE \
    --sysctl="net.ipv4.conf.all.src_valid_mark=1" \
    --sysctl="net.ipv4.ip_forward=1" \
    --restart unless-stopped \
    weejewel/wg-easy
```

<br/>

在openwrt -> 网络 -> 防火墙 -> 端口转发，假设wg运行在debian，其ip为192.168.2.103，让外部54321/udp转发到debian的54321/udp端口，：

![](port.png)

<br/>

在Turbo ACC中关闭SFE，否则客户端无法连接：

![](turboACC.png)

<br/>

访问wg后台管理界面: [http://192.168.2.103:51821](http://192.168.2.103:51821)，登录进去添加一个客户端（peer）：
![](wg.png)

<br/>

手机扫码即可连接：
<img src="wg_android.jpeg" width="500" />

<br/>

电脑导入配置文件：

![](wg_windows.jpg)

<br/>

至此可以通过外网4g远程访问家里设备，比如路由器管理页：

<img src="openwrt.jpeg" width="500"/>

wg客户端连接成功就自动继承家里网络，如果家里挂了梯子，手机也拥有科学上网能力，相当于开了小飞机 or 小火箭。


<br/>
<br/>

# 二、无公网ip

家里没有公网ip则要使用vps中转，配置略复杂，数据传输速度依赖vps带宽，没有直连快。

原理是通过frp把内网54321/udp暴露到公网4001/udp，wg客户端就使用公网4001/udp进行连接

vim /opt/frpc.ini
```
[common]
server_addr = vps公网ip
server_port = 2000
protocol = tcp
token = password

[wireguard_web]
type = tcp
local_ip = 127.0.0.1
local_port = 51821
remote_port = 4000
use_encryption = true
use_compression = true

[wireguard_udp]
type = udp
local_ip = 127.0.0.1
local_port = 54321
remote_port = 4001
use_encryption = true
use_compression = true

```

启动frp：

docker run -d --name frpc --restart=always -v /opt/frpc.ini:/etc/frp/frpc.ini --network=host snowdreamtech/frpc

运行wireguard：

```
mkdir -p /opt/wg-easy

docker run -d \
    --name=wireguard \
    -e WG_HOST=vps公网ip \
    -e WG_PORT=4001 \
    -e PASSWORD=yourPassword \
    -e WG_DEFAULT_DNS=192.168.2.1 \
    -e WG_DEFAULT_ADDRESS=10.13.100.x \
    -e TZ=Asia/Shanghai \
    -v /opt/wg-easy:/etc/wireguard \
    -p 54321:51820/udp \
    -p 51821:51821/tcp \
    --cap-add=NET_ADMIN \
    --cap-add=SYS_MODULE \
    --sysctl="net.ipv4.conf.all.src_valid_mark=1" \
    --sysctl="net.ipv4.ip_forward=1" \
    --restart unless-stopped \
    weejewel/wg-easy
```
通过vps中转就不需要防火墙端口转发了，直接打开wg管理界面添加peer，手机扫码连接就行。
