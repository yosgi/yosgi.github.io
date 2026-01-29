---
draft: false
original: content/zh/post/legacy/数组的拓展.md
title: Array expansion
date: 2018-04-11
description: '"ES6 Standard Introduction" Knowledge Points Summary'
categories:
- JavaScript
tags:
- JavaScript
- JavaScript
summary: ''
---

#### Array expansion

##### Array.from()

Convert array-like objects and iterables to real arrays

ES5

    var arr1 = [].slice.call(arraylike)
    
    
ES6

let arr2 = Array.from(arraylike)

Note that this is a shallow copy (if the element is an object reference, the object reference is copied to the new array).

Array.from() accepts a second argument, similar to the array's map method.

let names1 = Array.prototype.map.call(spans, s=>s.textContent);
let names2 = Array.from(spans, s=>s.textContent, this);

The spread operator (...) can also convert certain data structures into arrays.

    function foo(){
        var args = [...arguments]
    }
    

##### Array.of()
Used to convert a set of values into an array, it can replace Array() or new Array()

ES5

    function ArrayOf(){
        return [].slice.call(arguments)
    }
    ArrayOf(3,11,8)//[3,11,8]

ES6

Array.of(3,11,8) // [3,11,8]

##### copyWithin()
Copies the member at a specified position within the current array to another position (overwriting the existing member), then returns the current array.

ES5

var i32a = new Int32Array([1, 2, 3, 4, 5]);
i32a.copyWithin(0, 2);
// Int32Array [3, 4, 5, 4, 5]

ES6

let a = [1,2,3,4,5];
a.copyWithin(0,2)
// [3, 4, 5, 4, 5]

[].copyWithin.call({length: 5, 3: 1}, 0, 3); // Array-like object
// {0: 1, 3: 1, length: 5}


##### find() and findIndex()
Used to find the first matching array member, addressing the limitation of IndexOf that cannot detect NaN.

 ES5
 
    [1,2,NAN].indexOf(NaN)
    //-1
   
  ES6
  
    [1,2,NAN].find(Y=>Object.is(NaN,y))
    //2

##### fill()
Fills an array with the given value, erasing existing elements. If a second and third parameter are provided, they specify the starting and ending positions of the fill.

['a','b','c'].fill(7,1,2)
//[a,7,c]

##### entries() keys() values()
Used for traversing an array, both return an iterator object.

    for(let index of ["a","b"].keys()){
    cobsole.log(index)
    }//0 1
    
    for(let [index,ele] of ["a","b"].entries()){
        console.log(index,ele)
    }//0 "a" 1 "b"
