---
draft: false
original: content/zh/post/legacy/Class.md
title: Class
description: '"ES6 Standard Introduction" Knowledge Points Summary'
categories:
- JavaScript
tags:
- JavaScript
- JavaScript
date: 2018-07-24 16:51:56
summary: ''
---

### class

We have reviewed the object creation and inheritance of Es5 before.

[Object Creation](https://www.yosgi.top/2018/07/13/ES5-%E5%88%9B%E5%BB%BA%E5%AF%B9%E8%B1%A1/)

[Inheritance](https://www.yosgi.top/2018/07/17/ES5-%E7%BB%A7%E6%89%BF/)

Next, let's summarize the inheritance of Es6.

#### Brief Description

ES6's class is just a syntactic sugar that makes the writing of prototype objects clearer and more like the syntax of object-oriented programming.

Let’s use the previous example to show the basic usage:

```

javascript
class Animal {
  constructor(name = "动物"){
    this.name = name
    this.foods = []
  }
  eat(){
    console.log(this.foods)
  }
}
// Class is also a constructor
console.log(typeof Animal)//function

// Instance attributes are not shared
var dog = new Animal("哈士奇")
console.log(dog.name)// Husky
dog.foods.push("狗粮")
dog.eat()// ["Dog food"]
var cat = new Animal("橘猫")
cat.foods.push("鱼干")
cat.eat()// ["dried fish"]

// Constructor pointing is fine
console.log(Animal.prototype.isPrototypeOf(dog))//true
console.log(dog.constructor === Animal)//true
// Instance methods common
console.log(cat.eat === dog.eat)//true
```

The above test shows that: there is nothing wrong, and the effect is exactly the same as combinatorial inheritance

#### Add methods to the prototype

```

javascript
class Animal {
  constructor(name = "动物"){
    this.name = name
    this.foods = ["食物"]
  }

}
Object.assign(Animal.prototype,{
  sleep(){
    console.log(this.name+"睡觉")
  }
})

var dog =new Animal("哈士奇")
dog.sleep()// Husky sleeping

Object.assign(Object.getPrototypeOf(dog),{
  eat(){
    console.log(this.foods)
  }
})
dog.eat()// ["food"]
```

You can see that one way is to find the prototype from the constructor and then use Object.assign to add the method. This approach has the advantage over the object literal approach in that the prototype's constructor is not overwritten because the prototype has been shallowly cloned.

The second method is to use `Object.getPrototypeOf(obj)` to find the prototype. `__proto__`

It can be found, but it is not recommended.

ps: Later I tried to use objects to write literals, but it didn't seem to work:

```

javascript
class Animal {
  constructor(name = "动物"){
    this.name = name
    this.foods = ["食物"]
  }
}

Animal.prototype = {
  constructor:Animal,
  sleep:function(){
    console.log(this.name+"睡觉")
  }
}
var dog =new Animal("哈士奇")
dog.sleep()//dog.sleep is not a function
```#### Classes that execute immediately

```

javascript
let dog =new class Animal {
  constructor(name = "动物"){
    this.name = name
    this.foods = ["食物"]
  }
  eat(){
    console.log(this.foods)
  }
}("哈士奇")


dog.eat()// "Husky"
```#### Private properties

Taking advantage of the uniqueness of the Symbol value, the name of the private method is named as a Symbol value.

```

javascript
const home = Symbol('home')
class Animal {
  constructor(name = "动物"){
    this.name = name
    this.foods = ["食物"]
  }
  [home](){
    console.log("home")
  }
}
var dog = new Animal()
dog[home]//home

export {Animal}
```

Obviously, other modules cannot access the dog[home] method because it is a Symbol value. This achieves the effect of private attributes and private methods.

#### Class getters and setters

Like ordinary objects, you can use the get and set keywords inside a class to set storage functions and getter functions for attributes to intercept the access behavior of attributes.

```

javascript
class Animal {
  constructor(name = "动物"){
    this.name = name
    this.foods = ["食物"]
  }
  get color(){
    return "白色"
  }
}


var dog = new Animal()
console.log(dog.color)
var desdescriptor = Object.getOwnPropertyDescriptor(
  Animal.prototype, "color"
);
console.log(desdescriptor)//{get: ƒ, set: undefined, enumerable: false, configurable: true}
```

Another way to write it is

```

javascript
Object.defineProperty(Animal.prototype, "color", { get: function () { return   "白色" } });
```#### Static Methods

All methods defined in a class will be inherited by instances. If you add the static keyword before a method, it means that the method will not be inherited by instances, but will be called directly through the class. This is called a "static method".

```

javascript
class Animal {
  static talk(){
   console.log("hello")
  }
  static eat(){
    console.log("Animal eat")
  }
  eat(){
    console.log("eat")
  }
}

class Dog extends Animal{

}
Dog.eat()//Animal eat
Animal.talk()//hello
Animal.eat()//Animal eat
var dog = new Animal()
dog.eat()//eat
dog.talk()//dog.talk is not a function
```

As can be seen from the example

1. Class static methods can be inherited by subclasses.
2. Instances cannot call static methods.
3. Static methods can have the same name as non-static methods.

#### new.target property

new.target is generally used in constructors to return the constructor that the new command acts on. If the constructor is not called through the new command, new.target will return undefined, so this property can be used to determine how the constructor is called.

### Class inheritance

#### Brief Description

Class inherits through the extends keyword.

```

javascript
class Animal {
  constructor(name="动物") {
    this.name = name;
  }
  eat(){
    console.log(`${this.name}吃食物`)
  }
}

class  Dog extends Animal {
  constructor(name,color){
    super(name);
    this.color  = color;
  }
  sleep(){
    console.log(`${this.name}睡觉`)
  }
}

var dog= new Dog("柯基")
dog.eat()// Corgi eating food
dog.sleep()// Corgi sleeping
```

The essence of ES5 inheritance is to first create the subclass's this and then add the parent class's method to this (Animal.apply(this)). You can see the borrowed constructor in the previous article.

The essence of ES6 inheritance is to first add the properties and methods of the parent class instance object to this (so the super method must be called first), and then use the subclass constructor to modify this

#### super keyword

super can be used as a function or an object, depending on the method used.
When used as a function, it acts like a superclass constructor, as in the example above.

The second case is when super is used as an object. In ordinary methods, it points to the prototype object of the parent class; in static methods, it points to the parent class.
