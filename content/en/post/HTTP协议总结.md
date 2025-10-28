---
draft: true
original: 'content/zh/post/legacy/HTTP协议总结.md'
title: HTTP协议总结
description: HTTP简单整理
categories:
  - Web
tags:
  - Frontend
  - Web
date: 2018-07-23 23:29:19
summary: ""
---

# ENGLISH TRANSLATION NEEDED

This is an automatically generated English stub. Please translate the content below into English and remove the `draft: true` flag when ready.

<!-- ORIGINAL CHINESE CONTENT STARTS -->
主要是对阅读《图解http》后的自己的一些总结，其中省略了不少我认为不重要或者没有理解的部分。在以后知识面拓宽后进行修正和补漏。

##  首先是HTTP协议脑图

![image](/images/http-protocol-summary/img1.png)

## 其它

### 从输入url到页面展示发生了什么

一道很常见的面试题目，能方便我们复习HTTP中的内容，根据上面的脑图和其它资料很容易就能解答。

#### 查找域名IP

发生在TCP/IP协议的应用层。由DNS协议相关。

1. 浏览器首先搜索自己的DNS缓存
2. 搜索系统的hosts文件
3. 搜索路由器的DNS缓存
4. 搜索服务商DNS缓存，如果没有，则向跟域名服务器发送查找请求，直到找到IP地址。

#### HTTP请求发起
HTTP的请求报文包括报文首部和报文主体。

报文首部又包括：
1. 请求行
2. 请求首部
3. 通用首部
4. 实体首部

常见的请求首部

    Accept: text/html,image/*                                      #浏览器可以接收的类型
    Accept-Charset: ISO-8859-1                                     #浏览器可以接收的编码类型
    Accept-Encoding: gzip,compress                                 #浏览器可以接收压缩编码类型
    Accept-Language: en-us,zh-cn                                   #浏览器可以接收的语言和国家类型
    Host: www.lks.cn:80                                            #浏览器请求的主机和端口
    If-Modified-Since: Tue, 11 Jul 2000 18:23:51 GMT               #某个页面缓存时间
    Referer: http://www.lks.cn/index.html                          #请求来自于哪个页面
    User-Agent: Mozilla/4.0 compatible; MSIE 5.5; Windows NT 5.0   #浏览器相关信息
    Cookie:                                                        #浏览器暂存服务器发送的信息
    Connection: close1.0/Keep-Alive1.1                             #HTTP请求的版本的特点
    Date: Tue, 11 Jul 2000 18:23:51GMT                             #请求网站的时间
    Allow:GET                                                      #请求的方法 GET 常见的还有POST
    Keep-Alive:5                                                   #连接的时间；5
    Connection:keep-alive                                          #是否是长连接
    Cache-Control:max-age=300                                      #缓存的最长时间 300s
        

下面主要说下缓存规则

##### HTTP缓存

HTTP缓存根据是否需要重新向服务器发起请求分为强制缓存和对比缓存两大类，强制缓存如果生效，不需要再和服务器发生交互；对比缓存不管是否生效，都需要和服务器发生交互。

两类缓存规则可以同时存在，强制缓存优先级高于对比缓存。当强制缓存执行时不再执行对比缓存规则。

###### 强制缓存


Expires/Cache-control标明失效规则，在客户端第一次请求，服务器把数据返回后，浏览器将数据缓存。

Expire的值表示了缓存的到期时间，是HTTP1.0的东西，所以它的作用基本忽略。Expire的缺点是返回的到期时间是服务器的时间，而比较的时间是客户端本地时间，可能会导致差错。

Cache-Control用于定义缓存指示，会覆盖Expires,包括public，private，no-cache，no-store、max-age、s-maxage以及must-revalidate等

###### 对比缓存

对比缓存需要进行比较判断是否可以使用缓存。


在浏览器第一次请求数据时，服务器会将缓存标识与数据一起返回客户端。再次请求时，客户端将缓存标识发给服务器，服务器根据标识进行判断，如果缓存生效则返回304；且只返回header部分。

Last-Modified：服务器在响应请求时返回的资源最后修改时间。

If-Modified-Since：再次请求服务器时，通过此字段通知服务器上次请求时，服务器返回的资源最后修改时间。

服务器收到请求后发现有头If-Modified-Since 则与被请求资源的最后修改时间进行比对。若资源的最后修改时间大于If-Modified-Since，说明资源又被改动过，则响应整片资源内容，返回状态码200；
若资源的最后修改时间小于或等于If-Modified-Since，说明资源无新修改，则响应HTTP 304，告知浏览器继续使用所保存的cache。

Last-Modified 标注的最后修改时间只能精确到秒，如果有些资源在一秒之内被多次修改的话，他就不能准确标注文件的新鲜度了如果某些资源会被定期生成，当内容没有变化，但 Last-Modified 却改变了，导致文件没使用缓存有。可能存在服务器没有准确获取资源修改时间，或者与代理服务器时间不一致的情形。

Etag/If-None-Match规则（优先级高于Last-Modified/If-Modified-Since）

Etag：
服务器资源的唯一标识符, 浏览器可以根据ETag值缓存数据, 节省带宽. 如果资源已经改变, etag可以帮助防止同步更新资源的相互覆盖. ETag 优先级比 Last-Modified 高.

If-None-Match：
再次请求服务器时，通过此字段通知服务器客户段缓存数据的唯一标识。

服务器收到请求后发现有头If-None-Match 则与被请求资源的唯一标识进行比对，
不同，说明资源又被改动过，则响应整片资源内容，返回状态码200；
相同，说明资源无新修改，则响应HTTP 304，告知浏览器继续使用所保存的cache。


###### 不能缓存的请求

HTTP 信息头中包含Cache-Control:no-cache，pragma:no-cache，或Cache-Control:max-age=0 等告诉浏览器不用缓存的请求

需要根据Cookie，认证信息等决定输入内容的动态请求是不能被缓存的

经过HTTPS安全加密的请求


HTTP 响应头中不包含 Last-Modified/Etag，也不包含 Cache-Control/Expires 的请求无法被缓存

POST请求


#### 传输层TCP传输报文

 位于传输层的TCP协议为传输报文提供可靠的字节流服务。它为了方便传输，将大块的数据分割成以报文段为单位的数据包进行管理，并为它们编号，方便服务器接收时能准确地还原报文信息。TCP协议通过“三次握手”等方法保证传输的安全可靠。

  “三次握手”的过程是，发送端先发送一个带有SYN（synchronize）标志的数据包给接收端，在一定的延迟时间内等待接收的回复。接收端收到数据包后，传回一个带有SYN/ACK标志的数据包以示传达确认信息。接收方收到后再发送一个带有ACK标志的数据包给接收端以示握手成功。在这个过程中，如果发送端在规定延迟时间内没有收到回复则默认接收方没有收到请求，而再次发送，直到收到回复为止。
  
  
  
####   网络层IP协议查询MAC地址

  IP协议的作用是把TCP分割好的各种数据包传送给接收方。而要保证确实能传到接收方还需要接收方的MAC地址，也就是物理地址。IP地址和MAC地址是一一对应的关系，一个网络设备的IP地址可以更换，但是MAC地址一般是固定不变的。ARP协议可以将IP地址解析成对应的MAC地址。当通信的双方不在同一个局域网时，需要多次中转才能到达最终的目标，在中转的过程中需要通过下一个中转站的MAC地址来搜索下一个中转目标。
  
  
####   数据到达数据链路层

   在找到对方的MAC地址后，就将数据发送到数据链路层传输。这时，客户端发送请求的阶段结束
   
#### 服务器响应请求

服务接收到客户端发送的HTTP请求后，查找客户端请求的资源，并返回响应报文

#### 服务器返回相应文件，页面渲染

现代浏览器渲染页面的过程是这样的：jiexiHTML以构建DOM树 –> 构建渲染树 –> 布局渲染树 –> 绘制渲染树。

   DOM树是由HTML文件中的标签排列组成，渲染树是在DOM树中加入CSS或HTML中的style样式而形成。渲染树只包含需要显示在页面中的DOM元素，像<head>元素或display属性值为none的元素都不在渲染树中。
<!-- ORIGINAL CHINESE CONTENT ENDS -->
