---
draft: false
original: content/zh/post/legacy/迭代器模式.md
title: Iterator pattern
description: Javascript Design Patterns Knowledge Points
categories:
- JavaScript
tags:
- JavaScript
- Design Patterns
date: 2018-04-20 09:41:05
summary: ''
---

### Iterator Pattern
#### Internal and External Iterators
##### Internal Iterator
Implement a custom "each" function. The "each" function accepts two parameters: the first is the array to be iterated over, and the second is the callback function to be triggered by the loop.

var each = function(arr, callback) {
for(var i=0, l=arr.length; i<l; i++) {
callback.call(arr[i], i, arr[i]) // Need to bind this to the item being traversed
}
}
each([1,2,3], function(i, n) {
console.log([i, n])
}) // [0,1] [1,2] [2,3]

Internal iterators are very convenient when called. The outside world does not need to care about the implementation of the iterator. This is also the disadvantage of internal iterators. The internal iteration rules are already limited.

##### External Iterators
External iterators must explicitly request the next element to iterate over.

External iterators increase the complexity of the call, but also increase the flexibility of the iterator. We can manually control the iteration process or order.

    function Iterator(obj) {
        var current = 0
        var next = function() {
            current += 1
        }
        var isDone = function() {
            return !(current < obj.length)
        }
        var getItem = function() {
            return obj[current]
        }
        return {next, isDone, getItem}
    }

Example: Determine whether the values of two arrays are exactly equal

    var iterator1 = Iterator([1, 2, 3, 4,5]),
        iterator2 = Iterator([1, 2, 3, 4]);
    var compare = function (item1, item2) {
        while (!item1.isDone() || !item2.isDone()) {
            console.log(item1.getItem(), item2.getItem())
            if (item1.getItem() !== item2.getItem()) {
                throw new Error("not equal")
            }
            item1.next()
            item2.next()
        }
        console.log("Equal")
    }
    compare(iterator1, iterator2)//Equal
