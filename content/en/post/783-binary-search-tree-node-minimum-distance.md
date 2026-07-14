---
title: 783-Binary Search Tree Node Minimum Distance
date: 2021-03-18 00:00:00
description: Finding the minimum distance between BST nodes using the ordered property of in-order traversal.
draft: false
categories:
  - Algorithms
tags:
  - Algorithms
  - LeetCode
  - Binary Tree
  - Binary Search Tree
  - Engineering
  - JavaScript
  - Node.js
---

Time: 10 minutes

Solve by using the property of pre-order traversal of binary tree

```javascript
var minDiffInBST = function(root) {
    var min = Infinity    var pre = null    var dfs = function (root) {
        if (!root) return        if (root.left) {
            dfs(root.left)
        }
        if (pre == null) {
            pre = root.val        } else {
            console.log(pre,root.val)
            var reduce = Math.abs(pre - root.val)
            min = Math.min(min,reduce)
            pre = root.val        }
        if (root.right) {
            dfs(root.right)
        }
    }
    dfs(root)
    return min
};
```
