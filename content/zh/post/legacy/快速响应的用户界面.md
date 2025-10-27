---
title: UI界面响应优化
description: 《高性能Javascript》 知识点整理
categories:
  - JavaScript
  - JavaScript
tags:
  - JavaScript
date: 2018-11-22 16:55:21
summary: ""
---
#### 怎么理解Javascript是单线程，浏览器是多线程?

浏览器内核是多线程的，（浏览器为每个TAB页面单独启用进程。[进程与线程的关系](http://www.imweb.io/topic/58e3bfa845e5c13468f567d5)），通常由以下常驻线程组成

GUI渲染线程

JavaScript引擎线程

定时器触发线程

事件触发线程

异步http请求线程


Javascript是单线程的，因为Js需要操作DOM树，如果是多线程的操作DOM,可能会出现UI操作冲突



    
#### 怎么记录代码运行时间？

可以通过原生的Date对象来跟踪代码的运行时间

    var start = + Date()
    //(+)可以将Date对象转化为数字
    

#### 怎么使用定时器分解任务，并增加时间检测机制来改进？

    var todo = item.concat()
    // 克隆原数组
    setTimeout(function() {
        // 获取数组的下个元素并处理
        process(todo.shift())
        // 如果还有需要处理的元素，则创建另一个定时器
        if (todo.length > 0) {
            setTimeout(arguments.callee, 25)
        } else {
            callback(items)
        }
    },25)

有的时候只执行一个任务的效率不高，例如：如果处理一个长度为1000项的数组，每处理一项需要1毫秒，如果每个定时器只处理一项，且在两次处理之间产生25毫秒的延时，数组处理的总时间为 （25+1）x 1000毫秒，如果修改成一次处理50个，处理时间为（1000/50） *25 +  1000 = 1500毫秒，比单个处理更快。

    function timedProcessArray(items, process, callback) {
        var todo = items.concat()
        setTimeout(function ()  {
            // 这里不能使用箭头函数 因为箭头函数没有arguments
            var start = +new Date()
            do {
                process(todo.shift())
                // 处理完后检测时间，如果所用时间小于50毫秒继续处理
            } while(todo.length > 0 && (+new Date() - start < 50))
            if(todo.length > 0 ) {
                setTimeout(arguments.callee, 25)
            } else {
                callback()
            }
        },25)
    }

#### 定时器对性能有影响吗？

上述的代码使用了定时器序列，同一时间只有一个定时器存在，只有在定时器结束才会创建下一个，这种使用方式不会导致性能问题。

当多个重复定时器同时创建会出现问题，所有的定时器都在争夺运行时间；间隔在1秒或1秒以上的低频率重复定时器不会出现问题，当在100到200毫秒间的多个重复定时器会出现问题。
因此应该用一个独立的重复定时器，每次执行多个操作。

#### 总结

JavaScript任务不应该执行过多的时间（100毫秒），否则会使UI更新出现延迟，影响用户体验

定时器可以让代码延迟执行，可以把长时间运行的代码分解成多个短时间的代码


#### 关于事件循环

事件循环是主线程从任务队列中读取事件，这个过程是循环不断的，被称为事件循环。

主线程运行的时候，产生堆（heap）和栈（stack），栈中的代码调用各种外部API，它们在"任务队列"中加入各种事件（click，load，done）。只要栈中的代码执行完毕，主线程就会去读取"任务队列"，依次执行那些事件所对应的回调函数。

其中定时器事件就是放在任务队列中，setTimeout(fn,100)的含义是。它100毫秒后在"任务队列"的尾部添加一个事件，因此要等到同步任务和"任务队列"现有的事件都处理完，才会得到执行。所以并没有办法保证，回调函数一定会在setTimeout()指定的时间执行。

