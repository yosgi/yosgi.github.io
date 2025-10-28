---
draft: false
original: content/zh/post/legacy/快速响应的用户界面.md
title: UI interface response optimization
description: High Performance Javascript Knowledge Points
categories:
- JavaScript
- JavaScript
tags:
- JavaScript
date: 2018-11-22 16:55:21
summary: ''
---

#### How to understand that Javascript is single-threaded and browsers are multi-threaded?

The browser kernel is multi-threaded (the browser uses a separate process for each tab page. [Relationship between processes and threads](http://www.imweb.io/topic/58e3bfa845e5c13468f567d5)), and is usually composed of the following resident threads:

GUI rendering thread

JavaScript engine thread

Timer trigger thread

Event trigger thread

Asynchronous http request thread

Javascript is single-threaded, because Js needs to operate the DOM tree. If it is multi-threaded to operate the DOM, UI operation conflicts may occur.


#### How to record code execution time?

You can use native Date objects to track the running time of your code

var start = + Date()
//(+) can convert a Date object into a number


#### How to use timers to decompose tasks and add time detection mechanisms to improve them?

var todo = item.concat()
// Clone the original array
setTimeout(function() {
// Get the next element in the array and process it
process(todo.shift())
// If there are more elements to process, create another timer
if (todo.length > 0) {
setTimeout(arguments.callee, 25)
} else {
callback(items)
}
}, 25)

Sometimes executing just one task is not efficient. For example, if you process an array of 1000 items, each item takes 1 millisecond to process. If each timer processes only one item, and there is a 25 millisecond delay between each processing, the total time to process the array is (25 + 1) x 1000 milliseconds. If you change it to process 50 items at a time, the processing time is (1000 / 50) * 25 + 1000 = 1500 milliseconds, which is faster than a single processing.

function timedProcessArray(items, process, callback) {
var todo = items.concat()
setTimeout(function () {
// Arrow functions cannot be used here because they have no arguments
var start = +new Date()
do {
process(todo.shift())
// Check the time after processing. If the time taken is less than 50 milliseconds, continue processing
} while(todo.length > 0 && (+new Date() - start < 50))
if(todo.length > 0 ) {
setTimeout(arguments.callee, 25)
} else {
callback()
}
},25)
}

#### Does the timer affect performance?

The above code uses a timer sequence. Only one timer exists at a time, and the next one is created only when the timer expires. This usage does not cause performance issues.

Problems arise when multiple repeating timers are created simultaneously, as all the timers compete for the right time to run. Low-frequency repeating timers with intervals of 1 second or more are not a problem, but multiple repeating timers with intervals between 100 and 200 milliseconds can cause problems.
For this reason, you should use a single repeating timer to perform multiple operations at once.

#### Summarize

JavaScript tasks should not take too long to execute (100 milliseconds), otherwise it will cause delays in UI updates and affect the user experience.

Timers can delay the execution of code and break down long-running code into multiple short-running codes.

#### About the Event Loop

The event loop is the main thread reading events from the task queue. This process is continuous and is called the event loop.

When the main thread runs, it creates a heap and a stack. The code in the stack calls various external APIs, which add various events (click, load, done) to the "task queue." Once the code in the stack completes execution, the main thread reads the "task queue" and executes the callback functions corresponding to those events in sequence.

The timer event is placed in the task queue. The meaning of setTimeout(fn,100) is that it adds an event to the end of the task queue after 100 milliseconds. Therefore, the callback function will not be executed until both the synchronous task and the existing events in the task queue are processed. Therefore, there is no way to guarantee that the callback function will be executed at the time specified by setTimeout().
