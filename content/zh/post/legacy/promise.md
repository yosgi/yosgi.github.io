---
title: promise
description: 《ES6标准入门》 知识点整理
categories:
  - JavaScript
tags:
  - JavaScript
  - JavaScript
date: 2018-06-27 13:18:47
summary: ""
---
![image](/images/promise/img1.png)

##### 基本用法

    const promise = new Promise(function(resolve, reject) {
      // ... some code
      if (/* 异步操作成功 */){
        resolve(value);
      } else {
        reject(error);
      }
    });

##### Promise参数

resolve函数的作用是，将Promise对象的状态从“pending”变为“resolved”，在异步操作成功时调用，并将异步操作的结果，作为参数传递出去；

reject函数的作用是，将Promise对象的状态从“pending”变为“rejected”，在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。

resolve函数的参数除了正常的值以外，还可能是另一个 Promise 实例

    const p1 = new Promise(function (resolve, reject) {
      // ...
    });
    
    const p2 = new Promise(function (resolve, reject) {
      // ...
      resolve(p1);
    })
p1和p2都是 Promise 的实例，但是p2的resolve方法将p1作为参数，即一个异步操作的结果是返回另一个异步操作。
这时p1的状态就会传递给p2，也就是说，p1的状态决定了p2的状态。

如果p1的状态是pending，那么p2的回调函数就会等待p1的状态改变；如果p1的状态已经是resolved或者rejected，那么p2的回调函数将会立刻执行。


summary: ""
---

一般来说，调用resolve或reject以后，Promise 的使命就完成了，后继操作应该放到then方法里面，而不应该直接写在resolve或reject的后面。所以，最好在它们前面加上return语句，这样就不会有意外。

##### 链式调用
then方法返回的是一个新的Promise实例，。因此可以采用链式写法，即then方法后面再调用另一个then方法。

    getJSON("/post/1.json").then(
      post => getJSON(post.commentURL)
    ).then(
      comments => console.log("resolved: ", comments),
      err => console.log("rejected: ", err)
    );
##### 错误捕获

promise抛出错误，会被catch方法指定的回调函数捕获。

Promise 在resolve语句后面，再抛出错误，不会被捕获。因为 Promise 的状态一旦改变，就永久保持该状态，不会再变了。

Promise 对象的错误具有“冒泡”性质，会一直向后传递，直到被捕获为止。也就是说，错误总是会被下一个catch语句捕获。

一般来说，不要在then方法里面定义 Reject 状态的回调函数（即then的第二个参数），总是使用catch方法。

