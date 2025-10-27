---
layout: herformancejs
title: ajax数据传输优化
description: 《高性能Javascript》 知识点整理
categories:
  - JavaScript
  - JavaScript
tags:
  - JavaScript
date: 2018-11-28 14:47:40
summary: ""
---
#### 使用XHR时，POST和GET的对比
发送数据到服务器时，GET方式会更快，因为对于少量数据而言，一个GET请求往服务器只发送一个数据包。而POST请求至少发送两个数据包，一个装载头信息，一个装载POST正文。POST更适合发送大量数据到服务器，一是因为它不关心额外数据包的数量，二是IE对URL的长度有限制。

对于不会改变服务器状态，只获取数据（幂等行为）的请求应该使用GET。经过GET请求的数据会被缓存起来，有助于提高多次请求的性能。

#### 动态脚本注入是什么？有什么特点？

    var scriptElement = document.createElement('script')
    scriptElement.src = 'http://xxx.com/lib.js'
    document.getElementsByTagName('head')[0].appendChild(scriptElement)
    function jsonCallBack(jsonString) {
        var data = eval('(' + jsonString + ')')
    }
    
    
    // lib.js
    jsonCallBack({"status":1})
利用JS创建一个新的脚本标签，并设置src属性为不同域的URL，可以进行跨域请求数据。

不能设置请求头，只能使用GET方式，必须等待所有数据返回才可以访问。

响应消息必须是可执行的JS代码

使用脚本注入到页面中的任何代码都可以控制页面，包括修改内容和重定向到其它网站，因此引入外部来源的代码需要小心

#### MXHR(Multipart XHR) 有什么特点？

能把多次的http请求合并成一次请求，减少请求的数量会提升页面的性能。

元素使用[data:URL](http://www.webhek.com/post/data-url.html)的方式创建，因此不能被浏览器缓存，当网站在每个页面使用一个独立打包的Js或者CSS文件时不会受此影响，比如单页面使用时，从外部加载一次CSS就可以了。

#### Beacons（网络信标） 是什么？

使用JavaScript创建一个Image对象，并把src属性设置为服务器上脚本的URL,URL包含需要传输的键值对数据。

    var url = '/status_tracker.php';
    var params = ['userName=yosgi','step=2'];
    (new Image).src = url + '?' + params.join('&');
    // 这段代码会对/status_tracker.php?step=2&time=23311  发送请求
    
它无需向客户端返回信息，没有图片会实际显示出来。

虽然性能消耗很小，但因为URL长度有最大值，所以可以发送的数据长度很少。只能靠监听Image对象的onload事件判断服务器是否已经接受数据。

#### JSON JSON-P 的区别

在使用XHR时，JSON数据被当成是字符串返回，紧接着字符串被eval()转换成原生对象。

而JSON-P数据被当成另一个Js文件并作为原生代码执行。


JSON-P可以跨域使用，涉及敏感数据的时候不应该使用它
#### 关于自定义格式

创建自定义格式的例子：

    'John;Jack;David'

只需要简单的把数据用分隔符链接，接收后使用split()即可

创建自定义格式时，最好是使用一个单字符，而且不应该存在于数据之中，ASCII字符表的前几个字符在大多数服务器语言能够正常工作。

    \u0001 \u0002
    
#### 总结优化Ajax的方法：

##### 减少请求数，合并JS和css文件，或者使用MXHR

##### 缩短页面的加载时间，页面主要内容加载之后，使用Ajax获取次要的

##### 知道何时使用成熟的Ajax类库，以及何时编写自己的底层Ajax代码（大多数javascrpt类库不允许直接访问readystatechange事件）
    

