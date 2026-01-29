---
draft: false
original: content/zh/post/legacy/函数的拓展.md
title: Function extension
date: 2018-04-12
description: '"ES6 Standard Introduction" Knowledge Points Summary'
categories:
- JavaScript
tags:
- JavaScript
- JavaScript
summary: ''
---

### Function Extension

#### Default values for function parameters

ES5

    function log(x,y){
        if(typeof y==='undefined'){
            y='world'
        };
        console.log(x,y)
    }
    log("hello")//hello world

ES6

function log(x,y='world') {
console.log(x,y)
}

Usually, parameters with default values should be the last parameters of a function, making it easier to see which parameters were omitted.

#### Function's length property

After specifying a default value, the length property of the function will return the number of parameters without a default value. The meaning of length is the number of parameters passed to the function. Similarly, rest parameters are not counted in the length property.

(function(a){}).length //1
(function(a=5){}).length //0
(function(...args){}).length //0
Application
Using default parameter values, you can specify that a parameter must be present, otherwise an error will be thrown.

    function throwIfMissing(){
        throw new Error('Missing Params')
    }
    
    function foo(mustBeProvided = throwIfMissing()){
        return mustBeProvided;
    }
    
    foo()
    // Uncaught Error: Missing Params
    

#### rest parameters

The rest parameter is used to retrieve excess function parameters, replacing the arguments object.

function add(...values){
let sum = 0;

for(var val of values){
sum += val

}
return sum

}
add(1,2,3) // 6

ES5 arguments

var sortNumbers = function() {
return Array.prototype.slice.call(arguments).sort() // slice can be converted to an array-like object
}
ES6 rest

const sortNumbers = (...numbers) => numbers.sort()
sortNumbers(3,7,4,5) // [3,4,5,7]

#### Extension Operators

The spread operator is three dots (...). It is the inverse operation of the rest parameter, converting an array into a comma-separated sequence of parameters;

console.log(1,...[1,2,3],4)
//1 1 2 3 4

This operator is mainly used for function calls

function push(array,...items){
array.push(items)
}
push([1,2,3],4,5) //1,2,3,4,5
function add(x,y){
return x+y
}
var numbers = [4,38];
add(...numbers); //42
##### Alternative to array apply

    var arr1 = [0,1,2]
    var arr2 = [3,4,5]
    
es5

    Array.prototype.push.apply(arr1,arr2)//[1,2,3,4,5]
es6

    arr1.push(...arr2)//[1,2,3,4,5]
    

##### New way to merge arrays

es5

[1,2].concat(more)

es6

[1,2,...more]

##### Combining with destructuring assignment to create an array
es5

    a = list[0],rest = list.slice(1)

es6

[a,...rest] = list

If the spread operator is used with array assignments, it must be placed last in the argument list; otherwise, an error will be generated.

##### Convert array-like objects

var nodelist = document.querySelectorAll("div");
var array = [...nodelist];
Map and Set deconstruction, Generator function

[...map.keys()]
[...generator()]

#### name attribute
The name attribute of a function returns the function name

    function foo(){}
    foo.name //"foo"
    var func1 = function(){}//"func1"
    (new Function).name //"anonymous"
    

#### Arrow Functions
es5

    var f = function(v){
        return v
    }

es6

var f = v => v

Note:
1. Arrow functions do not have this. The inner this is the this of the outer code block. Because there is no this, they cannot be used as constructors.

2. Arrow functions cannot use arguments objects, you can use rest parameters instead

3. Arrow functions cannot be used as Generator functions

es5

    function foo(){
        this.id = 1;
        setTimeout(function(){
            console.log(this.id)//undefined this points to window
        },1000)
    }
    foo.call({id:1})
    
es6

function foo(){
setTimeout(()=>{
console.log(this.id) // 1 points to the called object
}, 1000)
}
foo.call({id: 1})
Or it can be rewritten as
function foo(){
var _this = this;
setTimeout(function(){
console.log(_this.id)
}, 1000)
}

In addition to this, the following three variables do not exist in arrow functions and refer to the variables of the outer function.

arguments super new.target

You cannot use call(), apply(), or bind() to change the direction of this.

#### Function Binding
The function binding operator (::) combines an object on the left with a function on the right. The operator automatically binds the object on the left as the context (this) to the function on the right.

foo::bar;
// Equivalent to
bar.bind(foo)

foo::bar(...arguments)
// Equivalent to
bar.apply(foo,arguments)

#### Tail Call Optimization Tail Recursion
A tail call is a function that calls another function as its last step.

function f(x) {
return g(x)
}

A tail call doesn't have to appear at the end of a function. It can be as long as it's the last step.

function f(x){
if(x>0){
return m(x)
}
return n(x)
} // Both m and n are tail calls

A function call creates a call frame in memory, which stores information such as the call location and internal variables. If function A calls function B from within function A, a call frame for function B will be created above A's call frame. The call frame disappears only when B completes and returns its result to A.

All call frames form a call stack.

Since a tail call is the last step of a function, there is no need to retain the outer function's call frame, because the call location, memory variables and other information will no longer be used. The outer function's call frame can be directly replaced with the memory call frame.

The call frame of the inner function will replace the call frame of the outer function only when the inner variables of the outer function are no longer used. Otherwise, tail call optimization cannot be performed.

    //Rewriting of recursive function
    function factorial(n){
        if(n===1) return 1;
        return n*factorial(n-1)
    }
    factorial(6) //720
    
    function factorial(n,total=1){
        if(n===1) return total;
        return factorial(n-1,total * n)
    }
    factorial(6) //720
