---
title: omv掉盘
catalog: true
date: 2024-03-07 21:25:00
subtitle: omv openmediavault crash
sticky: 999
header-img: /img/header_img/newhome_bg.jpg
tags:
- omv
- openmediavault
- crash
categories:
- network
---

收到报警邮件，提示raid文件系统丢失：
  
![](email-warning.png)


ssh登录omv，列出磁盘：

![](list-disks.png)


对比发现少一块/dev/sdc，omv的磁盘列表还有，像是误显示

![](web-disks.png)


最初搭建omv时没有直通整个sata控制器，qm set方式直通的，所以pve宿主机还能看到磁盘，但列表异常，usage显示No，正常该是linux_raid_member：

![](pve-disks.png)


omv磁盘阵列没了：

![](lost-raid.png)


文件系统丢失：

![](missing-filesystem.png)

  
  
网友修复记录：
<ins>[https://zhuanlan.zhihu.com/p/553047294](https://zhuanlan.zhihu.com/p/553047294)</ins>


论坛资料：
<ins>[https://forum.openmediavault.org/index.php?thread/40522-raid-array-missing](https://forum.openmediavault.org/index.php?thread/40522-raid-array-missing)</ins>


命令行检查raid状态
cat /proc/mdstat

![](check-raid-status.png)

raid状态是inactive，磁盘只有sda、sdb、sdd，同样缺少sdc

检测单块硬盘，sdb：

![](check-one-disk.png)


开始处理，先停掉md0：

mdadm --stop /dev/md0

用剩下3块盘修复阵列：

![](rebuild-raid.png)


刷新web界面，raid阵列恢复中：

![](web-rebuild-raid.png)

状态是resyncing（pending），等待完成。


等了10多个小时收到一封邮件：

![](email-raid-degraded-event.png)


不过阵列状态还是一样：

![](rebuild-completed.png)


文件系统没挂载：

![](system-not-mounted.png)


命令行重新检查raid状态，变为激活：

![](raid-active.png)


选中md阵列，点“Mount”即可挂载成功：

![](mount-filesystem.png)

![](mount-success.png)

![](filesystem.png)


此时阵列状态显示为降级：

![](raid-degraded.png)


购买新盘，关机拆下旧盘替换新盘，点“Recover”加入阵列：

![](add-disk.png)


开始恢复同步：

![](recover.png)


睡觉前看了眼，重建恢复进度90%，心想醒来就ok

第二天发现打不开nas：

![](omv-not-working.png)

omv的ip也ping不通

pve宿主机看到已经报错：

![](omv-crash-again.png)


重启后能识别所有磁盘，包括掉的新盘：

![](new-disk.png)


此时raid状态还在重建99.8%，也就是说掉盘发生在99.8%的时候：

![](percent99.8.png)


等了大概2分钟重建完成，此时状态：

![](clean.png)


md状态也是active正常：

![](active.png)


记录此时（2023-12-29T06:16:00）新盘信息：

![](smart-info.png)


截图发给gpt，让它分析这块磁盘状况：

![](gpt-summary.png)


此时pve宿主机显示有4块磁盘用于raid，其中VLKH43HZ是采购的新盘：

![](review.png)


目前为止3个月一切正常。



