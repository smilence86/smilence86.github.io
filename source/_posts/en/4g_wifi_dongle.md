---
title: 4g随身wifi刷入openwrt
catalog: true
date: 2022-06-07 21:25:00
subtitle: 4g wifi dongle with openwrt
sticky: 999
header-img: /img/header_img/lml_bg.jpg
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



点进去一看，有点意思，居然跑的是android系统，可以刷成debian或者openwrt，果断买了博主推荐的型号，天天特卖工厂店￥28那款

![](order.png)


4天后到货：

![](good.jpg)

![](good1.jpg)

拆下3颗螺丝取下外壳：

![](good2.jpg)

丝印为：UFI001C_MB_V01

![](version.png)

通电开机，原版android系统信息：

![](esim.png)

换自己联通4G卡，测试正常可用，系统默认使用esim（sim卡2），需要切换成自己卡（sim卡1），切换密码：UFIadmin1234：

![](sim.png)

原装android系统测速：

![](android_speed.png)


接下来下载工具开始备份、刷机

下载安装好9008驱动

机身有个按钮，按住通电，连接电脑，在设备管理器可以看到COM口正常识别：

![](COM.png)

安装miko工具备份原版android系统，用于救砖恢复：

![](miko.png)

![](miko1.png)

生成一个3.56G的bin镜像文件

下载搞机工具箱，解压运行不用安装，点击“线刷专区”：

![](gaoji.png)

点击“Fastboot”:
![](fastboot.png)


下载openwrt固件：<ins>[https://www.kancloud.cn/a813630449/ufi_car/2792820](https://www.kancloud.cn/a813630449/ufi_car/2792820)<ins>

作者已经做好了一键刷入脚本，windows点击flash.bat开始刷入固件，期间可能要按几次回车：

![](flash_openwrt.png)

出现all done! 表示刷写完成，手机能搜到wifi：HandSomeMod_7382表示openwrt启动成功，连接wifi，浏览器输入http://192.168.1.1，帐号root，无密码

![](openwrt.png)

ssh登录，查看硬件配置：

![](hardware.png)

![](cpu.png)

cpu是4核64位arm架构，指令集偏少

内存385M

磁盘3.2G

硬件配置比市面上大多数硬路由都高 [doge]。

能运行docker

网络通畅，wan口用的4g调制解调器：

![](modem.png)

安装 <ins>[ShellClash](https://github.com/juewuy/ShellClash)</ins> 就能作为简易科学上网软路由：

![](shellclash.png)

速度嘛，跟android原版一样，openwrt测速依然感人，不知道被谁封印了：

![](openwrt_speed.png)


使用过程中有次遇到一个问题，web界面无法保存任何配置，ssh登录发现磁盘只读不能写，猜测可能是多次插拔导致：

![](read-only.jpg)

网上查找修复办法，先找出根目录磁盘路径：

![](disk.png)

使用命令修复：e2fsck -y /dev/mmcblk0p14

![](e2fsck.png)

执行完，reboot重启搞定。
