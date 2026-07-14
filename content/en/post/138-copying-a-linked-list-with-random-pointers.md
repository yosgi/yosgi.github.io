---
title: 138-Copying a linked list with random pointers
date: 2021-07-22 00:00:00
description: Deep-copying a linked list with random pointers using a hash map from old nodes to new.
draft: false
categories:
  - Algorithms
tags:
  - Algorithms
  - LeetCode
  - Linked List
  - Engineering
  - JavaScript
---

The idea behind the question is to use double pointers to point to the old and new nodes, and then add a map to map the old and new nodes.

recursion

```javascript
var listMap = new Map()
var copyRandomList = function(head) {
    if(head === null) return head
    if (listMap.get(head)) {
        return listMap.get(head)
    }
    let newNode = new Node(head.val,null,null)
    listMap.set(head, newNode)
    newNode.next = copyRandomList(head.next)
    newNode.random = copyRandomList(head.random)
    return newNode
};
```Iteration

```javascript
var copyRandomList = function(head) {
    if(head == null) return head
    var listMap = new Map()
    listMap.set(null,null)
    var cur = head
    while (cur!= null) {
        listMap.set(cur,new Node(cur.val,null,null))
        cur = cur.next    }
    cur = head
    while (cur!= null) {
        listMap.get(cur).next = listMap.get(cur.next)
        listMap.get(cur).random = listMap.get(cur.random)
        cur = cur.next    }
    return listMap.get(head)
};
```
The idea behind the question is to use double pointers to point to the old and new nodes, and then add a map to map the old and new nodes.

recursion

```javascript
var listMap = new Map()
var copyRandomList = function(head) {
    if(head === null) return head
    if (listMap.get(head)) {
        return listMap.get(head)
    }
    let newNode = new Node(head.val,null,null)
    listMap.set(head, newNode)
    newNode.next = copyRandomList(head.next)
    newNode.random = copyRandomList(head.random)
    return newNode
};
```Iteration

```javascript
var copyRandomList = function(head) {
    if(head == null) return head
    var listMap = new Map()
    listMap.set(null,null)
    var cur = head
    while (cur!= null) {
        listMap.set(cur,new Node(cur.val,null,null))
        cur = cur.next    }
    cur = head
    while (cur!= null) {
        listMap.get(cur).next = listMap.get(cur.next)
        listMap.get(cur).random = listMap.get(cur.random)
        cur = cur.next    }
    return listMap.get(head)
};
```
