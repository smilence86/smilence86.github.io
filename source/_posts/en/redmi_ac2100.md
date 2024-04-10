---
title: 红米ac2100刷openwrt
catalog: true
date: 2022-03-04 22:11:57
subtitle: 高性价比AP
sticky: 999
header-img: /img/header_img/newhome_bg.jpg
tags:
- redmi
- ac2100
- openwrt
categories:
- network
---

来自小黄鱼￥119

<img src="ac2100.png" class="img-zoomable" />
\
\

红米原系统：

<img src="origin_system.png" class="img-zoomable" />
\
\
检查是否坏块：http://i.lckiss.com/?p=6761

<img src="bad_blocks.png" class="img-zoomable" />

中奖，没有坏块！
\
\
刷写breed：https://www.lotlab.org/2021/06/13/install-openwrt-on-redmi-ac2100/

<img src="breed.png" class="img-zoomable" />
\
\
刷入openwrt，固件来源：https://www.right.com.cn/forum/thread-6529167-1-1.html

<img src="op_overview.png" class="img-zoomable" />
\
\
检查是否有坏块：

<img src="logs.png" class="img-zoomable" />

<img src="shell.png" class="img-zoomable" />
\
\
\
如果wifi无法开机自启，在启动项中添加命令：

ifconfig ra0 up  
ifconfig rai0 up

<img src="startup.png" class="img-zoomable" />
\
\
\
意外的是，ac2100的cpu跟k2p相同，但跑分高不少，k2p只有4500：
  
<img src="k2p.png" class="img-zoomable" />

