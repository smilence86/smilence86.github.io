---
title: 红米ac2100刷openwrt
catalog: true
date: 2022-03-04 22:11:57
subtitle: 高性价比AP
sticky: 999
header-img: /img/header_img/lml_bg.jpg
tags:
- redmi
- ac2100
- openwrt
categories:
- network
---

来自小黄鱼￥119

![](../../images/ac2100/ac2100.png)
\
\

红米原系统：

![](../../images/ac2100/origin_system.png)
\
\
检查是否坏块：http://i.lckiss.com/?p=6761

![](../../images/ac2100/bad_blocks.png)

中奖，没有坏块！
\
\
刷写breed：https://www.lotlab.org/2021/06/13/install-openwrt-on-redmi-ac2100/

![](../../images/ac2100/breed.png)
\
\
刷入openwrt，固件来源：https://www.right.com.cn/forum/thread-6529167-1-1.html

![](../../images/ac2100/op_overview.png)
\
\
检查是否有坏块：

![](../../images/ac2100/logs.png)

![](../../images/ac2100/shell.png)
\
\
\
如果wifi无法开机自启，在启动项中添加命令：

ifconfig ra0 up  
ifconfig rai0 up

![](../../images/ac2100/startup.png)
\
\
\
意外的是，ac2100的cpu跟k2p相同，但跑分高不少，k2p只有4500：
  
![](../../images/ac2100/k2p.png)

