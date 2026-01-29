---
draft: false
original: content/zh/post/legacy/Javascript深拷贝实现.md
title: Javascript deep copy implementation
description: Javascript Basics
categories:
- JavaScript
tags:
- JavaScript
date: 2018-06-26 17:01:50
summary: ''
---

#### How to implement deep copy

##### Object.assign()

Can only handle one layer of deep copy

    var oldObj = {a:1};
    var newObj = Object.assign({},oldObj)
    console.log(oldObj===newObj)//false

##### Sequence/Desequence

It is not possible to clone special objects such as functions and RegExp.

The object's constructor will be discarded, and all constructors will point to Object

If the object has a circular reference, an error will be reported.

This method can only correctly handle objects such as Number, String, Boolean, Array, and flat objects, that is, data structures that can be directly represented by json.

// Constructor
function person(pname) {
this.name = pname;
}

const Messi = new person('Messi');

// Function
function say() {
console.log('hi');
};

const oldObj = {
a: say,
b: new Array(1),
c: new RegExp('ab+c', 'i'),
d: Messi
};

const newObj = JSON.parse(JSON.stringify(oldObj));

// Unable to copy function
console.log(newObj.a, oldObj.a); // undefined [Function: say]
// Sparse array copy error
console.log(newObj.b[0], oldObj.b[0]); // null undefined
// Unable to copy regular object
console.log(newObj.c, oldObj.c); // {} /ab+c/i
// Constructor pointing to error
console.log(newObj.d.constructor, oldObj.d.constructor); // [Function: Object] [Function: person]

##### Recursive copy

    function isArray(arr) {
      return Object.prototype.toString.call(arr) == '[object Array]'
    };
    
    function _clone(oldObj) {
      console.log(typeof oldObj)
      if (typeof oldObj !== "object") {
          return oldObj;
      }
      var obj = isArray(oldObj) ? [] : {}
      for (var i in oldObj) {
          if (oldObj.hasOwnProperty(i)) {
              if (oldObj[i] == oldObj) {
                  continue
              }
              obj[i] = _clone(oldObj[i])
          }
      }
      return obj
    }
    //Still use the above test
    function Person(pname) {
    this.name = name;
    }
    const Messi = new Person('Messi');
    function say() { console.log('hi');
};
const oldObj = {
a: say,
b: new Array(1),
c: new RegExp('ab+c', 'i'),
d: Messi
};
const newObj = _clone(oldObj)
// Functions can be copied
console.log(newObj.a, oldObj.a); // [Function: say] [Function: say]
// Sparse arrays can be copied
console.log(newObj.b[0], oldObj.b[0]); // undefined undefined
// Regular objects cannot be copied
console.log(newObj.c, oldObj.c); // {} /ab+c/i
// Constructor pointing to error
console.log(newObj.d.constructor, oldObj.d.constructor); // [Function: Object] [Function: person]
// Circular references are not allowed either. Removing the continue above will cause memory overflow.

There are also issues like being unable to copy regular objects and constructor pointer errors.

##### Improved Recursive Copy

       const isType = function (obj, type) {
      //Function used to distinguish attribute types
      if (typeof obj !== 'object') return false
      const typeString = Object.prototype.toString.call(obj);
      let flag;
      //flag is used as the identifier for attribute judgment
      switch (type) {
        case 'Array':
          flag = typeString === '[object Array]';
          break;
        case 'Date':
          flag = typeString === '[object Date]';
          break;
        case 'RegExp':
          flag = typeString === '[object RegExp]';
          break;
        case 'Set':
          flag = typeString === '[object Set]';
          break;
        case 'Map':
          flag = typeString === '[object Map]';
          break;
        case 'Symbol':
          flag = typeString === '[object Symbol]';
          break;
        default:
          flag = false;
      }
      return flag;
}

function _clone(oldObj) {
let obj;
if (isType(oldObj) == false) {
//Basic data types, functions, and types I haven't considered are all directly referenced (lazy)
obj = oldObj
} else if (isType(oldObj, 'Array')) {
//Process arrays
obj = [];
} else if (isType(oldObj, 'RegExp')) {
//Process regular expressions
let flags = '';
if (oldObj.global) flags += "g";//Global
if (oldObj.ignoreCase) flags += "i";//Case
if (oldObj.multiline) flags += "m";//
return obj = new RegExp(oldObj.source, getRegExp(oldObj));
} else if (isType(oldObj, 'Date')) {
//Processing time object
return obj = new Date(oldObj.getTime());
} else if (isType(oldObj, 'Set')) {
//Processing Set
return obj = new Set([...obj]);
} else if (isType(oldObj, 'Map')) {
//Processing Map
return obj = new Map([...obj]);
} else if (isType(oldObj, 'Symbol')) {
//Processing Symbol
return obj = Symbol(String(oldObj).slice(7, -1))
} else {
// Processing object prototype
let proto = Object.getPrototypeOf(oldObj);
obj = Object.create(proto);
}
for (var i in oldObj) {
if (oldObj.hasOwnProperty(i)) {
if (oldObj[i] == oldObj) {
            obj[i] = oldObj
          } else {
            obj[i] = _clone(oldObj[i])
          }
        }
      }
      return obj
    }
    
    function Person(pname) {
        this.name = pname;
    }
    const Messi = new Person('Messi');
    function say() {
        console.log('hi');
    };
    const oldObj = {
        a: say,
        b: new Array(1),
        c: new RegExp('ab+c', 'i'),
        d: Messi,
        e:new Set([1,2,3]),
        f:new Map([['foo', 1],['bar', 2]]),
        g:Symbol("yosgi")
    };
    const newObj = _.clone(oldObj)
    // function console.log(newObj.a, oldObj.a); // [Function: say] [Function: say]
// Sparse array
console.log(newObj.b[0], oldObj.b[0]); // undefined undefined
// Regular object
console.log(newObj.c, oldObj.c); // /ab+c/i /ab+c/i
// Constructor
console.log(newObj.d.constructor, oldObj.d.constructor); // [Function: person] [Function: person]
//Set
console.log(newObj.e, oldObj.e)//Set(3) {1, 2, 3} Set(3) {1, 2, 3}
//Map
console.log(newObj.f, oldObj.f)//Map(2) {"foo" => 1, "bar" => 2} Map(2) {"foo" => 1, "bar" => 2}
//Symbol
console.log(newObj.g, oldObj.g) //Symbol(yosgi) Symbol(yosgi)
//Circular references
// var oldObj = {};;
// oldObj.a = oldObj;
// const newObj = _.clone(oldObj)
// console.log(oldObj,newObj) //{a: {…}} {a: {…}}

Functions, arrays, regular objects, constructors, Sets, Maps, Symbols, and circular references are all considered

However, there are also Buffer, Promise, proxy, etc...
##### lodash

Really delicious

function person(pname) {
this.name = pname;
}
const Messi = new person('Messi');
function say() {
console.log('hi');
};
const oldObj = {
a: say,
b: new Array(1),
c: new RegExp('ab+c', 'i'),
d: Messi
};
const newObj = _.clone(oldObj)
// Function
console.log(newObj.a, oldObj.a); // [Function: say] [Function: say]
// Sparse array
console.log(newObj.b[0], oldObj.b[0]); // undefined undefined
// Regular expression object
console.log(newObj.c, oldObj.c); // /ab+c/i /ab+c/i
// Constructor
    console.log(newObj.d.constructor, oldObj.d.constructor); // [Function: person] [Function: person]
    //Circular reference
    var oldObj = {};;
    oldObj.a = oldObj;
    const newObj = _.clone(oldObj)
