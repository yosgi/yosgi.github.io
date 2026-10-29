---
translationKey: article-145-post-order-traversal-of-a-binary-tree
title: 145-Post-order traversal of a binary tree
date: 2021-02-26 00:00:00
description: Post-order binary tree traversal, both recursively and iteratively with a stack.
draft: false
categories:
  - Algorithms
tags:
  - Algorithms
  - LeetCode
  - Binary Tree
---

1h

The order of in-order traversal is left - right - center

recursion

It's very easy with recursion

```javascript
var postorderTraversal = function (root) {
  var res = [];
  if (!root) return res;
  var travel = function (node) {
    node.left && travel(node.left);
    node.right && travel(node.right);
    res.push(node.val);
  };
  travel(root);
  return res;
};
```Iteration

1. Push the root node onto the stack.
1. Determine whether a node can be popped. If so, record itself as the node that was popped and pop it.
1. If a node cannot be popped, push the right and left nodes onto the stack.
1. Repeat step 2.

```javascript
var postorderTraversal = function (root) {
  var stack = [root];
  var res = [];
  if (!root) {
    return res;
  }
  var pre = root;
  while (stack.length) {
    var node = stack[stack.length - 1];

    if (
      (!node.left && !node.right) ||
      node.left === pre ||
      node.right === pre
    ) {
      node = stack.pop();
      pre = node;
      res.push(node.val);
    } else {
      if (node.right) {
        stack.push(node.right);
      }
      if (node.left) {
        stack.push(node.left);
      }
    }
  }
  return res;
};
```Summarize

Although I have completed the forward, in-order, and post-order traversal of a binary tree, I have a feeling that I will forget it soon, especially the in-order and post-order traversal. I have not found any similarities between the two, so I will make a summary later.
