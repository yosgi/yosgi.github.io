---
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
var allPossibleFBT = function(n) {
    var dp = []
    var buld = function (n) {
        for(let i = 1 ; i <= n ; i ++ ) {
            if (i === 1) {
                dp[i] = new TreeNode(0)
            } else if (i % 2 === 0) {
                dp[i] = undefined            } else {
                dp[i] = []
                for(let left = 1; left < i; left ++) {
                    var leftNodes = dp[left]
                    var rightNodes = dp[i - left - 1]
                    for(let j = 0 ; j < leftNodes.length ; j ++) {
                        for(let k = 0 ; k < rightNodes.length ; k ++) {
                            var node  = new TreeNode(0)
                            node.left = leftNodes[j]
                            node.right = rightNodes[k]
                            dp[i].push(node)
                        }
                    }
                }
            }
        }
    }
    buld(n)
    return dp[n]
};
```
