---
title: 1372-Longest Alternating Path in a Binary Tree
date: 2021-03-01 00:00:00
description: Finding the longest zigzag path in a binary tree with DFS that tracks direction and length, handling the boundary cases.
draft: false
categories:
  - Algorithms
tags:
  - Algorithms
  - LeetCode
  - Binary Tree
---

Time: 25 minutes

In fact, this is a relatively common DFS type question. The reason why it took so long is because there was a problem in judging the boundary value.

When starting from the root, since the root may not have child nodes, the len value is 0

Starting from the child node, since the child nodes have been judged, it is considered that there is an edge of length 1 from the current node to the next node, so it is 1

```javascript
var longestZigZag = function(root) {
    // true left false right    var max = 0    var dfs = function (node,flag,len) {
        max = Math.max(len,max)
        if (flag) {
            node.right && dfs(node.right,!flag,len + 1)
            node.left && dfs(node.left,flag,1)
        } else {
            node.left && dfs(node.left,!flag,len + 1)
            node.right && dfs(node.right,flag,1)
        }
    }
    dfs(root,true,0)
    dfs(root,false,0)
    return max
};
```
Time: 25 minutes

In fact, this is a relatively common DFS type question. The reason why it took so long is because there was a problem in judging the boundary value.

When starting from the root, since the root may not have child nodes, the len value is 0

Starting from the child node, since the child nodes have been judged, it is considered that there is an edge of length 1 from the current node to the next node, so it is 1

```javascript
var longestZigZag = function(root) {
    // true left false right    var max = 0    var dfs = function (node,flag,len) {
        max = Math.max(len,max)
        if (flag) {
            node.right && dfs(node.right,!flag,len + 1)
            node.left && dfs(node.left,flag,1)
        } else {
            node.left && dfs(node.left,!flag,len + 1)
            node.right && dfs(node.right,flag,1)
        }
    }
    dfs(root,true,0)
    dfs(root,false,0)
    return max
};
```
