---
title: 215. Kth Largest Element in an Array
date: 2021-02-25 00:00:00
description: Finding the k-th largest element with quickselect, an optimized partition-based quicksort.
draft: false
categories:
  - Algorithms
tags:
  - Algorithms
  - LeetCode
  - Array
---

For an array of length `n`, the kth largest value is the value at index `n - k` after sorting in ascending order. Sorting the whole array works, but it takes `O(n log n)` time when we only need one position.

### Solution 1: Quickselect

Partition the array around a pivot. The pivot ends up at its final sorted index, so only the side containing index `n - k` needs another partition. A random pivot gives expected `O(n)` time and `O(1)` extra space; the worst case is `O(n²)`.

```javascript
function findKthLargest(nums, k) {
  const target = nums.length - k;
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const pivotIndex = left + Math.floor(Math.random() * (right - left + 1));
    [nums[pivotIndex], nums[right]] = [nums[right], nums[pivotIndex]];
    const pivot = nums[right];
    let store = left;

    for (let i = left; i < right; i++) {
      if (nums[i] < pivot) {
        [nums[store], nums[i]] = [nums[i], nums[store]];
        store++;
      }
    }
    [nums[store], nums[right]] = [nums[right], nums[store]];

    if (store === target) return nums[store];
    if (store < target) left = store + 1;
    else right = store - 1;
  }
}
```

This rearranges `nums`. If the original order matters, pass a copy instead.

### Solution 2: Max heap

Put all values in a max heap, then remove the maximum `k` times. The last removed value is the answer. Building the heap takes `O(n)` time, and the removals take `O(k log n)` time; the heap uses `O(n)` extra space.

```javascript
function findKthLargestWithHeap(nums, k) {
  const heap = [...nums];

  function siftDown(index, size) {
    while (2 * index + 1 < size) {
      let child = 2 * index + 1;
      if (child + 1 < size && heap[child + 1] > heap[child]) child++;
      if (heap[index] >= heap[child]) break;
      [heap[index], heap[child]] = [heap[child], heap[index]];
      index = child;
    }
  }

  for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i--) {
    siftDown(i, heap.length);
  }

  let result;
  for (let remaining = k; remaining > 0; remaining--) {
    result = heap[0];
    const last = heap.pop();
    if (heap.length > 0) {
      heap[0] = last;
      siftDown(0, heap.length);
    }
  }
  return result;
}
```

Both examples assume `1 <= k <= nums.length`.
