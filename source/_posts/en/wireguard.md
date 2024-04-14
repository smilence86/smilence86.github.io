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

远程桌面访问可以用向日葵、todesk等工具，ssh可利用frp内网穿透实现，但每个服务都要映射端口很繁琐，尤其是端口多挨个配置也费劲，比如这77个端口:

<img src="frp.png" style="width: 300px" class="img-zoomable" />

<br/>

换成vpn异地组网可以有效解决以上问题，在外远程访问家庭内网只需打开vpn开关，跟家里访问一模一样，无需额外端口映射。

从安全方面来说，对外暴露的攻击面越大风险越高，相比frp暴露77个端口，vpn只需暴露一个，相对安全得多。

vpn产品众多，对比发现wireguard效率高，速度快，下面介绍2种方案，分别有公网ip、无公网ip搭建wg。

<br/>

# 一、有公网ip

## 映射域名

如果家里宽带是固定公网ip直接A记录绑定域名就行，如果是动态公网ip则用ddns绑定，ddns可以跑在家内网任何一台机器，比如openwrt：

<img src="ddns.png" style="width: 200px" class="img-zoomable" />

<br/>

或者docker跑ddns，映射域名: home.example.com

docker run -d --name=cf-ddns --restart=always -e API_KEY=*** -e ZONE=example.com -e SUBDOMAIN=home oznu/cloudflare-ddns

也可以使用另一个镜像：
<ins>https://github.com/favonia/cloudflare-ddns</ins>
  
  

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
    -e WG_DEFAULT_ADDRESS=10.13.1.x \
    -e WG_ALLOWED_IPS=192.168.2.0/24 \
    -e WG_PERSISTENT_KEEPALIVE=10 \
    -e TZ=Asia/Shanghai \
    -e UI_TRAFFIC_STATS=true \
    -v /opt/wg-easy:/etc/wireguard \
    -p 54321:51820/udp \
    -p 51821:51821/tcp \
    --cap-add=NET_ADMIN \
    --cap-add=SYS_MODULE \
    --sysctl="net.ipv4.conf.all.src_valid_mark=1" \
    --sysctl="net.ipv4.ip_forward=1" \
    --restart unless-stopped \
    ghcr.io/wg-easy/wg-easy
```

<br/>

## 端口转发

在openwrt主路由设置端口转发，旁路由无法设置wan口端口转发，在 网络 -> 防火墙 -> 端口转发 中设置，假设wg运行在debian，其ip为192.168.2.103，新增规则让外部54321/udp转发到debian的54321/udp端口：

<img src="port.png" style="width: 400px" class="img-zoomable" />

检测udp端口是否可用
nc -v -u -w 3 home.example.com 54321

应该看到
Connection to home.example.com 54321 port [udp/*] succeeded!

<br/>

## 关闭SFE

在Turbo ACC中关闭SFE，否则客户端可能连不上，“软件流量分载”可以打开：

<img src="turboACC.png" style="width: 400px" class="img-zoomable" />

<br/>

## 添加peer客户端

浏览器打开wg后台: [<ins>http://192.168.2.103:51821</ins>](http://192.168.2.103:51821)，添加一个客户端peer：
<img src="wg.png" class="img-zoomable" />

<br/>

## 客户端连接

手机扫码连接：
<img src="wg_android.jpeg" style="width: 300px" class="img-zoomable" />

<br/>

电脑wg客户端导入配置文件：
<img src="wg_windows.jpg" style="width: 400px" class="img-zoomable" />


iphone要到美区app store下载wg客户端。

至此可以通过外部4g网络远程访问家里设备：

<img src="openwrt.jpeg" style="width: 300px" class="img-zoomable" />


如果把wg客户端配置文件中Allowed IPs改成0.0.0.0/0，意味着所有流量会经过远端peer绕一次，家里挂了梯子，手机也自动拥有科学上网能力。

  
<br/>

# 二、无公网ip

家里没有公网ip则要使用第三方中转，可以是廉价vps，速度依赖它的带宽，没有公网ip直连快。

原理是利用frp把内网54321/udp暴露到公网4001/udp，wg客户端使用公网4001/udp进行连接。

假设已经准备好一台vps，公网ip为: 1.2.3.4

<br/>

## vps防火墙开放端口

在vps防火墙添加入站规则，放行端口4001/udp，允许公网访问。

<br/>

## 搭建frps服务端

vim /opt/frps.ini

```
[common]
bind_port = 2000
#kcp_bind_port = 2000
vhost_http_port = 2000
vhost_https_port = 2000
tcp_mux = true

max_pool_count=50

tls_enable = true

token=password

dashboard_addr = 0.0.0.0
dashboard_port = 2222

dashboard_user = admin
dashboard_pwd = anotherPwd

enable_prometheus = true

log_level = info

log_max_days = 30

```

docker run -d --name frps --restart=always -v /opt/frps.ini:/etc/frp/frps.ini --network=host snowdreamtech/frps

最新docker镜像已经把配置文件后缀 ini 改为 toml，所以启动命令为：

docker run -d --name frps --restart=always -v /opt/frps.ini:/etc/frp/frps.toml --network=host snowdreamtech/frps


后续frpc客户端同理，自行判断。

<br/>

## 启动frpc客户端

vim /opt/frpc.ini
```
[common]
server_addr = 1.2.3.4
server_port = 2000
protocol = tcp
token = password

[wireguard_udp]
type = udp
local_ip = 127.0.0.1
local_port = 54321
remote_port = 4001
use_encryption = true
use_compression = true

[wireguard_web]
type = tcp
local_ip = 127.0.0.1
local_port = 51821
remote_port = 4002
use_encryption = true
use_compression = true

```

启动frpc：

docker run -d --name frpc --restart=always -v /opt/frpc.ini:/etc/frp/frpc.ini --network=host snowdreamtech/frpc

<br/>

## 运行wg

运行wireguard：

```
mkdir -p /opt/wg-easy

docker run -d \
    --name=wireguard \
    -e WG_HOST=1.2.3.4 \
    -e WG_PORT=4001 \
    -e PASSWORD=yourPassword \
    -e WG_DEFAULT_DNS=192.168.2.1 \
    -e WG_DEFAULT_ADDRESS=10.13.100.x \
    -e WG_ALLOWED_IPS=192.168.2.0/24 \
    -e WG_PERSISTENT_KEEPALIVE=10 \
    -e TZ=Asia/Shanghai \
    -e UI_TRAFFIC_STATS=true \
    -v /opt/wg-easy:/etc/wireguard \
    -p 54321:51820/udp \
    -p 51821:51821/tcp \
    --cap-add=NET_ADMIN \
    --cap-add=SYS_MODULE \
    --sysctl="net.ipv4.conf.all.src_valid_mark=1" \
    --sysctl="net.ipv4.ip_forward=1" \
    --restart unless-stopped \
    ghcr.io/wg-easy/wg-easy
```

检测udp端口是否可用
nc -v -u -w 3 1.2.3.4 4001
Connection to 1.2.3.4 54321 port [udp/*] succeeded!

通过vps中转就不需要主路由端口转发，浏览器直接登录wg后台添加客户端，手机扫码测试。

<br/>
<br/>
