---
title: 4g随身wifi刷入openwrt
catalog: true
date: 2022-06-07 21:25:00
subtitle: 4g wifi dongle with openwrt
sticky: 999
header-img: /img/header_img/newhome_bg.jpg
tags:
- 4g
- wifi
- dongle
- openwrt
categories:
- network
---

google now推荐了一篇文章：
  
<ins>[4g 随身 Wi-Fi 刷 openwrt 变成软路由](https://qust.me/post/msm8916)</ins>



点进去一看，有点意思，居然跑的是android系统，可以刷成debian或openwrt，果断买了博主推荐型号，天天特卖工厂店￥28那款

<img src="order.png" style="width: 500px" class="img-zoomable" />


4天后到货：

<img src="good.jpg" style="width: 500px" class="img-zoomable" />

<img src="good1.jpg" style="width: 500px" class="img-zoomable" />

拆下3颗螺丝取下外壳：

<img src="good2.jpg" style="width: 500px" class="img-zoomable" />

丝印为：UFI001C_MB_V01

<img src="version.png" style="width: 500px" class="img-zoomable" />

通电开机，原版android系统信息：

<img src="esim.png" style="width: 500px" class="img-zoomable" />

换自己联通4G卡，测试正常可用，系统默认使用esim（sim卡2），需要切换成自己卡（sim卡1），切换密码：UFIadmin1234：

<img src="sim.png" style="width: 500px" class="img-zoomable" />

原装android系统测速：

<img src="android_speed.png" style="width: 500px" class="img-zoomable" />


接下来下载工具开始备份、刷机

下载安装好9008驱动

机身有个按钮，按住通电，连接电脑，在设备管理器可以看到COM口正常识别：

<img src="COM.png" class="img-zoomable" />

安装miko工具备份原版android系统，用于救砖恢复：

<img src="miko.png" class="img-zoomable" />

<img src="miko1.png" class="img-zoomable" />

生成一个3.56G的bin镜像文件

下载搞机工具箱，解压运行不用安装，点击“线刷专区”：

<img src="gaoji.png" class="img-zoomable" />

点击“Fastboot”:
<img src="fastboot.png" class="img-zoomable" />


下载openwrt固件：<ins>[https://www.kancloud.cn/a813630449/ufi_car/2792820](https://www.kancloud.cn/a813630449/ufi_car/2792820)<ins>

作者已经做好了一键刷入脚本，windows点击flash.bat开始刷入固件，期间可能要按几次回车：

<img src="flash_openwrt.png" class="img-zoomable" />

出现all done! 表示刷写完成，手机能搜到wifi：HandSomeMod_7382表示openwrt启动成功，连接wifi，浏览器输入http://192.168.1.1，帐号root，无密码

<img src="openwrt.png" class="img-zoomable" />

ssh登录，查看硬件配置：

<img src="hardware.png" class="img-zoomable" />

<img src="cpu.png" class="img-zoomable" />

cpu是4核64位arm架构，指令集偏少

内存385M

磁盘3.2G

硬件配置比市面上大多数硬路由都高 [doge]。

能运行docker

网络通畅，wan口用的4g调制解调器：

<img src="modem.png" class="img-zoomable" />

安装 <ins>[ShellClash](https://github.com/juewuy/ShellClash)</ins> 就能作为简易科学上网软路由：

<img src="shellclash.png" class="img-zoomable" />

速度嘛，跟android原版一样，openwrt测速依然感人，不知道被谁封印了：

<img src="openwrt_speed.png" class="img-zoomable" />


使用过程中有次遇到一个问题，web界面无法保存任何配置，ssh登录发现磁盘只读不能写，猜测可能是多次插拔导致：

<img src="read-only.jpg" class="img-zoomable" />

网上查找修复办法，先找出根目录磁盘路径：

<img src="disk.png" class="img-zoomable" />

使用命令修复：e2fsck -y /dev/mmcblk0p14

<img src="e2fsck.png" class="img-zoomable" />

执行完，reboot重启搞定。
