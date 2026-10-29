---
translationKey: article-1893-check-if-all-integers-in-the-region-are-covered
title: 1893-Check if all integers in the region are covered
date: 2021-07-23 00:00:00
description: Checking whether a set of ranges fully covers an interval, from brute force to an interval-compression optimization.
draft: false
categories:
  - Algorithms
tags:
  - Algorithms
  - LeetCode
---

I didn't think of any good way to get it, so I used brute force to solve it first.

```javascript
var isCovered = function (ranges, left, right) {
  for (let i = left; i <= right; i++) {
    let include = false;
    for (let index = 0; index < ranges.length; index++) {
      let [start, end] = ranges[index];
      if (i >= start && i <= end) {
        include = true;
      }
    }
    if (!include) return false;
  }
  return true;
};
```

Thinking about optimization, you can use start, end. When start <= left, the [left ... end] set is already included. Continue compressing [end + 1, right] until there are no elements in the set.

```javascript
var isCovered = function (ranges, left, right) {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  let next = left;
  for (const [start, end] of sorted) {
    if (end < next) continue;
    if (start > next) return false;
    next = end + 1;
    if (next > right) return true;
  }
  return next > right;
};
```
