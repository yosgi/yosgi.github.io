---
title: Js加载优化
description: 《高性能Javascript》 知识点整理
categories:
  - JavaScript
  - JavaScript
tags:
  - JavaScript
date: 2018-09-04 09:23:11
summary: ""
---
##### 为什么<script\>标签应该尽可能放到<body\>标签的底部？
因为脚本执行过程中可能会修改页面内容，Js的下载和执行会阻塞页面其它资源的下载，多数浏览器使用单一进程来处理UI刷新和Js脚本执行。

##### 扩展属性defer async 是什么，有什么作用？

defer指明本元素所含的脚本不会修改DOM,因此代码能安全地延迟执行。对应的Js文件将在页面解析到sctipt标签时开始下载，但不会执行，会在onload事件处理器执行之前被调用。defer的script可以和页面的其它资源并行下载。（defer属性仅当src属性声明时才有效）


async用于异步加载脚本。defer与async的相同点是采用并行下载，在下载过程中不会产生阻塞。

区别是async是在加载完成之后自动执行，defer需要等待页面完成后执行。

##### 什么是动态脚本元素？如何创建？

使用DOM方法可以动态创建<script\>元素。无论何时启动下载，文件的下载和执行过程不会阻塞页面的其它进程，是最通用的无阻塞加载解决方式。
    
    function loadScript (url, callback) {
                var script = document.createElement('script')
                script.type = 'text/javascript'
                script.onload = function () {
                    callback()
                    // 需要确保脚本下载就绪，才能被其它地方调用
                }
                script.src = url
                document.getElementsByTagName('head')[0].appendChild(script)
            }
##### XMLHttpRequest脚本注入怎么用？有什么局限性？

    var xhr = new XMLHttpRequest()
                xhr.open('get', 'test.js', true)
                xhr.onreadystatechange = function () {
                    if(xhr.readyState === 4) {
                        if (xhr.status >=200 && xhr.status < 30 || xhr.status == 304) {
                            var script = document.createElement('script')
                            script.type = 'text/javascript'
                            script.text  = xhr.responseText
                            document.getElementsByTagName('head')[0].appendChild(script)
                        }    
                    }
                }
                xhr.send(null)
                
