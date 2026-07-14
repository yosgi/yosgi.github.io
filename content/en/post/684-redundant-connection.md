---
title: 684-Redundant Connection
date: 2021-07-07 00:00:00
description: Detecting the redundant edge that forms a cycle using a union-find template.
draft: false
categories:
  - Algorithms
tags:
  - Algorithms
  - LeetCode
---

Time: 15 minutes

Use the union-find template

```javascript
var findRedundantConnection = function(edges) {
  var n = edges.length  var fa = new Array(n + 1)
  var find = function (x) {
    if (x != fa[x]) {
      fa[x] = find(fa[x])
    }
    return fa[x]
  }
  for(let i = 1 ; i <= n ; i ++) {
    fa[i] = i
  }
  for(let i = 0 ; i < n ; i ++) {
    var [x,y] = edges[i]
    if (find(x) === find(y)) {
      return [x,y]
    } else {
      fa[find(x)] = find(y)
    }
  }
};
```
