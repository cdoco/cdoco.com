---
title: sort,uniq,cut,wc 命令详解
date: 2016-02-20 16:39:30
tags:
  - linux
  - shell
category: linux
cover_img: https://i.loli.net/2019/02/24/5c7230aa4b98e.jpg
---

### sort

sort 命令对 File 参数指定的文件中的行排序，并将结果写到标准输出。如果 File 参数指定多个文件，那么 sort 命令将这些文件连接起来，并当作一个文件进行排序。

sort语法

``` bash
[root@www ~]# sort [-fbMnrtuk] [file or stdin]
选项与参数：
-f  ：忽略大小写的差异，例如 A 与 a 视为编码相同；
-b  ：忽略最前面的空格符部分；
-M  ：以月份的名字来排序，例如 JAN, DEC 等等的排序方法；
-n  ：使用『纯数字』进行排序(默认是以文字型态来排序的)；
-r  ：反向排序；
-u  ：就是 uniq ，相同的数据中，仅出现一行代表；
-t  ：分隔符，默认是用 [tab] 键来分隔；
-k  ：以那个区间 (field) 来进行排序的意思
```
<!-- more -->

对/etc/passwd 的账号进行排序

``` bash
[root@www ~]# cat /etc/passwd | sort
avahi:x:110:115:Avahi mDNS daemon,,,:/var/run/avahi-daemon:/bin/false
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
cdoco:x:1000:1000:Cdoco,,,:/home/cdoco:/bin/bash
```
ps：sort 是默认以第一个数据来排序，而且默认是以字符串形式来排序,所以由字母 a 开始升序排序。

/etc/passwd 内容是以 : 来分隔的，我想以第三栏来排序，该如何

``` bash
[root@www ~]# cat /etc/passwd | sort -t ':' -k 3
root:x:0:0:root:/root:/bin/bash
cdoco:x:1000:1000:Cdoco,,,:/home/cdoco:/bin/bash
libuuid:x:100:101::/var/lib/libuuid:
syslog:x:101:104::/home/syslog:/bin/false
messagebus:x:102:106::/var/run/dbus:/bin/false
```

默认是以字符串来排序的，如果想要使用数字排序：

``` bash
[root@www ~]# cat /etc/passwd | sort -t ':' -k 3n
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
```

默认是升序排序，如果要倒序排序，如下

``` bash
[root@www ~]# cat /etc/passwd | sort -t ':' -k 3nr
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
cdoco:x:1000:1000:Cdoco,,,:/home/cdoco:/bin/bash
sshd:x:115:65534::/var/run/sshd:/usr/sbin/nologin
pulse:x:114:120:PulseAudio daemon,,,:/var/run/pulse:/bin/false
```

如果要对/etc/passwd,先以第六个域的第2个字符到第4个字符进行正向排序，再基于第一个域进行反向排序。

``` bash
[root@www ~]# cat /etc/passwd |  sort -t':' -k 6.2,6.4 -k 1r
kernoops:x:105:65534:Kernel Oops Tracking Daemon,,,:/:/bin/false
sync:x:4:65534:sync:/bin:/bin/sync
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
```

查看/etc/passwd有多少个shell:对/etc/passwd的第七个域进行排序，然后去重:

``` bash
[root@www ~]# cat /etc/passwd |  sort -t':' -k 7 -u
libuuid:x:100:101::/var/lib/libuuid:
root:x:0:0:root:/root:/bin/bash
syslog:x:101:104::/home/syslog:/bin/false
speech-dispatcher:x:109:29:Speech Dispatcher,,,:/var/run/speech-dispatcher:/bin/sh
sync:x:4:65534:sync:/bin:/bin/sync
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
```

### uniq

uniq命令可以去除排序过的文件中的重复行，因此uniq经常和sort合用。也就是说，为了使uniq起作用，所有的重复行必须是相邻的。

uniq语法

``` bash
[root@www ~]# uniq [-icu]
选项与参数：
-i   ：忽略大小写字符的不同；
-c  ：进行计数
-u  ：只显示唯一的行
```

testfile的内容如下

``` bash
[root@www ~]# cat testfile
hello
world
friend
hello
world
hello
```

直接删除未经排序的文件，将会发现没有任何行被删除

``` bash
[root@www ~]# uniq testfile  
hello
world
friend
hello
world
hello
```

排序文件，默认是去重

``` bash
[root@www ~]# cat words | sort |uniq
friend
hello
world
```

排序之后删除了重复行，同时在行首位置输出该行重复的次数

``` bash
[root@www ~]# sort testfile | uniq -c
1 friend
3 hello
2 world
```

仅显示存在重复的行，并在行首显示该行重复的次数

``` bash
[root@www ~]# sort testfile | uniq -dc
3 hello
2 world
```

仅显示不重复的行

``` bash
[root@www ~]# sort testfile | uniq -u
friend
```

### cut

cut命令可以从一个文本文件或者文本流中提取文本列。

cut语法

``` bash
[root@www ~]# cut -d'分隔字符' -f fields <==用于有特定分隔字符
[root@www ~]# cut -c 字符区间            <==用于排列整齐的信息
选项与参数：
-d  ：后面接分隔字符。与 -f 一起使用；
-f  ：依据 -d 的分隔字符将一段信息分割成为数段，用 -f 取出第几段的意思；
-c  ：以字符 (characters) 的单位取出固定字符区间；
```

PATH 变量如下

``` bash
[root@www ~]# echo $PATH
/bin:/usr/bin:/sbin:/usr/sbin:/usr/local/bin:/usr/X11R6/bin:/usr/games
# 1 | 2       | 3   | 4       | 5            | 6            | 7
```

将 PATH 变量取出，我要找出第五个路径。

``` bash
[root@www ~]# echo $PATH | cut -d ':' -f 5
/usr/local/bin
```

将 PATH 变量取出，我要找出第三和第五个路径。

``` bash
[root@www ~]# echo $PATH | cut -d ':' -f 3,5
/sbin:/usr/local/bin
```

将 PATH 变量取出，我要找出第三到最后一个路径。

``` bash
[root@www ~]# echo $PATH | cut -d ':' -f 3-
/sbin:/usr/sbin:/usr/local/bin:/usr/X11R6/bin:/usr/games
```

将 PATH 变量取出，我要找出第一到第三个路径。

``` bash
[root@www ~]# echo $PATH | cut -d ':' -f 1-3
/bin:/usr/bin:/sbin:
```


将 PATH 变量取出，我要找出第一到第三，还有第五个路径。

``` bash
[root@www ~]# echo $PATH | cut -d ':' -f 1-3,5
/bin:/usr/bin:/sbin:/usr/local/bin
```

实用例子:只显示/etc/passwd的用户和shell

``` bash
[root@www ~]# cat /etc/passwd | cut -d ':' -f 1,7
root:/bin/bash
daemon:/bin/sh
bin:/bin/sh
```

### wc

----------

统计文件里面有多少单词，多少行，多少字符。

wc语法

``` bash
[root@www ~]# wc [-lwm]
选项与参数：
-l  ：仅列出行；
-w  ：仅列出多少字(英文单字)；
-m  ：多少字符；
```

默认使用wc统计/etc/passwd

``` bash
[root@www ~]# wc /etc/passwd
40   45 1719 /etc/passwd
40是行数，45是单词数，1719是字节数
```


wc的命令比较简单使用，每个参数使用如下：

``` bash
[root@www ~]# wc -l /etc/passwd   #统计行数，在对记录数时，很常用
40 /etc/passwd       #表示系统有40个账户
```
``` bash
[root@www ~]# wc -w /etc/passwd  #统计单词出现次数
45 /etc/passwd
```
``` bash
[root@www ~]# wc -m /etc/passwd  #统计文件的字节数
1719
```
