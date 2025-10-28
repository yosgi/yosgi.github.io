---
draft: false
original: content/zh/post/legacy/Iterator.md
title: Iterator
description: '"ES6 Standard Introduction" Knowledge Points Summary'
categories:
- JavaScript
tags:
- JavaScript
- JavaScript
date: 2018-07-04 10:55:08
summary: ''
---

![image](/images/iterator/img1.png)

#### Iterator traversal process

1. Create a pointer object that points to the beginning of the current data structure. In other words, a traversal object is essentially a pointer object.
2. The first call to the pointer object's next method sets the pointer to the first member of the data structure.
3. The second call to the pointer object's next method sets the pointer to the second member of the data structure.
4. Continue calling the pointer object's next method until it points to the end of the data structure.

#### Other

The default Iterator interface is implemented in the Symbol.iterator property of the data structure.

The following is an example of simulating the return value of the next method.

    var it = makeIterator(['a', 'b']);
    
    it.next() // { value: "a", done: false }
    it.next() // { value: "b", done: false }
    it.next() // { value: undefined, done: true }
    
    function makeIterator(array) {
      var nextIndex = 0;
      return {
        next: function() {
          return nextIndex < array.length?
            {value: array[nextIndex++], done: false} :
            {value: undefined, done: true};
        }
      };
    }

Example of calling the Symbol.iterator method of an array on an array-like object.

    let iterable = {
      0: 'a',
      1: 'b',
      2: 'c',
      length: 3,
      [Symbol.iterator]: Array.prototype[Symbol.iterator]
    };
    for (let item of iterable) {
      console.log(item); // 'a', 'b', 'c'
