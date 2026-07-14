---
title: 1022 - the sum of the binary numbers from root to leaf
date: 2021-03-17 00:00:00
description: Summing root-to-leaf binary numbers with top-down pre-order traversal.
draft: false
categories:
  - Algorithms
tags:
  - Algorithms
  - LeetCode
  - Binary Tree
---

Time: 10 minutes

The preorder is calculated from top to bottom, there is nothing much to say

Converting binary to decimal is quite difficult, so I just `parseInt(path, 2)`

```javascript
var sumRootToLeaf = function(root) {
    var ans = 0    var dfs = function (root,path) {
        if (!root) return        path += root.val        if (!root.left && !root.right) {
            ans += parseInt(path, 2)
        }
        root.left && dfs(root.left,path)
        root.right && dfs(root.right,path)
    }
    dfs(root,'')
    return ans
};
```
Time: 10 minutes

The preorder is calculated from top to bottom, there is nothing much to say

Converting binary to decimal is quite difficult, so I just `parseInt(path, 2)`

```javascript
var sumRootToLeaf = function(root) {
    var ans = 0    var dfs = function (root,path) {
        if (!root) return        path += root.val        if (!root.left && !root.right) {
            ans += parseInt(path, 2)
        }
        root.left && dfs(root.left,path)
        root.right && dfs(root.right,path)
    }
    dfs(root,'')
    return ans
};
```
