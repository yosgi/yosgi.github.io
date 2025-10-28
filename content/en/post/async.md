---
draft: false
original: content/zh/post/legacy/async.md
title: async
description: '"ES6 Standard Introduction" Knowledge Points Summary'
categories:
- JavaScript
tags:
- JavaScript
- JavaScript
date: 2018-07-11 14:47:05
summary: ''
---

#### Usage
Example 1: Control the order in which asynchronous operations are completed

var fetchData = function(id){
return new Promise((reslove, reject)=>{
setTimeout(function(){
console.log(`Task ${id} executed`)
reslove(`Execution result ${id}`)
},Math.random()*1000)
})
}

async function tasksList(){
// Tasks here execute concurrently
let list = [1,2,3,4,5]
let promises = list.map((task)=>{
return fetchData(task)
})
let results = await Promise.all(promises);
return results
}

tasksList().then((res)=>{
console.log(res)
console.log("All tasks completed")
})
Task 1 executes
Task 2 executes
Task 4 executes
Task 5 executes
Task 3 executes
["Execution result 1", "Execution result 2", "Execution result 3", "Execution result 4", "Execution result 5"]
As you can see, it's very similar to promises. The results are output in the order of the list. The difference is that promises execute the asynchronous request before the function executes.

Example 2: Subsequent completion of asynchronous operations

//fetchData is the same as in Example 1
async function tasksList(){
//Tasks here are executed sequentially
let results = [];
try{
for(let i=0;i<5;i++){
let result = await fetchData(i)
results.push(result)
}
}catch(e){
console.log(e)
}
return results
}

tasksList().then((res)=>{
console.log(res)
console.log("All tasks completed")
})
Task 0 executed
Task 1 executed
Task 2 executed
Task 3 executed
["Execution result 0", "Execution result 1", "Execution result 2", "Execution result 3", "Execution result 4"]
All tasks completed

#### Concept
async is syntactic sugar for the Generator function.

The improvements async offers over Generator are:
##### Built-in Executor

asycn does not require an executor (co module) like Generator

Better semantics

Async means there is asynchronous operation in the function, await means that the expression following it needs to wait for the result.

Wider applicability

After the await command of the async function, you can use Promise objects and primitive values. The primitive value will return an immediately resolved promise object.

##### The return value is a promise

You can use the then method to specify the next step of the operation
