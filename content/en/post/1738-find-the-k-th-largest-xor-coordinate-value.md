---
title: 1738-Find the K-th largest XOR coordinate value
date: 2021-03-22 00:00:00
description: Finding the k-th largest XOR-coordinate value with a 2D prefix-XOR DP, then selecting the k-th largest.
draft: false
categories:
  - Algorithms
tags:
  - Algorithms
  - LeetCode
---

Time: Refer to the answer

After reading the title, the first thing that comes to mind is that dp cannot escape

But writing the conversion equation requires some skill

Observe that `dp[1][1] = matrix[0][0] ^ matrix[0][1] ^ matrix[1][0] ^ matrix[1][1]`

Then use the property of XOR

**The same value is XORed to 0, and any value XORed with 0 is itself**

Can be written as

`dp[1][1] = matrix[0][0] ^ (matrix[0][1] ^ matrix[0][0]) ^ (matrix[1][0] ^ matrix[0][0]) ^ matrix[1][1]`

Then get

`dp[i][j] = dp[i - 1][j - 1] ^ dp[i][j - 1] ^ dp[i - 1][j] ^ matrix[i][j]`

(This is a technique I didn’t think of. If you can draw a picture, you can figure it out.

After the XOR operation of the region (1, 2) and (2, 1), the overlapping parts are eliminated.

The overlapping part is exactly the area of (1, 1), so we can XOR (1, 1) to compensate

```javascript
const swap = function (arr, i, j) {
  [arr[i], arr[j]] = [arr[j], arr[i]];
};
class MaxHeap {
  constructor() {
    this.count = 0;
    this.data = new Array(this.count + 1);
  }
  shiftUp(k) {
    // Put the new elements up
    while (k > 1) {
      let father = Math.floor(k / 2);
      if (this.data[k] > this.data[father]) {
        swap(this.data, k, father);
        k = father;
      } else {
        break;
      }
    }
  }
  shiftDown(k) {
    while (k * 2 <= this.count) {
      // Indicates that k has children
      let j = k;
      if (
        k * 2 + 1 <= this.count &&
        this.data[k * 2 + 1] > this.data[k] &&
        this.data[k * 2 + 1] > this.data[k * 2]
      ) {
        j = k * 2 + 1;
      } else if (this.data[k * 2] > this.data[k]) {
        j = k * 2;
      } else {
        break;
      }
      swap(this.data, j, k);
      k = j;
    }
  }
  size() {
    return this.count;
  }
  isEmpty() {
    return this.count === 0;
  }
  insert(item) {
    this.data[++this.count] = item;
    this.shiftUp(this.count);
  }
  extractMax() {
    if (this.count <= 0) return;
    let ret = this.data[1];
    swap(this.data, 1, this.count--);
    this.shiftDown(1);
    return ret;
  }
}
var kthLargestValue = function (matrix, k) {
  const heap = new MaxHeap();
  const rows = matrix.length,
    cols = matrix[0].length;
  const dp = Array.from({ length: rows + 1 }, () => Array(cols + 1).fill(0));
  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
      dp[i][j] =
        dp[i - 1][j] ^ dp[i][j - 1] ^ dp[i - 1][j - 1] ^ matrix[i - 1][j - 1];
      heap.insert(dp[i][j]);
    }
  }
  let result;
  for (let i = 0; i < k; i++) result = heap.extractMax();
  return result;
};
```

This version stores every prefix-XOR value in a max-heap. For N = rows × columns, space is O(N) and time is O((N + k) log N). A size-k min-heap can reduce selection space to O(k), separately from storage for the prefix-XOR computation.
