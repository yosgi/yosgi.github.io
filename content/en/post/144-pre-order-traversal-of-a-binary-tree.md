---
title: 144-Pre-order traversal of a binary tree
date: 2021-02-25 00:00:00
description: Iterative pre-order binary tree traversal using an explicit stack.
draft: false
categories:
  - Algorithms
tags:
  - Algorithms
  - LeetCode
  - Binary Tree
---

10min

The order of pre-order traversal of a binary tree is center-left-right

First traverse all root nodes and left nodes, then process the right node

It can be seen that this is a recursive behavior. Recursive problems can be simplified using stacks.

Iterative solution

```javascript
var preorderTraversal = function(root) {
    if (!root) return null    var stack = [root]
    var res = []
    while(stack.length) {
        var node = stack.pop()
        res.push(node.val)
        node.right && stack.push(node.right)
        node.left && stack.push(node.left)
    }
    return res
};
```

Recursive solution

Recursive problems can of course be solved recursively

```javascript
var preorderTraversal = function(root) {
    var res = []
    if (!root) return res
    var travel = function (node) {
        res.push(node.val)
        node.left && travel(node.left)
        node.right && travel(node.right)
    }
    travel(root)
    return res
};
```
10min

The order of pre-order traversal of a binary tree is center-left-right

First traverse all root nodes and left nodes, then process the right node

It can be seen that this is a recursive behavior. Recursive problems can be simplified using stacks.

Iterative solution

```javascript
var preorderTraversal = function(root) {
    if (!root) return null    var stack = [root]
    var res = []
    while(stack.length) {
        var node = stack.pop()
        res.push(node.val)
        node.right && stack.push(node.right)
        node.left && stack.push(node.left)
    }
    return res
};
```

Recursive solution

Recursive problems can of course be solved recursively

```javascript
var preorderTraversal = function(root) {
    var res = []
    if (!root) return res
    var travel = function (node) {
        res.push(node.val)
        node.left && travel(node.left)
        node.right && travel(node.right)
    }
    travel(root)
    return res
};
```
