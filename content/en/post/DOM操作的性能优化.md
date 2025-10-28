---
draft: false
original: content/zh/post/legacy/DOM操作的性能优化.md
title: Performance optimization of DOM operations
description: High Performance Javascript Knowledge Points
categories:
- JavaScript
- JavaScript
tags:
- JavaScript
date: 2018-09-12 15:09:33
summary: ''
---

#### Why is DOM slow?

Because the DOM and JavaScript are implemented independently in the browser, this separation allows other technologies and languages such as VBScript to share the use of the DOM, but also causes performance consumption.

#### Are HTML collections arrays? What precautions should be taken when manipulating HTML collections?
HTML collection objects are not arrays because they lack methods like push() or slice(). However, they do provide a length property. HTML collections exist in a "hypothetically live" state and automatically update when the underlying document object is updated.

var alldivs = document.getElementsByTagName('div')
for (var i = 0 ; i < alldivs.length; i++) {
document.body.appendChild(document.createElement('div'))
}

The above code is an infinite loop because the loop's exit condition, alldivs.length, increases with each iteration. It's also very slow because the query is performed on each iteration.

Therefore, when operating the HTML collection, you should first copy it to a normal array to reduce the number of accesses. And use local variables when accessing collection elements.

#### What's the difference between querySelectorAll() and getElementsByTagName()? Why is the first method recommended?
The querySelectorAll() method takes a CSS selector as a parameter and returns a NodeList. It doesn't return an HTML collection, so it doesn't reflect the live document structure, avoiding performance and potential logic issues.

#### What are repaint and reflow?

After the browser downloads all the components of the page, including HTML, CSS, JS, and images, it generates two internal component structures: the DOM tree and the render tree. The DOM tree represents the page structure, and the render tree represents how the DOM nodes are displayed.

After the DOM tree and render tree are constructed, the browser will start drawing the page elements. When the DOM changes affect the geometric properties of the elements, the browser needs to recalculate the geometric properties of the elements. Similarly, the geometric properties of other elements will also be affected. The browser will invalidate the affected part of the original render tree and rebuild the render tree. This process is called reflow. After the reflow is completed, the affected part is redrawn to the screen, which is called repaint.

They can make your web application's UI unresponsive, so try to minimize these processes.

#### What operations will force a refresh of the render tree queue?

offsetTop,offsetLeft... (get offset)

scrollTop, scrollLeft... (get the scroll position)

clientTop,clientWidth...

getComputedStyle (computed style value)

#### When does reflow occur? How can we reduce the impact of redrawing and reflowing?

When the layout and geometric properties of the page change, such as deleting or adding DOM elements; the position of elements changes; the size of elements changes; the page renderer is initialized; the browser window changes.

To reduce the impact of redrawing and reflowing, you can combine multiple DOM style changes and process them all at once, or modify the class directly.

When a series of operations need to be performed on a DOM element, you can remove the element from the document flow, make multiple changes to the element, and then bring the element back into the document flow. This process will only trigger two reflows. Otherwise, any operation on the element will trigger a reflow.

A common approach is to use a document fragment to build a subtree outside the current DOM and then copy it back into the document.

#### About event delegation

In the previous [DOM event flow](https://www.yosgi.top/2018/08/29/DOM%E4%BA%8B%E4%BB%B6%E6%B5%81/)

#### Summarize

There are several ways to improve the performance of DOM operations:

Minimize DOM access times

If you need to access a DOM node multiple times, you should use local variables to store references.

When processing HTML collections, it is recommended to cache the length in a variable. If frequent operations are required, it is recommended to copy it into an array.

Use faster APIs such as querySelectorAll() and firstElementChild whenever possible

Pay attention to redrawing and rearranging, and do not query layout information when modifying it

Using absolute positioning and dragging and dropping proxies in animations
