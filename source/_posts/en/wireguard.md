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

远程访问通常可以用向日葵、frp，但有限制，向日葵远程桌面还行，特定端口无法实现，比如ssh，frp可以做到任意端口但每个服务都要映射一次很繁琐，尤其是端口多的情况挨个配置也费劲，比如这77个端口:

<img src="frp.png" width="300" />

<br/>

换成vpn异地组网可以有效解决以上问题，在外远程访问家里内网只需打开vpn开关即可，使用ip、port跟内网一模一样，无需额外端口映射。

vpn产品众多，对比发现wireguard效率高，速度快，接下来介绍2种方案，分别有公网ip、无公网ip搭建wg。

<br/>
<br/>

# 一、有公网ip

## 映射域名

如果是固定公网ip直接A记录绑定域名就行，如果是动态公网ip则用ddns绑定，ddns可以跑在家内网任何一台机器，比如openwrt：

<img src="ddns.png" width="200" />

<br/>

或者docker跑ddns，映射域名: home.example.com

docker run -d --name=cf-ddns --restart=always -e API_KEY=*** -e ZONE=example.com -e SUBDOMAIN=home oznu/cloudflare-ddns

## 运行wg

经测试，在openwrt自身docker跑wg会导致客户端连不上，所以要在内网其他任何一台机器运行wg:

```
mkdir -p /opt/wg-easy

docker run -d \
    --name=wireguard \
    -e WG_HOST=home.example.com \
    -e WG_PORT=54321 \
    -e PASSWORD=yourPassword \
    -e WG_DEFAULT_DNS=192.168.2.1 \
    -e WG_DEFAULT_ADDRESS=10.13.100.x \
    -e WG_ALLOWED_IPS=192.168.2.0/24
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

## 端口转发

openwrt必须是主路由拨号，旁路由无法设置wan口端口转发，在 网络 -> 防火墙 -> 端口转发 中设置，假设wg运行在debian，其ip为192.168.2.103，新增规则让外部54321/udp转发到debian的54321/udp端口：

![](port.png)

<br/>

## 关闭SFE

在Turbo ACC中关闭SFE，否则客户端无法连接，“软件流量分载”可以打开：

![](turboACC.png)

<br/>

## 添加peer客户端

浏览器打开wg后台: [http://192.168.2.103:51821](http://192.168.2.103:51821)，添加一个客户端peer：
![](wg.png)

<br/>

## 客户端连接

手机扫码连接：
<img src="wg_android.jpeg" width="300" />

<br/>

电脑wg客户端导入配置文件：
<img src="wg_windows.jpg" width="500" />


iphone要到美区app store下载wg客户端。

至此可以通过外网4g远程访问家里设备，比如路由器管理页：

<img src="openwrt.jpeg" width="300" />

wg客户端连接成功就自动继承家里网络，如果家里挂了梯子，手机也拥有科学上网能力，相当于开了小飞机 or 小火箭。


<br/>
<br/>

# 二、无公网ip

家里没有公网ip则要使用vps中转，传输速度依赖vps带宽，没有直连快。

## frp内网穿透

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


## 运行wg

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
    -e WG_ALLOWED_IPS=192.168.2.0/24
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
通过vps中转就不需要主路由端口转发，直接登录wg管理界面添加peer，手机扫码连就行。

