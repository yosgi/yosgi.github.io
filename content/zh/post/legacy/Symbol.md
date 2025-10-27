---
title: Symbol
date: 2018-04-28
description: 《ES6标准入门》 知识点整理
categories:
  - JavaScript
tags:
  - JavaScript
  - JavaScript
summary: ""
---
### Symbol

#### Symbol概述
Symbol引入的原因是为了解决属性名的冲突。

表示的是独一无二的值，是Js第七种原始数据类型(undefined,null,Bollen,Number,String,Object,Symbol)

也就是说对象的属性名现在可以有两种类型，一种是字符串，一种是Symbol，symbol可以保证不会与其它属性名产生冲突。

    let s = Symbol();
    typeof s
    // "symbol" 不可以使用new命令，因为symbol是一个原始类型的值不是对象
    
    let s1 = Symbol("foo");
    s1 // Symbol(foo)
    s2.toString() // "Symbol(bar)"

Symbol函数可以接受一个字符串作为参数，表示对symbol的描述，主要为了在控制台显示或者转为字符串时比较容易区分。(不加的话都是输出symbol)

symbol函数参数只是描述作用，相同参数的返回值不相等。

    // 没有参数的情况
    let s1 = Symbol();
    let s2 = Symbol();
    
    s1 === s2 // false
    
    // 有参数的情况
    let s1 = Symbol('foo');
    let s2 = Symbol('foo');
    
    s1 === s2 // false

Symbol不能与其它类型的值进行运算

可以显示转化为字符串（如上例1）

可以转化为布尔值，但是不能转化为数值

#### Symbol作为属性名

由于每一个Symbol值都是不相等的，就可以保证作为属性名时不会出现同名属性，对于一个对象由多个模块构成的情况很有用，能防止某一个键被误改写或者覆盖。

    let mySymbol  =  Symbol();
    // 第一种写法
    let a = {};
    a[mySymbol] = 'Hello!';
    // 第二种写法
    let a = {
      [mySymbol]: 'Hello!'
    };
    // 第三种写法
    let a = {};
    Object.defineProperty(a, mySymbol, { value: 'Hello!' });
    a[mySymbol] // "Hello!"
    
Symbol 值作为对象属性名时，不能用点运算符。因为点运算符后面总是字符串，所以不会读取mySymbol作为标识名所指代的那个值。

Symbol 值作为属性名时，该属性还是公开属性，不是私有属性。

#### 属性名的遍历

Object.getOwnPropertySymbols方法，可以获取指定对象的所有 Symbol 属性名。

但是该属性不会出现在for...in、for...of循环中，也不会被Object.keys()、Object.getOwnPropertyNames()、JSON.stringify()返回。

    const obj = {};
    let a = Symbol('a');
    let b = Symbol('b');
    
    obj[a] = 'Hello';
    obj[b] = 'World';
    
    const objectSymbols = Object.getOwnPropertySymbols(obj);
    for (let i in obj) {
        console.log(i); // []
    }
    Object.getOwnPropertyNames(obj)// 无输出
    objectSymbols //[Symbol(a), Symbol(b)]
    Reflect.ownKeys(obj)//[Symbol(a), Symbol(b)]

Reflect.ownKeys()可以返回所有的键名，包括常规键和Symbol。

Symbol可以利用这个特性，对对象定义一些非私有但希望只用于内部的方法

#### Symbol.for()，Symbol.keyFor() 

Symbol.for()接受一个参数，然后搜索有没有以该参数作为名称的Smybol值。如果有就返回这个值，否则就新建一个以该字符串为名称的Symbol

    let s1 = Symbol.for('foo');
    let s2 = Symbol.for('foo');
    
    s1 === s2 // true
    
Symbol.for()会被登记在全局环境中提供搜索。

Symbol.keyFor方法返回一个已登记的 Symbol 类型值的key。

    let s1 = Symbol.for("foo");
    Symbol.keyFor(s1) // "foo"

#### 实例：模块的Singleton模式

使用Symbol可以保证每次执行一个模块返回的都是同一个实例

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

上述代码可以保证window[instance]不会被无意中覆盖。但是可以被改写

如果键名使用Symbol方法生成，那么外部将无法引用这个值，当然也就无法改写。
    





    
