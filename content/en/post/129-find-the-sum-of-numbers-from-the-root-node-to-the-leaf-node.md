---
title: 129-Find the sum of numbers from the root node to the leaf node
date: 2021-03-16 00:00:00
description: Summing all root-to-leaf numbers with top-down pre-order DFS, carrying the running value down each path.
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

The question is about starting from the root node. The first thing that comes to mind is top-down DFS, passing parameters downward, and the end condition has no left or right children.

Start with the pre-order traversal, and you can assume that all the previous nodes have been processed.

```javascript
var sumNumbers = function(root) {
    var ans = 0    var DFS = function (root,path) {
        if (!root) return        path += root.val        if (!root.left && !root.right) {
            ans += Number(path)
        }
        root.left && DFS(root.left,path)
        DFS(root.right, path)
    }
    DFS(root,'')
    return ans
};
```
The question is about starting from the root node. The first thing that comes to mind is top-down DFS, passing parameters downward, and the end condition has no left or right children.

Start with the pre-order traversal, and you can assume that all the previous nodes have been processed.

```javascript
var sumNumbers = function(root) {
    var ans = 0    var DFS = function (root,path) {
        if (!root) return        path += root.val        if (!root.left && !root.right) {
            ans += Number(path)
        }
        root.left && DFS(root.left,path)
        DFS(root.right, path)
    }
    DFS(root,'')
    return ans
};
```
