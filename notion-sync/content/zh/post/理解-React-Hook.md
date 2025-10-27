---
title: 理解   React Hook
description: 
categories:
  - uncategorized
date: 2021-02-25 00:00:00
summary: 
---

# 理解 React Hook

**发布日期：** 2021年02月25日

### 理解 React Hook

用过旧版 react 的应该会知道，react 的 class 组件有state 来管理内部的状态，如下示例代码

```javascript
class Clock extends React.Component {
  constructor(props) {
    super(props);    this.state = {date: new Date()};  }
  render() {
    return (
      <div>        <h1>Hello, world!</h1>        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>      </div>    );  }
}
```

而函数组件没有自己的state，如下示例代码

```javascript
function Clock() {
  return  (
    <div>      <h1>Hello, world!</h1>      <h2>It is {new Date().toLocaleTimeString()}.</h2>    </div>  )
}
```

如果我想使用函数组件，而又想对 date 拥有手动修改的控制权，就不得不使用props对组件做如下修改,这样就把控制权转交给了父组件

```javascript
function Clock(props) {
  return (
    <div>      <h1>Hello, world!</h1>      <h2>It is {props.date.toLocaleTimeString()}.</h2>    </div>  );}
```

**在react 16.8中，Hook的新特性使函数组件能控制自己的 ‘state’**

```javascript
import React, { useState } from 'react';function Example() {
  const [count, setCount] = useState(0);  return (
    <div>      <p>You clicked {count} times</p>      <button onClick={() => setCount(count + 1)}>        Click me
      </button>    </div>  );}
```

香吗 ？ 但是 react 对使用 hook 明确了一些规则，**不要在循环，条件或嵌套函数中调用 Hook**，为什么的问题先放一边，要实现 hook 应该怎么做 ？

1. useState 函数接受一个值作为初始值，并返回一个数组。
1. **函数会存在多次的渲染，我们需要保证每次 render 时取到的 count ， setCount 和上一次相同。**
其中第二点是 hook 的重点，而实现的方法很简单，是数组

在第一次渲染时，把 count ，setCount 分别存入数组中，下次渲染按顺序依次拿出来即可

下面用伪代码实现一个hook

```javascript
// 存放 statelet state = [];// 存放 state 的修改方法let setters = [];let firstRun = true;let cursor = 0;// 创建setterfunction createSetter(cursor) {
  return function setterWithCursor(newVal) {
    state[cursor] = newVal;  };}
export function useState(initVal) {
  if (firstRun) {
    state.push(initVal);    setters.push(createSetter(cursor));    firstRun = false;  }
  const setter = setters[cursor];  const value = state[cursor];    // cursor 保证了hook的顺序  cursor++;  return [value, setter];}
```

这也解答了前面的问题，如果 hook 在条件语句中，有可能造成第一次渲染存数组的 cursor 和之后不一致，导致state的次序乱掉。

### 总结

hook 并不是什么新东西，相当于在函数外层维护了一个数组，在第一次渲染时把hook 依次塞进去，后面render时再按顺序拿出来使用。

### 参考

https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e

