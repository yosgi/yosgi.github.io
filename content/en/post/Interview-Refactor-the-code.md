---
draft: true
original: 'content/zh/post/Interview-Refactor-the-code.md'
title: Interview-Refactor-the-code
description: 
categories:
  - leetcode
date: 2021-04-25 00:00:00
summary: 
---

# ENGLISH TRANSLATION NEEDED

This is an automatically generated English stub. Please translate the content below into English and remove the `draft: true` flag when ready.

<!-- ORIGINAL CHINESE CONTENT STARTS -->
# 关于代码重构

**发布日期：** 2021年04月25日

### 关于 代码重构

经过几次的代码重构经验，我总结下来，代码重构的难点并不在于技术部分，而在与对项目时间的把握 和 项目质量的管控。

### 评估阶段

拿到需要重构的项目后，先对项目中各个页面进行评估，进行优先级划分，筛选。

对于低频使用的展示页面，可以选择不要进行重构。

对于高频使用且存在数据存取的页面，优先级较高，因为如果存入的数据和以前不匹配，可能会存进错误的数据。 这类页面需要还原之前的需求，并且理解测试用例。

### 测试阶段

重构结束后，自测和交叉测试同样重要，避免引进太多的低级错误。同时因为现在的测试可能对之前的测试用例的理解和开发存在一些误差，需要和测试进行沟通，同步对于之前需求的理解。

### 发布阶段

新旧页面的路由设计需要一致，这样才能不影响参数的传递。

灰度发布，并提供给用户返回到旧版本的按钮。当用户回到旧版本，判断用户是否是灰度发布中的命中用户，如果是命中的用户，了解新版本存在的问题，改善扩大用户灰度发布命中率，直到旧版本PV 为 0，删除旧版本的进入路径以及路由。

### Refactor the code

Refactoring code is definitely a dirty and tiring job for me .

There is no method that can greatly improve efficiency.

The code I refectory is not the code I wrote, but also the ancient code.

Using an outdated technology stack .

Only a few words can be seen in the commented code.

My work is to rewrite fifty Jquery pages with React.

I think it in the worst direction rather than promise immediately.

I prioritize the pages needing refactor .

After the priority is divided, I use different stable publishing strategies for pages.

For complex high-frequency pages

This part of the page can also be divided into two types of pages:

Edit page is the most risky page. Once the back-end interface does not do complete data verification, the dirty data will be edited, or the wrong data will be saved.

So I carefully restore the original requirements and follow the test case self-test.

Display page will not affect the runtime and will not generate dirty data.

Low-frequency operation and maintenance pages need selective reconstruction.

After development, not only doing self-test, but also cross-test.

Don’t let the test engineer give you too many low-level bugs.

And the above reconstructed pages must be published in grayscale.

In the gray configuration page, the parameters of the new and old dynamic routing need to be consistent, so that the parameters can be passed down.

Display gray prompts, and provide a quick “return to the old version” button, in order to solve the problem more quickly, you can give the developer’s contact information.

When the user accesses the old route, verify whether the current user is in grayscale according to the grayscale configuration.

If it is in grayscale, it will immediately jump to the new route and display the grayscale prompt.

I did the dots according to the dynamic routing, and divide them into three dimensions that are not in the grayscale

If many users use the function of returning to the old version, then i have to find these users to understand the situation, whether there is a bug or the interaction is uncomfortable,

solve user problems one-to-one, and optimize your page repeatedly. Slowly expand the user gray range until the old route access data PV is 0.

Finally, the old page is actually offline and the old code is deleted. Only at this point can the reconstruction be completed.
<!-- ORIGINAL CHINESE CONTENT ENDS -->
