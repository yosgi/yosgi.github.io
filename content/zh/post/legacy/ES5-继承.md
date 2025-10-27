---
title: ES5-继承
description: ES5知识点回顾
categories:
  - JavaScript
tags:
  - JavaScript
  - OOP
date: 2018-07-17 09:57:34
summary: ""
---

接下来在总结es6的class之前，回顾总结一下ES5实现继承的方法

#### 原型链

如果我们让一个实例的原型等于另一个实例，此实例的原型将包含一个指向另一个原型的指针。
举例子：

```javascript
function Animal(name="动物"){
    this.name = name;
    this.foods =["食物1","食物2"] 
}
Animal.prototype = {
    constructor:Animal,
    eat(){
        console.log(this.foods)
    }
}

function Dog(name="狗子"){
    this.name = name;
}
Dog.prototype = new Animal()

var dog1 = new Dog("哈士奇");
console.log(dog1.name)//哈士奇
```

这里定义了Animal和Dog两个类型，其中Dog通过把prototype赋值给Animal的实例从而继承了Animal，这样Dog的新原型不仅有Dog的属性和方法，也有Animal中的属性和方法，因为prototype被改写，dog1的constructor指向Animal。

使用`isPrototypeOf()` 或者 `instanceof`可以确定实例和构造函数之原型链间的关系

```javascript
console.log(Object.prototype.isPrototypeOf(dog1))//true
console.log(Animal.prototype.isPrototypeOf(dog1))//true
console.log(Dog.prototype.isPrototypeOf(dog1))//true
```

和上篇创建对象遇到的问题一样，包含引用类型之的原型属性会被所有实例共享

```javascript
function Animal(name="动物"){
    this.name = name;

}
Animal.prototype = {
    constructor:Animal,
    foods:["食物1","食物2"],
    eat(){
        console.log(this.foods)
    }
}

function Dog(name="狗子"){
    this.name = name;
}
Dog.prototype = new Animal()
var dog = new Dog("哈士奇");
dog.foods.push("哈士奇的狗粮")

var dog2 = new Dog("柯基");
dog2.eat()
```

很明显，我们不会想让柯基去吃哈士奇的狗粮，导致上述问题的原因是dog dog1实例的原型是同一个Animal的实例，自然是共用属性。

原型链还有第二个问题，就是创建Dog的时候没有办法向Animal传递参数。

#### 构造函数

解决上面的问题可以用借用构造函数的技术

```javascript
function Animal(name="动物"){
    this.name = name;
    this.foods = ["食物1","食物2"];
    this.eat = function(){
        console.log(this.foods)
    }

}

function SubType(){
    Animal.call(this)
}
```

看看就行，跟上一篇创建对象的构造函数方法一样，都是执行构造函数的代码。缺点也类似，没有解决函数重用的问题。最常使用的是组合继承。

#### 组合继承

```javascript
function Animal(name="动物"){
    this.name = name;
    this.foods = [];
}

Animal.prototype.eat = function(){
    console.log(this.foods)
}
function Dog(name){
    //继承属性
    Animal.call(this,name)
    this.color = "白色"
}
//继承方法
Dog.prototype = new Animal()
Dog.prototype.constructor = Dog;
var dog1 = new Dog("柯基")
dog1.foods.push("柯基的狗粮")
dog1.eat()//["柯基的狗粮"]
var dog2 = new Dog("哈士奇")
dog2.foods.push("哈士奇的狗粮")
dog2.eat()//["哈士奇的狗粮"]
console.log(dog2.eat ==dog2.eat)//true
```

实际上组合继承的属性是通过创造出子类的this后将父类的中的属性添加到this上。方法是通过重写子类的prototype后拿到父类实例及其原型的方法。

