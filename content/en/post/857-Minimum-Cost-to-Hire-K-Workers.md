---
draft: false
original: 'content/zh/post/857-Minimum-Cost-to-Hire-K-Workers.md'
title: 857-Minimum-Cost-to-Hire-K-Workers
description: 
categories:
  - leetcode
date: 2021-03-26 00:00:00
summary: 
---

# 857. Minimum Cost to Hire K Workers

**Release Date:** March 26, 2021

Time: 120 minutes

It's not that difficult actually. It's just that the difficult label is a bit scary.

First find the efficiency ranking

From the question, we can know that if we take low efficiency as the benchmark, then the basic salary of high efficiency can be met.

What we need to do is to find K - 1 people whose efficiency is lower than that, and whose workload increases from small to large.```javascript
var mincostToHireWorkers = function(quality, wage, K) {
    var efficents = []
    var res = Infinity    // Those with low efficiency can find K-1 people with even lower efficiency for(let i = 0 ; i < quality.length ; i ++) {
        var efficent = quality[i] / wage[i]
        efficents.push({wage:wage[i],efficent,quality:quality[i]})
    }
    efficents.sort(function (a,b) {
        return a.efficent - b.efficent    })
    var len = efficents.length    for(let i = 0 ; i < len  ; i ++) {
        // Take the least efficient one var base = efficents.shift()
        if (efficents.length < K -1 ) break
        var {wage,efficent} = base
        var wageOrder = [...efficents].sort((a,b) => {
            return a.quality - b.quality        })
        var k = 0        // Find k-1 people with lower quality than him while(k < K-1) {
            wage += wageOrder[k].quality / efficent
            k++        }
        res = Math.min(wage,res)
    }
    return res
};
```Rewrite using the heap```javascript
const swap = function (arr,i,j) {
    [arr[i],arr[j]] = [arr[j],arr[i]]
}
class MaxHeap {
    constructor() {
        this.count = 0        this.data = new Array(this.count + 1)
    }
    shiftUp(k) {
        // Put the new elements up while(k>=1) {
            let father = Math.floor(k / 2)
            if (this.data[k] > this.data[father]) {
                swap(this.data,k,father)
                k = father
            } else {
                break            }
        }
    }
    shiftDown(k) {
        while( k * 2  <= this.count) { // Indicates that k has children let j = k
            if (k * 2 + 1 <= this.count && this.data[k * 2 + 1] > this.data[k] && this.data[k * 2 + 1] > this.data[k * 2]) {
                j = k * 2 + 1            } else if (this.data[k * 2] > this.data[k]) {
                j = k * 2            } else {
                break            }
            swap(this.data,j,k)
            k = j
        }
    }
    size() {
        return this.count    }
    isEmpty() {
        return this.count === 0    }
    insert(item) {
        this.data[++this.count] = item
        this.shiftUp(this.count)
    }
    extractMax() {
        if (this.count < 0) return
        let ret = this.data[1]
        swap(this.data,1,this.count--)
        this.shiftDown(1)
        return ret
    }
    top() {
        return this.data[1]
    }
}
var mincostToHireWorkers = function(quality, wage, K) {
    var efficents = []
    var res = Infinity    // Those with low efficiency can find K-1 people with even lower efficiency for(let i = 0 ; i < quality.length ; i ++) {
        var efficent = quality[i] / wage[i]
        efficents.push({wage:wage[i],efficent,quality:quality[i]})
    }
    efficents.sort(function (a,b) {
        return a.efficent - b.efficent    })
    var len = efficents.length    for(let i = 0 ; i < len  ; i ++) {
        var base = efficents[i]
        var {wage,efficent} = base
        var heap = new MaxHeap()
        if(len - i <= K - 1) {
            break        }
        for(j = i + 1 ; j < len ; j ++) {
            // Find 1...K-1 of the lowest quality among the remaining people // Use the max-heap to maintain the smallest K-1 if(heap.size() < K-1) {
                heap.insert(efficents[j].quality)
            }  else {
                if (efficents[j].quality < heap.top() ) {
                    heap.extractMax()
                    heap.insert(efficents[j].quality)
                }
            }
        }
        while(!heap.isEmpty()) {
            wage += heap.extractMax() / efficent
        }
        res = Math.min(wage,res)
    }
    return res
};
```Still timed out, damn it.
