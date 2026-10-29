---
translationKey: article-894-all-possible-full-binary-trees
title: 894-All possible full binary trees
date: 2021-03-07 00:00:00
description: Generating all possible full binary trees with recursion that combines left and right subtree counts (DP).
draft: false
categories:
  - Algorithms
tags:
  - Algorithms
  - LeetCode
  - Binary Tree
---

Time: I copied the answers and finished it.

It is easy to see that the idea is to use recursion, but the coding is the real problem.

What we need to return is the root node, but the recursion is from bottom to top

Try to solve it using dynamic programming, where dp(n) is the combination of dp(x) and dp (n - x - 1)

```javascript
var allPossibleFBT = function (n) {
  if (n % 2 === 0) return [];
  const dp = Array.from({ length: n + 1 }, () => []);
  dp[1] = [new TreeNode(0)];
  for (let size = 3; size <= n; size += 2) {
    for (let left = 1; left < size; left += 2) {
      const right = size - left - 1;
      for (const leftRoot of dp[left]) {
        for (const rightRoot of dp[right]) {
          const node = new TreeNode(0);
          node.left = leftRoot;
          node.right = rightRoot;
          dp[size].push(node);
        }
      }
    }
  }
  return dp[n];
};
```
