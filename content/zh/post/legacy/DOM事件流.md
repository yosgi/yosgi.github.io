---
title: DOM事件流
description: DOM事件流易混点整理
summary: ""
categories:
  - JavaScript
tags:
  - JavaScript
date: 2018-08-29 17:29:45
---
一直以来对这个概念不是特别的清楚，这次通过资料和实验总结一下

### 定义


#### 事件冒泡

> IE的事件流叫做事件冒泡。即事件开始时由最具体的元素（event target）接收，然后逐级向上传播到较为不具体的节点（文档）。所有现代浏览器都支持事件冒泡，并且会将事件一直冒泡到window对象。

#### 事件捕获
> 事件捕获的思想是不太具体的节点应该更早的接收到事件，而在最具体的节点应该最后接收到事件。事件捕获的用以在于事件到达预定目标之前捕获它。IE9+、Safari、Chrome、Opera和Firefox支持，且从window开始捕获（尽管DOM2级事件规范要求从document）。由于老版本浏览器不支持，所以很少有人使用事件捕获。

#### DOM事件流
> “DOM2级事件”规定事件流包括三个阶段，事件捕获阶段、处于目标阶段和事件冒泡阶段。首先发生的事件捕获，为截获事件提供了机会。然后是实际的目标接收了事件。最后一个阶段是冒泡阶段，可以在这个阶段对事件做出响应。

![image](/images/dom-event-flow/img1.png)

---


下面看例子

![image](/images/dom-event-flow/img2.png)

     <div id="wrapDiv">wrapDiv
        <p id="middleP">middleP
            <span id="innerSpan">innerSpan</span>
        </p>
    </div>
    


    #wrapDiv, #middleP, #innerSpan{
        margin: 5px;padding: 5px;box-sizing: border-box;cursor: default;
    }
    #wrapDiv{
        width: 300px;height: 300px;border: indianred 3px solid;
    }
    #middleP{
        width: 200px;height: 200px;border: hotpink 3px solid;
    }
    #innerSpan{
        display: block;width: 100px;height: 100px;border: orange 3px solid;
    }
    
    
    var wrapDiv = document.getElementById("wrapDiv");
    var middleP = document.getElementById("middleP");
    var innerSpan = document.getElementById("innerSpan");

##### 事件捕获元素（冒泡）的触发次序
先来看一下事件捕获

    middleP.addEventListener("click", function(e){
        console.log("middleP 捕获", e.target.nodeName, e.currentTarget.nodeName);
    }, true);
    wrapDiv.addEventListener("click", function(e){
        console.log("wrapDiv 捕获", e.target.nodeName, e.currentTarget.nodeName);
    }, true);
    innerSpan.addEventListener("click", function(e){
        console.log("innerSpan 捕获", e.target.nodeName, e.currentTarget.nodeName);
    }, true);
    //wrapDiv 捕获 SPAN DIV middleP 捕获 SPAN P innerSpan 捕获 SPAN SPAN


可以看到，绑定的顺序并不影响捕获顺序，事件捕获是
**不太具体的节点应该更早的接收到事件**

而事件冒泡是

** 即事件开始时由最具体的元素（event target）接收，然后逐级向上传播到较为不具体的节点**

这点就不再实验了。
##### e.target和e.currentTarget

再说上述代码的两个属性e.target和e.currentTarget，可以看到

 **target是触发事件者，而currentTarget是监听事件者**


##### 事件捕获和冒泡谁先发生？

接下来再做一个实验，看看捕获和冒泡谁先发生

    //冒泡阶段事件
    middleP.addEventListener("click", function(e){
        console.log("middleP 冒泡", e.target.nodeName, e.currentTarget.nodeName);
    }, false);
    wrapDiv.addEventListener("click", function(e){
        console.log("wrapDiv 冒泡", e.target.nodeName, e.currentTarget.nodeName);
    }, false);
    innerSpan.addEventListener("click", function(e){
        console.log("innerSpan 冒泡", e.target.nodeName, e.currentTarget.nodeName);
    }, false);
    // 捕获阶段绑定事件
    middleP.addEventListener("click", function(e){
        console.log("middleP 捕获", e.target.nodeName, e.currentTarget.nodeName);
    }, true);
    wrapDiv.addEventListener("click", function(e){
        console.log("wrapDiv 捕获", e.target.nodeName, e.currentTarget.nodeName);
    }, true);
    innerSpan.addEventListener("click", function(e){
        console.log("innerSpan 捕获", e.target.nodeName, e.currentTarget.nodeName);
    }, true);
    //wrapDiv 捕获 SPAN DIV
    // middleP 捕获 SPAN P
    //innerSpan 冒泡 SPAN SPAN
    //innerSpan 捕获 SPAN SPAN
    // middleP 冒泡 SPAN P
    // wrapDiv 冒泡 SPAN DIV
    
按理说，捕获事件应该在冒泡之前发生。

可是innerSpan的冒泡先发生。
对这个结果的解释是：

处于**目标阶段**的事件流，事件处理程序被调用的顺序是**注册的顺序**

也就是说，事件流到p这个元素的时候，**target和currentTarget是一致的**，认为已经不需要捕获了，此时就按顺序执行已经预定的事件处理函数，处理完后再冒泡。
#### event.stopPropagation
stopPropagation 的作用是阻止捕获和冒泡阶段中当前事件的进一步传播。
还是拿上面的例子进行试验，注意我在innerspan的冒泡阶段增加了e.stopPropagation()

    //冒泡阶段事件
    middleP.addEventListener("click", function(e){
        console.log("middleP 冒泡", e.target.nodeName, e.currentTarget.nodeName);
    }, false);
    wrapDiv.addEventListener("click", function(e){
        console.log("wrapDiv 冒泡", e.target.nodeName, e.currentTarget.nodeName);
    }, false);
    innerSpan.addEventListener("click", function(e){
        e.stopPropagation()
        console.log("innerSpan 冒泡", e.target.nodeName, e.currentTarget.nodeName);
    }, false);
    // 捕获阶段绑定事件
    middleP.addEventListener("click", function(e){
        console.log("middleP 捕获", e.target.nodeName, e.currentTarget.nodeName);
    }, true);
    wrapDiv.addEventListener("click", function(e){
        console.log("wrapDiv 捕获", e.target.nodeName, e.currentTarget.nodeName);
    }, true);
    innerSpan.addEventListener("click", function(e){
        console.log("innerSpan 捕获", e.target.nodeName, e.currentTarget.nodeName);
    }, true);
    //wrapDiv 捕获 SPAN DIV
    //middleP 捕获 SPAN P
    //innerSpan 冒泡 SPAN SPAN
    //innerSpan 捕获 SPAN SPAN

可以看到的是，e.stopPropagation阻止了后续的middleP，wrapDiv的冒泡事件触发。

你可能会说，不对，在innerSpan的冒泡之后，innerSpan的捕获还是发生了没有被阻止啊？这就要看stopImmediatePropagation了。


##### event.stopPropagation stopImmediatePropagation的区别

stopPropagation 的作用是阻止捕获和冒泡阶段中当前事件的进一步传播。

stopImmediatePropagation
的作用是阻止事件冒泡并且阻止相同事件的其他侦听器被调用。

下面试验：
    
    innerSpan.addEventListener("click", function(e){
        e.stopImmediatePropagation()
        console.log("innerSpan 冒泡", e.target.nodeName, e.currentTarget.nodeName);
    }, false);
    innerSpan.addEventListener("click", function(e){
        console.log("innerSpan 捕获", e.target.nodeName, e.currentTarget.nodeName);
    }, true);
    //innerSpan 冒泡 SPAN SPAN

这下捕获事件的触发也被阻止了。
    
> 从概念上讲，在调用完stopPropagation函数之后，就会立即停止对后续节点的访问，但是会执行完绑定到当前节点上的所有事件处理程序；而调用stopImmediatePropagation函数之后，除了所有后续节点，绑定到当前元素上的、当前事件处理程序之后的事件处理程序就不会再执行了
> 

##### onclick是捕获阶段还是冒泡阶段发生？

不试验了，直接说结论，冒泡。


##### 事件委托

> 　　在JavaScript中，添加到页面上的事件处理程序数量将直接关系到页面的整体运行性能。导致这一问题的原因是多方面的。首先，每个函数都是对象，都会占用内存；内存中的对象越多，性能就越差。其次，必须事先指定所有事件处理程序而导致的DOM访问次数，会延迟整个页面的交互就绪时间。



> 　　对“事件处理程序过多”问题的解决方案就是事件委托。事件委托利用了事件冒泡，只指定一个事件处理程序，就可以管理某一类型的所有事件。例如，click事件会一直冒泡到document层次。也就是说，我们可以为整个页面指定一个onclick事件处理程序，而不必给每个可单击的元素分别添加事件处理程序。

比如

    (function(){
        var lists = document.getElementById('lists');
        lists.addEventListener('click',showColor,false);
        function showColor(e){
            var x = e.target;
            if(x.nodeName.toLowerCase() === 'li'){
                alert('The color is ' + x.innerHTML);
            }
        }
    })();
而不用去遍历整个li列表

#### 用冒泡还是捕获？
> 对于事件代理来说，在事件捕获或者事件冒泡阶段处理并没有明显的优劣之分，但是由于事件冒泡的事件流模型被所有主流的浏览器兼容，从兼容性角度来说还是建议使用事件冒泡模型。

