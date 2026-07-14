---
title: 124-Maximum Path Sum in a Binary Tree
date: 2021-03-15 00:00:00
description: Finding the maximum path sum in a binary tree with recursion that returns each node's best downward contribution.
draft: false
categories:
  - Algorithms
tags:
  - Algorithms
  - LeetCode
  - Binary Tree
---

Time: 30 minutes

Once you understand the question, you can actually do it quickly.

The question is about the value of any node. We can find the value of each node and choose the largest one.

Since the path cannot return, we know that the path of the child node of the root node we start from can only choose left or right, or neither, and the result is x

When finding max, compare x with the case where both sides are selected.

```javascript
var maxPathSum = function(root) {
    var max = -Infinity    var DFS = function (root) {
        if (!root) return 0        var leftSum = DFS(root.left)
        var rightSum = DFS(root.right)
        var res =  Math.max(leftSum + root.val  ,rightSum + root.val ,root.val)
        max = Math.max(max,res,root.val + leftSum + rightSum)
        return res
    }
    DFS(root)
    return max
};
```
Time: 30 minutes

Once you understand the question, you can actually do it quickly.

The question is about the value of any node. We can find the value of each node and choose the largest one.

Since the path cannot return, we know that the path of the child node of the root node we start from can only choose left or right, or neither, and the result is x

When finding max, compare x with the case where both sides are selected.

```javascript
var maxPathSum = function(root) {
    var max = -Infinity    var DFS = function (root) {
        if (!root) return 0        var leftSum = DFS(root.left)
        var rightSum = DFS(root.right)
        var res =  Math.max(leftSum + root.val  ,rightSum + root.val ,root.val)
        max = Math.max(max,res,root.val + leftSum + rightSum)
        return res
    }
    DFS(root)
    return max
};
```
