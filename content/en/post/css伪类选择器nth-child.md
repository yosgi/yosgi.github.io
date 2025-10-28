---
draft: false
original: content/zh/post/legacy/css伪类选择器nth-child.md
title: CSS pseudo-class selector nth-child
description: About nth-child and HTML specifications
categories:
- Frontend
tags:
- Frontend
date: 2019-03-07 17:32:19
summary: ''
---

# About CSS pseudo-class selector: nth-child(n)

I had a bad interview these days because of a simple question.

The question is probably like this, asking me which part is marked in red

![](/images/css-nth-child-selector/1.png)

Naively, I would have answered with the p element.

The answer is of course that no element is marked red, because **nth-child will first find the nth child element under all parent elements, and then find p** among them.

That is, the set it finds in the first step is two spans, which do not contain p elements.

If you want to mark the p in red, you need to write the selector like this:

`p:nth-of-type(1)`

This is **first select the p under the parent element, and then find the first p among them**.

but

The story doesn't end here. I tried to select the p tag under the nested p tag.

![](/images/css-nth-child-selector/2.png)

Shockingly, no elements are selected.

I tried `p > p :nth-child(1)` but no element was selected. `p:nth-of-type(1)` also failed to select the element.

![](/images/css-nth-child-selector/3.png)

Only in this way can p1 be successfully selected.

I already thought that it might be a violation of HTML standards, but p is a block element, so why can't I nest another p? So I went to Mozilla to check it out.

Every HTML element must follow rules that define what kind of content it can contain. These rules are grouped into several common element content models. Each HTML element belongs to zero, one, or more content models, and each model has rules that ensure that the element's content conforms to an HTML-conformant document.

The definition of the p element

![](/images/css-nth-child-selector/4.png)

The description is a p element that represents a paragraph of text. The key point is that the allowed content is [Phrasing content](https://developer.mozilla.org/en-US/docs/Web/HTML/Content_categories#Phrasing_content). Let's take a look at this Phrasing content.

![](/images/css-nth-child-selector/5.png)

There is no p tag in it, so I think the `nth-child` selector is optimized according to the HTML specification, so it will not look for p elements under p elements, right?

Let's look at this structure again

![](/images/css-nth-child-selector/6.png)

How it is rendered in the browser

![](/images/css-nth-child-selector/7.png)

As you can see, the outer wrapped p is rendered into two p elements by the browser. You can guess that if the CSS is written as

```

javascript
p {
        color:red
    }
```

span2 will not be selected either.
