---
title: lnmp 环境搭建
date: 2016-02-20 15:40:41
tags:
  - lnmp
  - linux
  - mysql
  - nginx
  - php
category: php
cover_img: https://i.loli.net/2019/02/24/5c72306b39745.jpg
---

## 编译nginx

### 编译zlib，下载地址 [zlib](http://www.zlib.net/)

``` bash
tar xvf zlib-1.2.8.tar.gz
./configure --static --prefix=/opt/source/libs/zlib
make
make install
```
<!-- more -->

### 编译openssl，下载地址 [openssl](http://www.openssl.org/)

``` bash
tar xvf openssl-0.9.8zb.tar.gz
./config --prefix=/opt/source/libs/openssl -L/opt/source/libs/zlib/lib -I/opt/source/libs/zlib/include threads zlib enable-static-engine
make
make install
```

### 编译pcre，下载地址 [pcre](http://www.pcre.org/)

``` bash
tar xvf pcre-8.33.tar.gz
./configure --prefix=/opt/source/libs/pcre
make
make install
```

### 编译nginx，下载地址 [nginx](http://nginx.org/en/download.html)

``` bash
tar xvf nginx-1.9.1.tar.gz
'./configure' \
'--prefix=/opt/source/nginx' \
'--with-debug' \
'--with-openssl=/opt/data/openssl-0.9.8zb' \
'--with-zlib=/opt/data/zlib-1.2.8' \
'--with-pcre=/opt/data/pcre-8.33' \
'--with-http_stub_status_module' \
'--with-http_gzip_static_module' \
"$@"
make
make install

ps：--with-openssl --with-zlib --with-pcre这3个路径是他们对应的源码路径
```

生成的nginx在/opt/source/nginx/sbin下

``` bash
./nginx --运行程序
在地址栏输入:  http://localhost 出现nginx logo，说明正确安装了
```

## 编译php (centos)

### 安装php依赖的运行库

``` bash
yum install libjpeg.x86_64 \
libpng.x86_64 \
freetype.x86_64 \
libjpeg-devel.x86_64 \
libpng-devel.x86_64 \
freetype-devel.x86_64 \
libcurl-devel \
libxml2-devel \
libjpeg-turbo \
libjpeg-turbo-devel \
libXpm-devel \
libXpm \
libicu-devel \
libmcrypt
libmcrypt-devel \
libxslt-devel \
libxslt -y
```

### 下载php源码 && 编译 ，下载地址 [php](http://php.net/downloads.php)

``` bash
'./configure' \
'--prefix=/opt/source/php/' \
'--with-config-file-path=/opt/source/php/etc/' \
'--with-config-file-scan-dir=/opt/source/php/conf.d/' \
'--enable-fpm' \
'--enable-cgi' \
'--disable-phpdbg' \
'--disable-jsond' \
'--enable-mbstring' \
'--enable-calendar' \
'--with-xsl' \
'--with-openssl' \
'--enable-soap' \
'--enable-zip' \
'--enable-shmop' \
'--enable-sockets' \
'--with-gd' \
'--with-jpeg-dir' \
'--with-png-dir' \
'--with-xpm-dir' \
'--with-xmlrpc' \
'--enable-pcntl' \
'--enable-intl' \
'--with-mcrypt' \
'--enable-sysvsem' \
'--enable-sysvshm' \
'--enable-sysvmsg' \
'--enable-opcache' \
'--with-iconv' \
'--with-bz2' \
'--with-curl' \
'--enable-mysqlnd' \
'--with-mysql=mysqlnd' \
'--with-mysqli=mysqlnd' \
'--with-pdo-mysql=mysqlnd' \
'--with-zlib' \
'--with-gettext=' \
"$@"
make
make install
```

ps：这里参数比较多，可以根据自己的需要删除一些

然后需要把php.ini 复制到/opt/source/php/etc/ 目录下面

``` bash
cp /opt/data/php-src/php.ini-development /opt/source/php/etc/php.ini
```

生成的php-fpm 在/opt/source/php/sbin 目录下

``` bash
./php-fpm --运行fpm 默认端口是 9000

ps aux |grep php --如果看到fpm master进程，说明安装成功了
```

pa：如果安装过程出现问题，请参照 [编译php常见问题](https://github.com/cdoco/cdoco.github.io/blob/master/md/php-faq.md)

### nginx 配置

编辑nginx.conf

``` bash
vim /opt/source/nginx/conf/nginx.conf
```
``` bash
#user  nobody;
worker_processes  1;

error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;

events {
    worker_connections  1024;
}

# load modules compiled as Dynamic Shared Object (DSO)
#
#dso {
#    load ngx_http_fastcgi_module.so;
#    load ngx_http_rewrite_module.so;
#}

http {
    include       mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  logs/access.log  main;

    sendfile        off;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    keepalive_timeout  65;

    gzip  on;
    gzip_min_length 1k;
    gzip_buffers    16 64k;
    gzip_http_version 1.1;
    gzip_disable "MSIE [1-6].";
    gzip_comp_level 7;
    gzip_types text/plain application/xml text/css application/x-javascript;
    gzip_vary on;

    include /opt/source/nginx/conf/vhost/*.conf;

}
```

创建vhost文件夹

``` bash
mkdir /opt/source/nginx/conf/vhost
cd /opt/source/nginx/conf/vhost
touch default.conf && vim default.conf
```
``` bash
server{
    listen       *:80 default;
    root    /opt/source/www;

    if (!-e $request_filename) {  
        rewrite ^/(.*) /index.php?$1 last;
    }

    location ~ .*\.(css|less|scss|js|coffee|gif|jpg|jpeg|png|bmp|swf)$ {
        access_log off;
        expires 1d;
        break;
    }

    location ~ .* {  
            fastcgi_pass   127.0.0.1:9000;
            fastcgi_index  index.php;
            fastcgi_param  SCRIPT_FILENAME  /opt/source/www$fastcgi_script_name;
            include        fastcgi_params;
    }

}

```

然后 建一个index.php测试文件

``` bash
cd /opt/source/www
touch index.php && vim index.php
```
``` php
<?php phpinfo();?>
```

重启nginx

``` bash
/opt/source/nginx/sbin/nginx -s reload --重启nginx
在地址栏输入:  http://localhost 出现phpinfo，说明正确安装了
```

## 编译mysql

### 下载mysql源代码包，到mysql下载页面选择MYSQL Community Serve Source Code 版本

### 安装 bison，下载地址 [bison](http://www.gnu.org/software/bison/)

``` bash
tar zxvf bison-2.5.tar.gz  
cd bison-2.5
./configure
make
make install
```

### 安装ncurses，下载地址 [ncurses](http://www.gnu.org/software/ncurses/)

``` bash
tar zxvf ncurses-5.8.tar.gz  
cd ncurses-5.8  
./configure  
make  
make install
```

### 添加mysql用户与组

``` bash
groupadd mysql
useradd -g mysql -s /sbin/nologin -M mysql
```

### 源码编译mysql

``` bash
tar zxvf mysql-5.5.13.tar.gz
cd mysql-5.5.13
rm CMakeCache.txt
cmake . -DCMAKE_INSTALL_PREFIX=/opt/source/mysql/  \
-DMYSQL_DATADIR=/opt/source/mysql/data  \
-DWITH_INNOBASE_STORAGE_ENGINE=1  \
-DMYSQL_TCP_PORT=3306  \
-DMYSQL_UNIX_ADDR=/opt/source/mysql/data/mysql.sock  \
-DMYSQL_USER=mysql  \
-DWITH_DEBUG=0
make
make install
```

### 编译完成后，安装数据库

``` bash
cd /opt/source/mysql
chown -R mysql .
chgrp -R mysql .
scripts/mysql_install_db --user=mysql --basedir=/opt/source/mysql --datadir=/opt/source/mysql/data
chown -R root .
chown -R mysql ./data
```

### 可选的命令，将mysql的配置文件拷贝到/etc

``` bash
cp support-files/my-medium.cnf /etc/my.cnf
ps：如果原来的/etc目录下有my.cnf文件，则一定要用编译安装的my.cnf替换掉系统默认的my..cnf。否则会报错
```

### 启动mysql

``` bash
bin/mysqld_safe --user=mysql &
#启动mysql，看是否成功
netstat -tnl|grep 3306
或者
ps -aux|grep 'mysql'
```
``` bash
可选步骤：设置root 密码：
/opt/source/mysql/bin/mysqladmin -u root password 'new-password'
/opt/source/mysql/bin/mysqladmin -u root -h localhost.localdomain password 'new-password'  
```
