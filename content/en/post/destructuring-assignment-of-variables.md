---
title: Destructuring assignment of variables
date: 2018-04-10 11:07:34
description: '"ES6 Standard Introduction" Knowledge Points Summary'
draft: false
categories:
  - JavaScript
tags:
  - Engineering
  - JavaScript
---

#### Variable Destructuring
Definition: Allows you to extract values from objects in an array according to a certain pattern.

##### Array destructuring assignment

```javascript
var [foo, bar] = [1, 2] // foo 1 bar 2
```

Destructuring assignment allows you to specify a default value. If the default value is an expression, the expression is evaluated lazily.

```javascript
var [foo = true] = [] //foo true
var f = () => 1
var [foo = f()] = [null] //foo null
var [foo = f()] = [undefined] //foo 1
```

##### Object Destructuring

The difference between object structure assignment and array is that the variable must have the same name as the attribute

```javascript
var {bar, foo} = {foo: "aaa", bar: "bbb"}
//or
({bar, foo}) = {foo: "aaa", bar: "bbb"}
```

Tips: (...) is a syntax that does not require declaration when using object literal destructuring assignment. However, the preceding statement needs a semicolon to avoid being treated as a function.

Object destructuring allows you to easily assign existing object methods to a variable.

```javascript
let {log, sin, cos} = Math
```

##### Destructuring Function Parameters

```javascript
[[1, 2], [3, 4]].map(([a, b]) => a + b);
```

Destructuring of function parameters can also use default values

```javascript
function move({x = 0, y = 0} = {}) {
  return [x, y]
};
move({x: 3, y: 8}) //[3,8]
```

If you remove the ={}, you will get an error when executing move().

##### Uses of destructuring assignment

Returning multiple values from a function

```javascript
function foo() {
  return [1, 2, 3]
}
var [a, b, c] = foo()
```

Function parameter definition

```javascript
function f({x, y, z}) {}
f({z: 3, x: 1, y: 2})
```

Extract json

```javascript
var json = {
  id: 42,
  status: "ok",
  data: [1, 2, 3, 4,]
}
let {id, status, data} = json
```

Traversing the map deconstruction

```javascript
for (let [key, value] of map) {};
```

Get the key

```javascript
for (let [key] of map) {};
```

Just want to get the value

```javascript
for (let [, value] of map) {};
```

Input module specification method
