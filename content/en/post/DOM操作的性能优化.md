---
draft: true
original: 'content/zh/post/legacy/DOM操作的性能优化.md'
title: DOM操作的性能优化
description: 《高性能Javascript》 知识点整理
categories:
  - JavaScript
  - JavaScript
tags:
  - JavaScript
date: 2018-09-12 15:09:33
summary: ""
---

# ENGLISH TRANSLATION NEEDED

This is an automatically generated English stub. Please translate the content below into English and remove the `draft: true` flag when ready.

<!-- ORIGINAL CHINESE CONTENT STARTS -->
#### DOM为什么慢？

因为浏览器中DOM和Javascript是独立实现的，这个分离允许其他技术和语言比如VBScript能共享使用DOM，也造成了性能的消耗

#### HTML集合是数组吗?操作HTML集合有什么需要注意的？
HTML集合对象不是数组，因为没有push()或slice()之类的方法，但提供了length属性，HTML集合以一种“假定实时态”实时存在，当底层文档对象更新时，它也会自动更新。

    var alldivs = document.getElementsByTagName('div')
    for (var i=0 ; i<alldivs.length; i++) {
        document.body.appendChild(document.createElement('div'))
    }
    
以上的代码是个死循环，因为循环的退出条件alldivs.length在每次迭代都会增加。而且也很慢，因为每次迭代都执行查询操作

因此操作html集合应该先将其拷贝到普通数组以减少访问次数。且访问集合元素的时候使用局部变量。

#### querySelectorAll()和getElementsByTagName()有什么区别？为什么推荐使用第一种？
querySelectorAll()方法使用CSS选择器作为参数并返回一个NodeList,不会返回HTML集合，因此不会对应实时的文档结构，避免了性能和可能逻辑上产生的问题

#### 重绘与重排是什么？


浏览器下载完页面的所有组件，html，css，js，图片 之后会生成两个内部的组件结构，DOM树和渲染树，其中DOM树表示页面结构，渲染树表示DOM节点如何显示

在DOM树和渲染树构建完成，浏览器就会开始绘制页面元素，当DOM的变化影响了元素的几何属性，浏览器需要重新计算元素的几何属性，同样其它元素的几何属性也会受到影响，浏览器会使原先的渲染树受到影响的部分失效并重新构造渲染树，这个过程称为重排，重排完成后将受影响的部分重新绘制到屏幕中成为重绘。

它们会导致Web应用的UI反应迟钝，所以尽可能减少这类过程的发生。

#### 什么操作会强制渲染树队列的刷新？

offsetTop,offsetLeft...（获取偏移量）

scrollTop,scrollLeft...（获取滚动位置）

clientTop,clientWidth...

getComputedStyle（计算样式值）

#### 重排何时发生？怎么减少重绘和重排带来的影响？

当页面的布局和几何属性发生变化的时候，例如删除，添加DOM元素；元素的位置改变；元素的尺寸改变；页面渲染器初始化；浏览器窗口发生改变。

减小重绘和重排带来的影响可以合并多次对DOM样式的修改，然后一次性处理。或者直接修改class。

当需要对DOM元素进行一系列的操作时，可以通过是使元素脱离文档流->对元素进行多次改变->使元素带回文档流中，改过程只会出发两次重排，否则，对于元素进行的任何一次操作都会触发重排。

其中常见的办法是使用文档片断(document fragment) 在当前DOM之外构建一个子树，再把它拷贝回文档


#### 关于事件委托

在前面的[DOM事件流](https://www.yosgi.top/2018/08/29/DOM%E4%BA%8B%E4%BB%B6%E6%B5%81/)中有总结过 


#### 总结

提高DOM操作的性能总结有以下方法：

最小化DOM访问次数

需要多次访问某个DOM节点应该使用局部变量储存引用

处理HTML集合建议把长度缓存到变量中，如果需要经常操作建议拷贝到数组中

尽可能使用速度更快的API如querySelectorAll()和firstElementChild


留意重绘和重排，不要在修改布局信息时去查询布局信息


动画中使用绝对定位，拖放代理
<!-- ORIGINAL CHINESE CONTENT ENDS -->
