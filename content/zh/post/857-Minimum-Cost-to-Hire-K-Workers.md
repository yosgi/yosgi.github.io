---
title: 857-Minimum-Cost-to-Hire-K-Workers
description: 
categories:
  - leetcode
date: 2021-03-26 00:00:00
summary: 
---

# 857. Minimum Cost to Hire K Workers

**发布日期：** 2021年03月26日

用时：120min

其实也没那么难。只是困难的标签有点吓人。

先找按照效率排名

有题意可以知道，如果我们以效率低的为基准，那么效率高的基本工资都可以满足。

我们需要做的是找到效率比它还低，按照工作量从小到大的K - 1 人

```javascript
var mincostToHireWorkers = function(quality, wage, K) {
    var efficents = []
    var res = Infinity    // 效率低的可以再找到 K- 1  个效率更低的人    for(let i = 0 ; i < quality.length ; i ++) {
        var efficent = quality[i] / wage[i]
        efficents.push({wage:wage[i],efficent,quality:quality[i]})
    }
    efficents.sort(function (a,b) {
        return a.efficent - b.efficent    })
    var len = efficents.length    for(let i = 0 ; i < len  ; i ++) {
        // 拿走效率最低的人        var base = efficents.shift()
        if (efficents.length < K -1 ) break
        var {wage,efficent} = base
        var wageOrder = [...efficents].sort((a,b) => {
            return a.quality - b.quality        })
        var k = 0        // 找到比他质量更低的k-1个人        while( k  < K - 1) {
            wage += wageOrder[k].quality / efficent
            k++        }
        res = Math.min(wage,res)
    }
    return res
};
```

用堆来改写

```javascript
const swap = function (arr,i,j) {
    [arr[i],arr[j]] = [arr[j],arr[i]]
}
class MaxHeap {
    constructor() {
        this.count = 0        this.data = new Array(this.count + 1)
    }
    shiftUp(k) {
        // 把新的元素往上排        while(k>=1) {
            let father = Math.floor(k / 2)
            if (this.data[k] > this.data[father]) {
                swap(this.data,k,father)
                k = father
            } else {
                break            }
        }
    }
    shiftDown(k) {
        while( k * 2  <= this.count) { // 表示k 有孩子            let j = k
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
    var res = Infinity    // 效率低的可以再找到 K- 1  个效率更低的人    for(let i = 0 ; i < quality.length ; i ++) {
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
            // 在剩余的人找1 ... K - 1 个质量最低的            // 使用大顶堆 维护最小的 K - 1 个            if(heap.size() < K - 1) {
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
```

依然超时，我佛了

