---
title: Interview Question-04-12-Sum Path
date: 2021-03-16 00:00:00
description: Counting paths with a target sum starting from any node, using an outer recursion over nodes and an inner recursion over paths.
draft: false
categories:
  - Algorithms
tags:
  - Algorithms
  - LeetCode
---

Time: 20 minutes

Because we are looking for "the path starting from each node is sum"

Obviously, backtracking comes to mind. Since it is a binary tree, double recursion is used.

The outer recursion is used to find all nodes, and the inner recursion is used to calculate the path of the nodes.

```javascript
var pathSum = function(root, sum) {
    var res = 0    var dfs = function (root,total,visited) {
        if (!root) return
        if (total + root.val == sum) {
            res++        } else if (total + root.val > sum) {
            return
        }
        dfs(root.left,total + root.val,[...visited,root.val])
        dfs(root.right,total + root.val,[...visited,root.val])
    }
    var dfs_outer = function (root) {
        if (!root )return
        root.left && dfs_outer(root.left)
        dfs(root,0,[])
        root.right && dfs_outer(root.right)
    }
    dfs_outer(root)
    return res
};
```
