---
draft: false
original: content/zh/post/legacy/ES5-继承.md
title: ES5-Inheritance
description: ES5 knowledge review
categories:
- JavaScript
tags:
- JavaScript
- OOP
date: 2018-07-17 09:57:34
summary: ''
---

Before summarizing the es6 class, let's review the ES5 inheritance method.

#### Prototype Chain

If we make the prototype of an instance equal to another instance, the prototype of this instance will contain a pointer to the other prototype.
For example:```javascript
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
console.log(dog1.name)// Husky
```Two types, Animal and Dog, are defined here. Dog inherits Animal by assigning its prototype to an instance of Animal. This way, the new prototype of Dog has not only the properties and methods of Dog, but also the properties and methods of Animal. Because the prototype is overwritten, the constructor of dog1 points to Animal.

Use `isPrototypeOf()` or `instanceof` to determine the relationship between the instance and the prototype chain of the constructor```javascript
console.log(Object.prototype.isPrototypeOf(dog1))//true
console.log(Animal.prototype.isPrototypeOf(dog1))//true
console.log(Dog.prototype.isPrototypeOf(dog1))//true
```As with the problem encountered in creating objects in the previous article, prototype properties containing reference types will be shared by all instances```javascript
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
```Obviously, we don't want Corgi to eat Husky's dog food. The reason for the above problem is that the prototype of the dog dog1 instance is the same Animal instance, so it naturally shares attributes.

The second problem with the prototype chain is that there is no way to pass parameters to Animal when creating Dog.

#### Constructor

To solve the above problem, we can use the technique of borrowing constructors```javascript
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
```Just take a look at it. It is the same as the constructor method of creating an object in the previous article. It executes the constructor code. The disadvantage is similar. It does not solve the problem of function reuse. The most commonly used method is composition inheritance.

#### Combination inheritance```javascript
function Animal(name="动物"){
    this.name = name;
    this.foods = [];
}

Animal.prototype.eat = function(){
    console.log(this.foods)
}
function Dog(name){
    // Inherited properties
    Animal.call(this,name)
    this.color = "白色"
}
// Inheritance Methods
Dog.prototype = new Animal()
Dog.prototype.constructor = Dog;
var dog1 = new Dog("柯基")
dog1.foods.push("柯基的狗粮")
dog1.eat()// ["Corgi's Dog Food"]
var dog2 = new Dog("哈士奇")
dog2.foods.push("哈士奇的狗粮")
dog2.eat()// ["Husky Dog Food"]
console.log(dog2.eat ==dog2.eat)//true
```In fact, the combined inherited properties are created by creating the subclass's this and then adding the parent class's properties to this. The method is to get the parent class instance and its prototype after overriding the subclass's prototype.
