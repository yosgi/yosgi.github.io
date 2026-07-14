---
title: Reverse Linked List 2
date: 2021-07-23 00:00:00
description: Reversing a sublist of a linked list in place using a dummy head and tracking the boundary nodes.
draft: false
categories:
  - Algorithms
tags:
  - Algorithms
  - LeetCode
  - Linked List
---

Considering that the head may also be reversed, a dummy head is needed.

During the traversal process, the tail node after the reversal and the previous node are recorded.

Finally, the node link processing is performed.

```javascript
var reverseBetween = function(head, m, n) {
    let noob = new ListNode(0)
    noob.next = head
    let cur = noob
    let index = 0    let A,B
    while (index < m) {
        A = cur // A records the previous node of the reverse subchain cur = cur.next
        index++
    }
    B = cur // B records the tail node after reversal let pre = cur
    while (index <= n) {
        let next = cur.next        cur.next = pre
        pre = cur
        cur = next
        index++    }
    // After execution, the cur pointer is at the next node of the reverse subchain B.next = cur
    A.next = pre
    return noob.next  };
```
