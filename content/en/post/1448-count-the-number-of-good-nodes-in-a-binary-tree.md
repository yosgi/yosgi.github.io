---
title: 1448-Count the number of good nodes in a binary tree
date: 2021-03-17 00:00:00
description: Notes on counting good nodes in a binary tree using DFS with a running max.
draft: false
categories:
  - Algorithms
tags:
  - Algorithms
  - LeetCode
  - Binary Tree
  - Engineering
  - JavaScript
  - Node.js
---

Time: I secretly looked at the answer

I originally thought that the problem was complicated. I thought about maintaining a maximum heap, passing it from top to bottom and then judging whether it was greater than the maximum value each time.

After reading the answer, I found that I only need to pass a max to determine whether it is greater than max, then get the values of the left and right nodes from bottom to top, and return the left and right nodes plus themselves to see if they match.

```javascript
var goodNodes = function(root,max = root.val) {
    if (!root) return 0    var left = 0    max = Math.max(max,root.val)
    if (root.left) {
        left = goodNodes(root.left,max)
    }
    var right = 0    if (root.right) {
        right = goodNodes(root.right,max)
    }
    console.log(left,right,root.val)
    return (left + right) + (root.val >= max ? 1 : 0)
};
```
Time: I secretly looked at the answer

I originally thought that the problem was complicated. I thought about maintaining a maximum heap, passing it from top to bottom and then judging whether it was greater than the maximum value each time.

After reading the answer, I found that I only need to pass a max to determine whether it is greater than max, then get the values of the left and right nodes from bottom to top, and return the left and right nodes plus themselves to see if they match.

```javascript
var goodNodes = function(root,max = root.val) {
    if (!root) return 0    var left = 0    max = Math.max(max,root.val)
    if (root.left) {
        left = goodNodes(root.left,max)
    }
    var right = 0    if (root.right) {
        right = goodNodes(root.right,max)
    }
    console.log(left,right,root.val)
    return (left + right) + (root.val >= max ? 1 : 0)
};
```
