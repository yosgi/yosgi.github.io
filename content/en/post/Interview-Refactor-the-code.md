---
draft: false
original: 'content/zh/post/Interview-Refactor-the-code.md'
title: Interview-Refactor-the-code
description: 
categories:
  - leetcode
date: 2021-04-25 00:00:00
summary: 
---

# About code refactoring

**Release Date:** April 25, 2021

### About code refactoring

After several code refactoring experiences, I concluded that the difficulty of code refactoring does not lie in the technical part, but in the grasp of project time and control of project quality.

Evaluation Phase

After getting the project that needs to be refactored, first evaluate each page in the project, prioritize it, and screen it.

For display pages that are used infrequently, you can choose not to refactor them.

Pages that are frequently used and have data access have a higher priority because if the stored data does not match the previous data, incorrect data may be stored. Such pages need to restore the previous requirements and understand the test cases.

Testing

After refactoring, self-testing and cross-testing are equally important to avoid introducing too many low-level errors. Also, because current testers may have some discrepancies in their understanding and development of previous test cases, it is necessary to communicate with the testers to synchronize their understanding of previous requirements.

Release Phase

The routing design of the new and old pages needs to be consistent so as not to affect the transmission of parameters.

A grayscale release is performed, and a button is provided for users to return to the old version. When a user returns to the old version, the system determines whether the user is a target user for the grayscale release. If so, the system identifies any issues with the new version and improves the grayscale release hit rate for this user until the old version's page views reach zero. The system then removes the old version's entry path and routing.

### Refactor the code

Refactoring code is definitely a dirty and tiring job for me.

There is no method that can greatly improve efficiency.

The code I refectory is not the code I wrote, but also the ancient code.

Using an outdated technology stack.

Only a few words can be seen in the commented code.

My work is to rewrite fifty Jquery pages with React.

I think it in the worst direction rather than promise immediately.

I prioritize the pages needing refactor.

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
