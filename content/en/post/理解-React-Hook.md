---
draft: false
original: content/zh/post/理解-React-Hook.md
title: Understanding React Hooks
description: null
categories:
- frontend
tags:
- React
- Hook
date: 2021-02-25 00:00:00
summary: null
---

Understanding React Hooks

**Release Date:** February 25, 2021

Understanding React Hooks

Those who have used the old version of react should know that react's class component has state to manage the internal state, as shown in the following example code```javascript
class Clock extends React.Component {
  constructor(props) {
    super(props);    this.state = {date: new Date()};  }
  render() {
    return (
      <div>        <h1>Hello, world!</h1>        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>      </div>    );  }
}
```Function components do not have their own state, as shown in the following example code```javascript
function Clock() {
  return  (
    <div>      <h1>Hello, world!</h1>      <h2>It is {new Date().toLocaleTimeString()}.</h2>    </div>  )
}
```If I want to use a function component and want to have manual control over the date, I have to modify the component using props as follows, which transfers control to the parent component:```javascript
function Clock(props) {
  return (
    <div>      <h1>Hello, world!</h1>      <h2>It is {props.date.toLocaleTimeString()}.</h2>    </div>  );}
```**In React 16.8, new features of Hooks enable function components to control their own ‘state’**```javascript
import React, { useState } from 'react';function Example() {
  const [count, setCount] = useState(0);  return (
    <div>      <p>You clicked {count} times</p>      <button onClick={() => setCount(count + 1)}>        Click me
      </button>    </div>  );}
```Is it good? However, React has some clear rules for using Hooks: **Don’t call Hooks in loops, conditions, or nested functions**. Putting aside the question of why, how should you implement Hooks?

1. The useState function accepts a value as its initial value and returns an array.

1. **This function will be rendered multiple times, so we need to ensure that the count and setCount returned during each render are the same as the previous one. **
The second point is the key to hooks, and its implementation is simple: an array.

When rendering for the first time, store count and setCount in the array respectively, and take them out in order in the next rendering.

The following pseudo code implements a hook```javascript
// Store statelet state = []; // Store state modification methodlet setters = []; let firstRun = true; let cursor = 0; // Create setterfunction createSetter(cursor) {
  return function setterWithCursor(newVal) {
    state[cursor] = newVal;  };}
export function useState(initVal) {
  if (firstRun) {
    state.push(initVal);    setters.push(createSetter(cursor));    firstRun = false;  }
  const setter = setters[cursor];  const value = state[cursor];    // cursor ensures the order of hooks cursor++; return [value, setter];}
```This also answers the previous question. If the hook is in a conditional statement, it may cause the cursor of the array stored in the first rendering to be inconsistent with that after that, causing the state order to be messed up.

### Summarize

Hooks are nothing new. They are like an array maintained outside a function. Hooks are inserted into the function in sequence during the first rendering, and then taken out in sequence during subsequent renderings.

### refer to

https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e
