---
translationKey: article-summary-of-binary-trees
title: Summary of Binary Trees
date: 2021-02-28 00:00:00
description: "Binary tree traversal: stacks, queues and processing order, with working pre-order DFS and level-order BFS search examples."
draft: false
categories:
  - Algorithms
tags:
  - Algorithms
  - LeetCode
  - Binary Tree
  - Engineering
  - JavaScript
---

## Why DFS Uses a Stack and BFS Uses a Queue

A stack is **last in, first out (LIFO)**. A queue is **first in, first out (FIFO)**. Recursive DFS uses the function call stack; an iterative implementation can keep pending nodes in an explicit stack. BFS uses a queue to process one level before the next.

DFS does not always process nodes “from bottom to top.” Pre-order processes the current node before its subtrees, in-order between the two subtrees, and post-order after both subtrees. Traversal direction and the moment at which a node is processed are separate choices.

## DFS: A Pre-order Search Template

Pop a node, test it, then push its right child before its left child so the left subtree is visited first. Stop when a match is found or the stack is empty. This is a pre-order template; in-order and post-order require different scheduling of the processing step.

```javascript
function findDepthFirst(root, predicate) {
  if (!root) return null;
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    if (predicate(node)) return node;
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return null;
}
```

## BFS: A Level-order Search Template

Take the next node from the front and append its children at the back. A `head` index avoids repeatedly shifting array elements. This simple implementation retains visited queue slots, so the array uses O(n) space in the worst case.

```javascript
function findBreadthFirst(root, predicate) {
  if (!root) return null;
  const queue = [root];
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    if (predicate(node)) return node;
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return null;
}
```

For example, `findDepthFirst(root, node => node.val === 7)` returns the first matching node, or `null` if no match exists. Both searches take O(n) time in the worst case for a tree with n nodes. The explicit DFS stack uses O(h) space, where h is the tree height; the retained BFS queue array uses O(n).

## References

- [NIST: LIFO stack definition](https://xlinux.nist.gov/dads/HTML/stack.html)
- [NIST: FIFO queue definition](https://www.nist.gov/ncnr/nice-help/queue)
