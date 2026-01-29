---
draft: false
original: content/zh/post/legacy/时隔很久的更新.md
title: Update after a year
date: 2020-12-11 00:17:30
description: One month after leaving Dahua
categories:
- Life
tags:
- JavaScript
- Frontend
summary: ''
---

Update after a year

I have been lazy and haven't updated since I joined Dahua last year.

2021 is coming soon, and I feel that I need to make a summary of the past. I will write whatever comes to my mind.

#### About the front-end

During the interview, I was always asked how I understood the front end and what plans I had.

It took me four years, but I still haven't figured this out.

When you don’t know anything, think about learning xxx framework and understanding xxx source code, and you will be one step closer to the truth.

So I started looking at vue, react, started using ts, started to learn how to pair webpack, used nodeJs, and started to practice algorithm questions.

Then I gradually liked simplicity. TS was too troublesome to write, so I gave it up. What to pair with webpack? Isn’t umi good? Isn’t imgcook fast for automatically generating code? Isn’t it good to write a script and then use egg and curd without any brains?

Maybe this is the situation of most small front-end developers. There are no project highlights worth mentioning. They go through the cycle of writing business and learning new knowledge. From time to time, they are amazed by the tools developed by big guys. After npm i and npm start, they exclaim that it’s really good.

#### About Components

Participating in the development of the Dahua component library has given me valuable experience. I think the challenge lies not in implementing the business functions, but in making the components maintainable during subsequent modifications and expansions.

Let's take an example of setting multiple time period components by sliding the mouse.

The original requirement was for 3 time periods, but later we added 1 more. Fortunately, the time period logic was extracted, so the implementation didn't take too long.

The original requirement was for the time period 00:00:00 - 24:00:00, but later the requirement for 23:59:59 was added. I had to add a configuration and modify the time scale display.

Originally, there was a button that popped up a window to copy a time period, but later several buttons with different functions were added. This became a problem. The fixed-width component that was originally set for calculation convenience had to be changed to an adaptive one, which affected the calculations in many places.

Later, there were various requirements such as lock, customizable themes, and daily changes to monthly changes.

To sum up, there are several points

Do a good job of decoupling, avoid coupling with data, and reduce dependencies between components. Otherwise, a slight change in requirements will require tinkering with thousands of lines of component code.

Don’t believe the person who initially asks for the component and says, “Just use it on this page.” Consider the situation where the component is a subcomponent, a small screen, or a pop-up window.

Making good use of higher-order components in React helps simplify component code.

Do unit testing well.

#### About Data Structure/Algorithm

A year ago, like most front-end developers, I thought that the algorithm would never be used in the project and there was no point in writing it.

This year, I wanted to go to Microsoft Suzhou, so I started practicing LC questions.

After doing more than a hundred questions on my own, I changed my mind.

First of all, it adds a new way of thinking. For example, if I write a three-layer loop, I will consider whether to optimize the time complexity or whether to prune. If I encounter some difficult-to-use data sent from the backend, I will consider whether there are any data structures such as dictionary trees or graphs to optimize.

During interviews at small companies, it's hard to come up with any highlights worth mentioning. Due to the lack of information, the things I painstakingly created might turn out to be something others have already implemented, and perhaps even better thought out. And no matter how well I memorize the eight-part essay, it's just a matter of not losing points. However, doing the exercises at least gives me a chance to compete with students from larger companies.

If you don't try these things and just listen to others saying that algorithms are not used in the front end, you won't be able to understand them.

#### Future Plans

I will continue to write algorithm questions in a casual manner and will update the article later.

I have been amazed by imgcook recently. In addition to using it at work, I want to learn more about related AI recognition knowledge.
