---
draft: true
original: 'content/zh/post/legacy/Iterator.md'
title: Iterator
description: 《ES6标准入门》 知识点整理
categories:
  - JavaScript
tags:
  - JavaScript
  - JavaScript
date: 2018-07-04 10:55:08
summary: ""
---

# ENGLISH TRANSLATION NEEDED

This is an automatically generated English stub. Please translate the content below into English and remove the `draft: true` flag when ready.

<!-- ORIGINAL CHINESE CONTENT STARTS -->
![image](/images/iterator/img1.png)

#### Iterator 的遍历过程

1. 创建一个指针对象，指向当前数据结构的起始位置。也就是说，遍历器对象本质上，就是一个指针对象。
2. 第一次调用指针对象的next方法，可以将指针指向数据结构的第一个成员。
3. 第二次调用指针对象的next方法，指针就指向数据结构的第二个成员。
4. 不断调用指针对象的next方法，直到它指向数据结构的结束位置。

#### 其它


默认的 Iterator 接口部署在数据结构的Symbol.iterator属性

下面是一个模拟next方法返回值的例子。

    var it = makeIterator(['a', 'b']);
    
    it.next() // { value: "a", done: false }
    it.next() // { value: "b", done: false }
    it.next() // { value: undefined, done: true }
    
    function makeIterator(array) {
      var nextIndex = 0;
      return {
        next: function() {
          return nextIndex < array.length ?
            {value: array[nextIndex++], done: false} :
            {value: undefined, done: true};
        }
      };
    }

类似数组的对象调用数组的Symbol.iterator方法的例子。

    let iterable = {
      0: 'a',
      1: 'b',
      2: 'c',
      length: 3,
      [Symbol.iterator]: Array.prototype[Symbol.iterator]
    };
    for (let item of iterable) {
      console.log(item); // 'a', 'b', 'c'
<!-- ORIGINAL CHINESE CONTENT ENDS -->
