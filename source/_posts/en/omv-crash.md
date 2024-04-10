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
  
<img src="email-warning.png" class="img-zoomable" />


ssh登录omv，列出磁盘：

<img src="list-disks.png" class="img-zoomable" />


对比发现少一块/dev/sdc，omv的磁盘列表还有，像是误显示

<img src="web-disks.png" class="img-zoomable" />


最初搭建omv时没有直通整个sata控制器，qm set方式直通的，所以pve宿主机还能看到磁盘，但列表异常，usage显示No，正常该是linux_raid_member：

<img src="pve-disks.png" class="img-zoomable" />


omv磁盘阵列没了：

<img src="lost-raid.png" class="img-zoomable" />


文件系统丢失：

<img src="missing-filesystem.png" class="img-zoomable" />

  
  
网友修复记录：
<ins>[https://zhuanlan.zhihu.com/p/553047294](https://zhuanlan.zhihu.com/p/553047294)</ins>


论坛资料：
<ins>[https://forum.openmediavault.org/index.php?thread/40522-raid-array-missing](https://forum.openmediavault.org/index.php?thread/40522-raid-array-missing)</ins>


命令行检查raid状态
cat /proc/mdstat

<img src="check-raid-status.png" class="img-zoomable" />

raid状态是inactive，磁盘只有sda、sdb、sdd，同样缺少sdc

检测单块硬盘，sdb：

<img src="check-one-disk.png" class="img-zoomable" />


开始处理，先停掉md0：

mdadm --stop /dev/md0

用剩下3块盘修复阵列：

<img src="rebuild-raid.png" class="img-zoomable" />


刷新web界面，raid阵列恢复中：

<img src="web-rebuild-raid.png" class="img-zoomable" />

状态是resyncing（pending），等待完成。


等了10多个小时收到一封邮件：

<img src="email-raid-degraded-event.png" class="img-zoomable" />


不过阵列状态还是一样：

<img src="rebuild-completed.png" class="img-zoomable" />


文件系统没挂载：

<img src="system-not-mounted.png" class="img-zoomable" />


命令行重新检查raid状态，变为激活：

<img src="raid-active.png" class="img-zoomable" />


选中md阵列，点“Mount”即可挂载成功：

<img src="mount-filesystem.png" class="img-zoomable" />

<img src="mount-success.png" class="img-zoomable" />

<img src="filesystem.png" class="img-zoomable" />


此时阵列状态显示为降级：

<img src="raid-degraded.png" class="img-zoomable" />


购买新盘，关机拆下旧盘替换新盘，点“Recover”加入阵列：

<img src="add-disk.png" class="img-zoomable" />


开始恢复同步：

<img src="recover.png" class="img-zoomable" />


睡前看了眼，重建恢复进度90%，心想醒来就ok

第二天打不开：

<img src="omv-not-working.png" class="img-zoomable" />

omv的ip也ping不通

pve宿主机显示报错：

<img src="omv-crash-again.png" class="img-zoomable" />


重启后能识别所有磁盘，包括掉的新盘：

<img src="new-disk.png)" class="img-zoomable" />


此时raid状态还在重建99.8%，也就是说掉盘发生在99.8%的时候：

<img src="percent99.8.png" class="img-zoomable" />


等了大概2分钟重建完成，此时状态：

<img src="clean.png" class="img-zoomable" />


md状态也是active正常：

<img src="active.png" class="img-zoomable" />


记录此时（2023-12-29T06:16:00）新盘信息：

<img src="smart-info.png" class="img-zoomable" />


截图发给gpt，让它分析这块磁盘状况：

<img src="gpt-summary.png" class="img-zoomable" />


此时pve宿主机显示有4块磁盘用于raid，其中VLKH43HZ是采购的新盘：

<img src="review.png" class="img-zoomable" />


目前为止3个月一切正常。



