---
title: 865 - Minimum subtree with all deepest nodes
date: 2021-03-21 00:00:00
description: Finding the smallest subtree containing all deepest nodes with a single bottom-up recursion that returns each subtree's depth.
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

Time: 60 minutes

I was misled by the depth of the question and thought that the calculation depth should be done from top to bottom. In fact, it can be done from bottom to top.

If the left and right subtrees have the same height, return the node itself and its depth.

If the left subtree is deeper, it means that the smallest and deepest part is in the left subtree. Return the left subtree and its own depth.

If the right subtree is deeper, it means the minimum depth is on the right, and the right subtree and its own depth are returned.

```javascript
var subtreeWithAllDeepest = function(root) {
    var dfs = function (root) {
        if (!root) return [root,0]
        var [left,ld] = dfs(root.left)
        var [right,rd] = dfs(root.right)
        if (ld > rd) return [left, ld + 1]
        if (rd > ld) return [right,rd + 1]
        return [root,ld + 1]
    }
    var res = dfs(root)
    return res[0]
};
```
