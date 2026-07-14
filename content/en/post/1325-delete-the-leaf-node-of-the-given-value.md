---
title: 1325-Delete the leaf node of the given value
date: 2021-03-17 00:00:00
description: Post-order traversal approach to delete target-valued leaf nodes using a dummy root.
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

Time: 5 minutes

Virtual node + post-order traversal can be done happily in seconds

```javascript
var removeLeafNodes = function(root, target) {
    var dfs = function (root) {
        if (root.left) {
            root.left = dfs(root.left)
        }
        if (root.right) {
            root.right = dfs(root.right)
        }
        if (!root.left && !root.right) {
            if (root.val === target)  {
                root = null            }
        }
        return root    }
    var dummy = new TreeNode(0)
    dummy.left = root    dfs(dummy)
    return dummy.left};
```
Time: 5 minutes

Virtual node + post-order traversal can be done happily in seconds

```javascript
var removeLeafNodes = function(root, target) {
    var dfs = function (root) {
        if (root.left) {
            root.left = dfs(root.left)
        }
        if (root.right) {
            root.right = dfs(root.right)
        }
        if (!root.left && !root.right) {
            if (root.val === target)  {
                root = null            }
        }
        return root    }
    var dummy = new TreeNode(0)
    dummy.left = root    dfs(dummy)
    return dummy.left};
```
