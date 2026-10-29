---
translationKey: article-875-keke-who-loves-bananas
title: 875-Koko Eating Bananas
date: 2021-04-28 00:00:00
description: Finding the minimum banana-eating speed by searching over the range of possible speeds.
draft: false
categories:
  - Algorithms
tags:
  - Algorithms
  - LeetCode
---

Time: 60 minutes

The quickest way of thinking when getting the question is to enumerate all the speeds at which bananas can be eaten and find the minimum speed at which all bananas can be eaten.

The enumeration speed range is [1... the largest pile of bananas], because the speed will not be less than 1, and there is no need for the speed to be faster than the largest pile of bananas.

```javascript
var minEatingSpeed = function (piles, h) {
  const maxSpeed = piles.reduce((max, pile) => Math.max(max, pile), 0);
  for (let speed = 1; speed <= maxSpeed; speed++) {
    const hours = piles.reduce((sum, pile) => sum + Math.ceil(pile / speed), 0);
    if (hours <= h) return speed;
  }
  return maxSpeed;
};
```

It can be thought that [1…maximum speed] is a monotonic interval, which can be solved by bisection.

```javascript
var minEatingSpeed = function (piles, h) {
  let left = 1;
  let right = piles.reduce((max, pile) => Math.max(max, pile), 0);
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    const hours = piles.reduce((sum, pile) => sum + Math.ceil(pile / mid), 0);
    if (hours <= h) right = mid;
    else left = mid + 1;
  }
  return left;
};
```
