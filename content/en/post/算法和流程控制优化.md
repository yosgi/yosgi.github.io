---
draft: false
original: content/zh/post/legacy/算法和流程控制优化.md
title: Algorithm and process control optimization
description: High Performance Javascript Knowledge Points
categories:
- JavaScript
- JavaScript
tags:
- JavaScript
date: 2018-10-25 14:33:59
summary: ''
---

#### Performance comparison of for, while, and do-while loops. How can I improve them?
The performance of the three loops is comparable. Avoid using for-in loops.

The best way to improve loop performance is to reduce the amount of computation per iteration and to reduce the number of loop iterations.

#### Why does a reverse-order loop improve performance?
// Forward order
let len = items.length
for (let i = 0; i < len ; i++) {
}
// Reverse order
for (let i = items.length; i-- ; ) {
}

Because the number of iterations is reduced.
The control condition is reduced from two comparisons (is the number of iterations less than the total number? Is it true?) to one comparison (is it true?).

#### Example: How to use iteration instead of recursion?

// Recursive form of the Fibonacci sequence
function fibonacci(num) {
if(num === 1 || num === 2) {
return 1
}
return fibonacci(num - 1) + fibonacci(num - 2)
}
// Iterative form
function fib(num) {
var n1 = 1,
n2 = 1,
n = 1;
for(var i = 3; i <= num; i++) {
n = n1 + n2
n1 = n2
n2 = n
}
return n
