---
translationKey: article-475-heater
title: 475-Heater
date: 2021-06-10 00:00:00
description: Finding the minimum heating radius by locating the nearest heater to each house via binary search.
draft: false
categories:
  - Algorithms
tags:
  - Algorithms
  - LeetCode
---

The first thing that comes to mind is to find the distance r of all heaters that are the shortest distance from the house, and then return the largest r

```javascript
var findRadius = function (houses, heaters) {
  var max = 0;
  for (let i = 0; i < houses.length; i++) {
    var house_position = houses[i];
    var r = Infinity;
    for (let j = 0; j < heaters.length; j++) {
      var heat_position = heaters[j];
      var reduce = Math.abs(house_position - heat_position);
      r = Math.min(r, reduce);
    }
    max = Math.max(r, max);
  }
  return max;
};
```

In this case, we can also use the dichotomy method to find the heater

```javascript
var findRadius = function (houses, heaters) {
  const sorted = [...heaters].sort((a, b) => a - b);
  let radius = 0;
  for (const house of houses) {
    let left = 0, right = sorted.length;
    while (left < right) {
      const mid = left + Math.floor((right - left) / 2);
      if (sorted[mid] < house) left = mid + 1;
      else right = mid;
    }
    const before = left > 0 ? house - sorted[left - 1] : Infinity;
    const after = left < sorted.length ? sorted[left] - house : Infinity;
    radius = Math.max(radius, Math.min(before, after));
  }
  return radius;
};
```
