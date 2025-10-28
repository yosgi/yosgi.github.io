---
draft: true
original: 'content/zh/post/legacy/Web安全浅述.md'
title: Web安全浅述
description: web安全相关整理
categories:
  - Frontend
tags:
  - Frontend
  - JavaScript

date: 2018-07-05 10:05:36
summary: ""
---

# ENGLISH TRANSLATION NEEDED

This is an automatically generated English stub. Please translate the content below into English and remove the `draft: true` flag when ready.

<!-- ORIGINAL CHINESE CONTENT STARTS -->
![image](/images/web-security-overview/img1.png)

#### XSS
##### 概念
跨站脚本攻击(Cross-Site Scripting)是通过存在安全漏洞的Web网站注册用户的浏览器运行非法HTML标签或者Javascript进行的一种攻击。动态创建的HTML部分可能有隐藏的安全漏洞,攻击者编写脚本设下陷阱，用户在自己的浏览器上运行时，一不小心就会受到被动攻击。
##### 可能造成的影响
- 利用虚假输入表单骗取用户个人信息
- 利用脚本窃取用户的cookie值，发送恶意请求
- 显示伪造的文章或者图片

##### 分类
一类是反射型XSS，又称非持久型XSS，具体表现在我们把我们的恶意脚本通过url的方式传递给了服务器，而服务器则只是不加处理的把脚本“反射”回访问者的浏览器而使访问者的浏览器执行相应的脚本。

一类是储存型XSS，也就是持久型XSS。它与反射型XSS最大的不同就是服务器再接收到我们的恶意脚本时会将其做一些处理。

例如储存到数据库中，然后当我们再次访问相同页面时，将恶意脚本从数据库中取出并返回给浏览器执行。

例如当有人在留言内容中插入恶意脚本时，由于服务器要像每一个访客展示之前的留言内容，所以后面的访客自然会接收到之前留言中的恶意脚本而不幸躺枪。

##### 案例

网上XSS的举例有很多[例子1](https://blog.csdn.net/u011781521/article/details/53894399/)
[例子2](https://blog.csdn.net/ganyingxie123456/article/details/70230486)

##### XSS的防御措施
原则：宁死也不让数据变成可执行的代码，不信任任何用户的数据，严格区分数据和代码。
1. HttpOnly    浏览器禁止页面的JS访问带有HttpOnly属性的Cookie。
2. 输入检查 XSS Filter     对输入内容做格式检查，类似“白名单”，可以让一些基于特殊字符的攻击失效。在客户端JS和服务器端代码中实现相同的输入检查（服务器端必须有）
3. 输出检查     在变量输出到html页面时，可以使用编码或转义的方式来防御XSS攻击  HtmlEncode：将字符转成HTMLEntities，对应的标准是ISO-8859-1。    JS中可以使用JavascriptEncode。需要对“\”对特殊字符转义，输出的变量的必须在引号内部。

######  在Html标签中输出：
    

    <div>$var</div> 
    
在标签中输出的变量，如果未做任何处理，都能导致直接产生XSS

    <div><script>alert(/XSS/)</script></div>  或者  <a href=# ><img src=# onerror=alert(1) /></a>
 防御方法：对变量使用HtmlEncode。
 
######  在Html属性中输出：
 
    <div id="abc name="$var"></div> 
    
攻击方法：
    
    <div id="abc" name=""><script>alert(/XSS/)</script><""></div>

防御方法：采用HtmlEncode。


###### 在在CSS中输出：方式多样

 防御方法：尽可能禁止用户可控制的变量在
 
    "style标签"、"html标签的style属性"、"CSS文件"中输出。
 
 
 在地址中输出：比较复杂。一般是在URL的path(路径)或者search(参数)中输出，使用URLEncode即可。
    
 整个URL都被用户完全控制时，URL的Protocal(http://) 和Host (www.xxx.com)部分不能使用URLEncode，可能会构造伪协议实施攻击：
 
防御方法：先检查变量是否以http开头（如果不是则自动添加），以保证不会出现伪协议类的XSS攻击。在此之后，再对变量进行URLEncode。
###### 处理富文本
 防御方法：与输入检查的思路一致。使用"XSS Filter"：“事件”应该被严格禁止；一些危险的标签：
 
    <iframe>、<script>、<base>、<form>
    
 等也应严格禁止；在标签、属性、事件的选择上，应该使用白名单，避免使用黑名单。比如，只允许
 
    <a>、<img>、<div>
 
 等比较“安全”的标签存在。
 
######  防御DOM Based XSS 

果是输出到事件或脚本，要做一次javascriptEncode；如果是输出到HTML内容或者属性，要做一次HtmlEncode。

#### CSRF攻击

跨站点请求伪造(Cross-Site Request Forgeries,CSRF)攻击是攻击者通过设置好的陷阱，强制对已完成认证的用户进行非预期的个人信息或设定信息等某些状态更新，属于被动攻击。

##### 案例
[CSRF攻击与防御](https://blog.csdn.net/stpeace/article/details/53512283)

##### 防御CSRF

CSRF 防御可以从服务端和客户端两方面着手，防御效果是从服务端着手效果比较好，现在一般 CSRF 防御在服务端进行的。

1. 关键操作只接受 POST 请求与验证码

CSRF 攻击的过程，往往是在用户不知情的情况下发生的，在用户不知情的情况下构造网络请求，所以如果使用验证码，那么每次操作都需要用户进行互动，从而简单有效地防御了 CSRF 的攻击。

但是如果你在一个网站作出任何举动都要输入验证码的话会严重影响用户体验，所以验证码一般只出现在特殊操作里面，或者在注册时候使用。

2.检测 Referer

常见的互联网页面与页面之间是存在联系的，之前的网址一定保留在新页面中 Referer 属性中。
通过检查 Referer 的值，我们就可以判断这个请求是合法的还是非法的.

但是问题出在服务器不是任何时候都接受到 Referer 的值，所以 Referer Check 一般用于监控 CSRF 攻击的发生，而不用来抵御攻击。

3.Cookie Hashing(所有表单都包含同一个伪随机值)：

这可能是最简单的解决方案了，因为攻击者不能获得第三方的Cookie(理论上)，所以表单中的数据也就构造失败了

在表单里增加Hash值，以认证这确实是用户发送的请求，然后在服务器端进行Hash值验证

除非用户Cookie由于网站的XSS漏洞而被盗取。一般的攻击者看到有需要算Hash值，基本都会放弃了。


#### SQL注入攻击

SQL注入攻击是黑客对数据库进行攻击的常用手段之一。原因是有没对用户输入数据的合法性进行判断，使应用程序存在安全隐患，用户可以提交一段数据库查询代码，根据程序返回的结果，获得某些他想得知的数据，这就是所谓的SQL Injection，即SQL注入。

##### 例子
某个网站的登录验证的SQL查询代码为：

    strSQL = "SELECT * FROM users WHERE (name = '" + userName + "') and (pw = '"+ passWord +"');" 

恶意填入

    userName = "1' OR '1'='1";
与

    passWord = "1' OR '1'='1";
    
时，将导致原本的SQL字符串被填为


    strSQL = "SELECT * FROM users WHERE (name = '1' OR '1'='1') and (pw = '1' OR '1'='1');"

也就是实际上运行的SQL命令会变成下面这样的

    strSQL = "SELECT * FROM users;"

因此达到无账号密码，亦可登录网站。所以SQL注入攻击被俗称为黑客的填空游戏。

##### 防御方法

从安全技术手段上来说，可以通过数据库防火墙实现对SQL注入攻击的防范，因为SQL注入攻击往往是通过应用程序来进攻，可以使用虚拟补丁技术实现对注入攻击的SQL特征识别，实现实时攻击阻断。

#### OS命令注入

OS命令注入和SQL注入差不多，只不过SQL注入是针对数据库的，而OS命令注入是针对操作系统的。OS命令注入即能够在服务器上执行任意命令。

##### 防御方法

1. 不要调用外部程序。举个例子，在UNIX系统上，有一个叫CGI的程序，可以执行sendmail命令来发送邮件。也许你的web应用程序也有发送邮件的功能，通过直接调用CGI程序发送邮件非常的简单，但是不要这样做，因为在执行sendmail命令的同时，也会混杂进其他OS命令，正确的做法是使用发送邮件的library。

2.过滤 、; ，[ ，] ，| ，< ，> ，\ 之类的符号

3.设置用户的权限

#### HTTP首部注入攻击

HTTP首部注入攻击(HTTPHeader Injection)是指攻击者通过在响应首部字段内插入换行，添加任意响应首部或主体的一种攻击。

其中首部主体内添加内容的攻击称为HTTP响应截断攻击(HTTPResponse Splitting Attack)

HTTP首部注入可能，通过在某些响应首部字段需要处理输出值的地方，插入换行发动攻击。

##### 例子
例如一个的请求如下：

    GET / HTTP/1.1
    Host: www.example.com
    Connection: keep-alive
    Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
    Upgrade-Insecure-Requests: 1
    User-Agent: Mozilla/5.0'(select*from(select(sleep(20)))a) #
    Accept-Encoding: gzip, deflate, sdch
    Accept-Language: en-US,en;q=0.8,fr;q=0.6

HTTP协议的User-Agent头部为“Mozilla/5.0’(select*from(select(sleep(20)))a) #”。其中“select * from (select(sleep(20)))”是不正常的，这里的攻击主要是让数据库什么也不干而睡眠20秒，从而浪费数据库处理线程。这是一个简单的注入，除此之外还能进行更多复杂的攻击。

##### 可能会造成影响：

1. 设置任何Cookie信息

2. 重定向至任意URL

3. 显示任意的主体(HTTP响应截断攻击)
<!-- ORIGINAL CHINESE CONTENT ENDS -->
