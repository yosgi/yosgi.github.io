---
draft: false
original: content/zh/post/legacy/Symbol.md
title: Symbol
date: 2018-04-28
description: '"ES6 Standard Introduction" Knowledge Points Summary'
categories:
- JavaScript
tags:
- JavaScript
- JavaScript
summary: ''
---

Symbol

#### Symbol Overview
Symbols were introduced to resolve property name conflicts.

Represents a unique value, which is the seventh primitive data type of Js (undefined, null, Bollen, Number, String, Object, Symbol)

That is to say, the attribute name of an object can now have two types, one is a string and the other is a symbol. The symbol can ensure that there will be no conflict with other attribute names.

let s = Symbol();
typeof s
// "symbol" cannot use the new command because symbol is a primitive value, not an object.

let s1 = Symbol("foo");
s1 // Symbol(foo)
s2.toString() // "Symbol(bar)"

The Symbol function can accept a string as a parameter, which represents the description of the symbol, mainly for easier identification when displayed in the console or converted to a string. (If it is not added, the symbol will be output)

The symbol function parameters only describe the function, and the return values of the same parameters are not equal.

// No parameters
let s1 = Symbol();
let s2 = Symbol();

s1 === s2 // false

// With parameters
let s1 = Symbol('foo');
let s2 = Symbol('foo');

s1 === s2 // false

Symbol cannot be operated with values of other types

Can be converted into a string (as in Example 1 above)

Can be converted to a Boolean value, but not to a numeric value

#### Symbol as property name

Since each Symbol value is not equal, it can be guaranteed that there will be no attributes with the same name when used as attribute names. This is very useful for situations where an object consists of multiple modules, and can prevent a key from being accidentally rewritten or overwritten.

let mySymbol = Symbol();
// First way
let a = {};
a[mySymbol] = 'Hello!';
// Second way
let a = {
[mySymbol]: 'Hello!'
};
// Third way
let a = {};
Object.defineProperty(a, mySymbol, { value: 'Hello!' });
a[mySymbol] // "Hello!"

When using a Symbol value as an object property name, the dot operator cannot be used. Because the dot operator is always followed by a string, the value designated by mySymbol as the identifier will not be read.

When a Symbol value is used as a property name, the property is still a public property, not a private property.

#### Traversal of attribute names

The Object.getOwnPropertySymbols method can get all Symbol property names of the specified object.

However, this property will not appear in for...in or for...of loops, nor will it be returned by Object.keys(), Object.getOwnPropertyNames(), or JSON.stringify().

    const obj = {};
    let a = Symbol('a');
    let b = Symbol('b');
    
    obj[a] = 'Hello';
    obj[b] = 'World';
    
    const objectSymbols = Object.getOwnPropertySymbols(obj);
    for (let i in obj) {
        console.log(i); // []
    }
    Object.getOwnPropertyNames(obj)//No output
    objectSymbols //[Symbol(a), Symbol(b)]
    Reflect.ownKeys(obj)//[Symbol(a), Symbol(b)]

Reflect.ownKeys() can return all key names, including regular keys and Symbols.

Symbol can use this feature to define some non-private methods for objects that are only intended to be used internally.

#### Symbol.for(), Symbol.keyFor()

Symbol.for() accepts a parameter and searches for a Smybol value with the parameter as its name. If so, it returns the value, otherwise it creates a new Symbol with the string as its name.

let s1 = Symbol.for('foo');

let s2 = Symbol.for('foo');

s1 === s2 // true

Symbol.for() is registered in the global environment for searching.

The Symbol.keyFor method returns the key of a registered Symbol type value.

    let s1 = Symbol.for("foo");
    Symbol.keyFor(s1) // "foo"

#### Example: Singleton pattern of module

Using Symbol can ensure that each time a module is executed, the same instance is returned.

    //Es5
    var Single = function(name){
    this.name = name;
    this.instance = null;
    }
    Single.getInstance = function(name){
    if(!this.instance){
        this.instace = new Single(name)
        }
    return this.instance
    }
    
    var a = Single.getInstance("a");
    var b = Single.getInstance("b");
    
    a===b//true
    
    //Es6
    const instance = Symbol.for('person');

    function GetInstance(name){
        this.name = "yosgi";
    };
    if(!window[instance]){
        window[instance] = new GetInstance()
    }
    
    var a = window[instance]
    var b = window[instance]
    a===b//true

The above code can ensure that window[instance] will not be accidentally overwritten. However, it can be rewritten

If the key name is generated using the Symbol method, then the value cannot be referenced externally, and of course cannot be overwritten.
