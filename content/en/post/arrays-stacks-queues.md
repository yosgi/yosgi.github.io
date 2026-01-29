---
draft: false
original: content/zh/post/legacy/数组，栈，队列.md
title: Arrays, stacks, queues
description: Javascript Data Structures
categories:
- JavaScript
tags:
- JavaScript
date: 2018-08-22 15:09:45
summary: ''
---

### Array

You are no stranger to arrays, so let's summarize the methods of arrays.

![image](/images/array-stack-queue/img1.png)

The following are some common methods that are easy to remember incorrectly or mix up

#### map

I saw it in a bad interview question

["1", "2", "3"].map(parseInt)

Let's review this problem. First, let's look at the parameters in a typical map.

    var new_array = arr.map(function callback(currentValue[, index[, array]]) {
        // Return element for new_array
    }[, thisArg])

You can see that callback and thisArg need to be passed as parameters, which are the function that generates the new array elements and the this value used when executing the callback function.

The callback accepts three parameters.

currentValue: The current element being processed in the array.

index: The index of the current element being processed in the array.

array: The array on which the map method is called.

Let's look at parseInt again.

parseInt(string, radix)
// string Required. The string to be parsed.
// radix
Optional. Indicates the radix of the number to be parsed. This value is between 2 and 36.

If this parameter is omitted or is 0, the number is parsed in base 10. If it begins with "0x" or "0X", it is parsed in base 16.

If this parameter is less than 2 or greater than 36, parseInt() returns NaN.

Combining these two, and using the formulas

parseInt('1',0) = 1,
parseInt('2',1) = NaN,
parseInt('3',2) = NaN

we can get the result [1,NaN,NaN];

Solice and split

    array.splice(start[, deleteCount[, item1[, item2[, ...]]]])

The splice function adds or removes elements at any position in an array.
The first parameter specifies the index of the element to be removed or inserted, the second parameter specifies the number of elements to be removed (0 for adding elements), and the third and subsequent parameters are the values to be added to the array.

array.slice(start,end)

The slice() method returns a shallow copy of a portion of an array selected from the beginning to the end (excluding the end) into a new array object. The original array is not modified.

### Stack

A stack is a collection that follows the last-in-first-out principle.

Implementing the Stack Class

let Stack = (function () {
const items = new WeakMap()
class Stack {
constructor() {
items.set(this, [])
}
push(element) {
let s = items.get(this)
s.push(element) //Note that the return value is the length of the array
}
pop() {
let s = items.get(this)
let r = s.pop()
return r
}
isEmpty () {
let s = items.get(this);
return s.length==0
}
}
return Stack
})()

Stack Application - Base Conversion

function baseConverter(decNumber,base) {
let remStack = new Stack(),rem,binaryString = "",chars ="0123456789ABCDEF";
while(decNumber>0){
//Push remainder onto the stack
rem = decNumber%base
            //Round the dividend
            decNumber = Math.floor(decNumber/base);
            remStack.push(rem);
        }
        while(!remStack.isEmpty()){
            binaryString+=chars[remStack.pop()]
        }
        return binaryString
    }
    let result = baseConverter(10,2)//1010
    let result1 = baseConverter(105,16)//69
    

### Queue
A queue is a collection that follows a first-in-first-out principle.

Implementing a Queue Class

    let Queue = (function () {
        const items = new WeakMap()
        class Queue {
            constructor() {
                items.set(this, [])
            }
            enqueue(element) {
                let q = items.get(this)
                q.push(element)//Note that the return value is the length of the array
            }
            dequeue() {
                let q = items.get(this)
                let r = q.shift()
                return r
            }
            isEmpty () {
                let q = items.get(this);
                return q.length==0
            }
            size () {
                let q =items.get(this);
                return q.length
            }
        }
        return Queue
    })()

Application of Queue - Pass the Flower

function hotPotato(nameList, num){
let queue = new Queue()
for(let i=0;i<nameList.length;i++){
//All players are queued
queue.enqueue(nameList[i])
}
let eliminated = '';
//When there are more than one player in the queue
while (queue.size()>1){
//Num players are queued to the end of the queue
for(let i=0;i<num;i++){
queue.enqueue(queue.dequeue())
}
eliminated = queue.dequeue()
console.log(eliminated + 'eliminate')
}
return queue.dequeue()
}
let nameList = ['a', 'b', 'c', 'd']
