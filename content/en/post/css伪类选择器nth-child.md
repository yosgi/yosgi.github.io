---
draft: true
original: 'content/zh/post/legacy/css伪类选择器nth-child.md'
title: css伪类选择器nth-child
description: 关于nth-child 和 HTML规范
categories:
  - Frontend
tags:
  - Frontend
date: 2019-03-07 17:32:19
summary: ""
---

# ENGLISH TRANSLATION NEEDED

This is an automatically generated English stub. Please translate the content below into English and remove the `draft: true` flag when ready.

<!-- ORIGINAL CHINESE CONTENT STARTS -->
# 关于css伪类选择器:nth-child(n)

这几天面试在一个简单的问题上翻车了。

问题大概是这样，问我哪个部分被标红

![](/images/css-nth-child-selector/1.png)

天真的我回答的是p元素 。

答案当然是没有任何元素被标红，原因是 **nth-child 会先找到所有父元素下第n个子元素，再找其中的p**，

也就是它第一步找到的集合是两个span，其中没有p元素。

如果要标红那个p，须要这么写选择器：

`p:nth-of-type(1)`

这样是 **先选择父元素下的p，再找到其中的第一个p**。

但是

故事到这里并没有完结，我尝试去选择嵌套p标签下的p标签

![](/images/css-nth-child-selector/2.png)

令人震惊的是没有任何元素被选中，

尝试了 `p > p :nth-child(1)`也没有元素被选中`p:nth-of-type(1)`也不能选择到元素。

![](/images/css-nth-child-selector/3.png)



只有这样才能成功选择到p1 。

在这里我已经想到可能是违背了HTML标准之类的东西，但p是块状元素，不知道为什么不能嵌套另外一个p呢？所以去mozilla 查看一下。看到了

> 每一个HTML元素都必须遵循定义了它可以包含哪一类内容的规则。 这些规则被归类为几个常见的元素内容模型（content model）。每个HTML元素都属于0个、1 个或多个内容模型，每个模型都有一些规则使得元素中的内容必须遵循一个HTML规范文档( HTML-conformant document)。

其中关于p元素的定义

![](/images/css-nth-child-selector/4.png)

描述是p元素表示文本的一个段落，重点是允许的内容是 [Phrasing content](https://developer.mozilla.org/en-US/docs/Web/HTML/Content_categories#Phrasing_content)，再看这个Phrasing content。



![](/images/css-nth-child-selector/5.png)

其中不包含p标签，所以我认为是  `nth-child` 选择器 按照 HTML 规范进行了选择上的优化，所以不会在 p 元素下面再去找p元素了,吗？

我们再看一下这个结构

![](/images/css-nth-child-selector/6.png)

在浏览器是怎么渲染的

![](/images/css-nth-child-selector/7.png)

可以看到，外面包裹的p，被浏览器渲染成了两个p元素。可以猜想到，如果CSS写成

```javascript
p {
        color:red
    }
```

span2 也不会被选择中的。
<!-- ORIGINAL CHINESE CONTENT ENDS -->
