---
draft: false
original: content/zh/post/legacy/promise.md
title: promise
description: '"ES6 Standard Introduction" Knowledge Points Summary'
categories:
- JavaScript
tags:
- JavaScript
- JavaScript
date: 2018-06-27 13:18:47
summary: ''
---

![image](/images/promise/img1.png)

##### Basic usage

const promise = new Promise(function(resolve, reject) {
// ... some code
if (/* Asynchronous operation succeeded */) {
resolve(value);
} else {
reject(error);
}
});

##### Promise parameters

The resolve function changes the state of the Promise object from "pending" to "resolved". It is called when the asynchronous operation succeeds and passes the result of the asynchronous operation as a parameter.

The function of reject is to change the state of the Promise object from "pending" to "rejected". It is called when the asynchronous operation fails and passes the error reported by the asynchronous operation as a parameter.

In addition to normal values, the parameters of the resolve function may also be another Promise instance

const p1 = new Promise(function (resolve, reject) {
// ...
});

const p2 = new Promise(function (resolve, reject) {
// ...
resolve(p1);
})
Both p1 and p2 are instances of Promise, but p2's resolve method takes p1 as a parameter. This means that the result of one asynchronous operation is another asynchronous operation.
In this case, the state of p1 is passed to p2, meaning that the state of p1 determines the state of p2.

If the status of p1 is pending, then the callback function of p2 will wait for the status of p1 to change; if the status of p1 is already resolved or rejected, then the callback function of p2 will be executed immediately.

summary: ""
---

Generally speaking, after calling resolve or reject, the Promise's mission is completed. Subsequent operations should be placed in the then method, not directly after resolve or reject. Therefore, it is best to add a return statement before them to avoid unexpected situations.

##### Chaining Calls
The then method returns a new Promise instance. Therefore, you can use chaining, calling another then method after the then method.

    getJSON("/post/1.json").then(
      post => getJSON(post.commentURL)
    ).then(
      comments => console.log("resolved: ", comments),
      err => console.log("rejected: ", err)
    );
##### Error catching

If promise throws an error, it will be caught by the callback function specified by the catch method.

If a promise throws an error after the resolve statement, it will not be caught. This is because once the state of a promise changes, it remains in that state forever.

The error of the Promise object has the "bubbling" nature and will be passed back until it is caught. In other words, the error will always be caught by the next catch statement.

Generally speaking, do not define the Reject callback function (the second parameter of then) in the then method, always use the catch method.
