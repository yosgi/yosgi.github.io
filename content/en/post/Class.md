---
draft: true
original: 'content/zh/post/legacy/Class.md'
title: Class
description: 《ES6标准入门》 知识点整理
categories:
  - JavaScript
tags:
  - JavaScript
  - JavaScript
date: 2018-07-24 16:51:56
summary: ""
---

# ENGLISH TRANSLATION NEEDED

This is an automatically generated English stub. Please translate the content below into English and remove the `draft: true` flag when ready.

<!-- ORIGINAL CHINESE CONTENT STARTS -->
### class

前面复习过了Es5的对象创建与继承，

[对象的创建](https://www.yosgi.top/2018/07/13/ES5-%E5%88%9B%E5%BB%BA%E5%AF%B9%E8%B1%A1/)

[继承](https://www.yosgi.top/2018/07/17/ES5-%E7%BB%A7%E6%89%BF/)

接下来总结Es6的继承。

#### 简述

ES6 的class只是一个语法糖，让原型对象的写法更清晰，更像面对对象编程的语法。

还是用以前的例子展示基础用法:

```javascript
class Animal {
  constructor(name = "动物"){
    this.name = name
    this.foods = []
  }
  eat(){
    console.log(this.foods)
  }
}
//Class也是构造函数
console.log(typeof Animal)//function

//实例的属性不共用
var dog = new Animal("哈士奇")
console.log(dog.name)//哈士奇
dog.foods.push("狗粮")
dog.eat()//["狗粮"]
var cat = new Animal("橘猫")
cat.foods.push("鱼干")
cat.eat()//["鱼干"]

//constructor指向没问题
console.log(Animal.prototype.isPrototypeOf(dog))//true
console.log(dog.constructor === Animal)//true
//实例的方法共同
console.log(cat.eat === dog.eat)//true
```

上面的测试可以表明：没毛病，和组合式继承的效果一毛一样

#### 为原型添加方法

```javascript
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
dog.sleep()//哈士奇睡觉

Object.assign(Object.getPrototypeOf(dog),{
  eat(){
    console.log(this.foods)
  }
})
dog.eat()//["食物"]
```

可以看到一种方法是从构造函数找到`prototype`再使用`Object.assign`完成方法的添加，这种写法比对象字面量的写法好处在于原型的`constructor`没有被重写。因为原型已经被浅克隆。

第二种方法是使用`Object.getPrototypeOf(obj)`找到原型。`__proto__`

也可以找到，但这个是不被推荐的。

ps:后来试了一下用对象对字面量的写法好像不管用：

```javascript
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
```

#### 立即执行的类

```javascript
let dog =new class Animal {
  constructor(name = "动物"){
    this.name = name
    this.foods = ["食物"]
  }
  eat(){
    console.log(this.foods)
  }
}("哈士奇")


dog.eat()//"哈士奇"
```

#### 私有属性

利用Symbol值的唯一性，将私有方法的名字命名为一个Symbol值。

```javascript
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

显然，其它模块拿不到dog[home]方法，因为是Symbol值。因此达到私有属性和私有方法的效果。

#### Class 的取值函数（getter）和存值函数（setter）

和普通对象一样，class的内部可以使用get和set关键字，对属性设置存值函数和取值函数拦截属性的存取行为。

```javascript
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

还有一种写法是

```javascript
Object.defineProperty(Animal.prototype, "color", { get: function () { return   "白色" } });
```

#### 静态方法

所有在类中定义的方法，都会被实例继承。如果在一个方法前，加上static关键字，就表示该方法不会被实例继承，而是直接通过类来调用，这就称为“静态方法”。

```javascript
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

从例子中可以看出来

1. class的静态方法可以被子class继承
2. 实例不能调用静态方法
3. 静态方法可以和非静态方法重名

#### new.target 属性

new.target一般用在构造函数之中，返回new命令作用于的那个构造函数。如果构造函数不是通过new命令调用的，new.target会返回undefined，因此这个属性可以用来确定构造函数是怎么调用的。

### class继承

#### 简述

class通过extends关键字实现继承。

```javascript
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
dog.eat()//柯基吃食物
dog.sleep()//柯基睡觉
```

ES5的继承，实质是先创造子类的this然后将父类的方法添加到this上面（Animal.apply(this)）可以看上篇的借用构造函数。

ES6的继承，实质是先将父类的实例对象的属性和方法添加到this上面（所以必须先调用super方法），然后再用子类的构造函数修改this

#### super关键字

super可以当函数，也可以当作对象使用。使用方法不同。
当作函数使用时相当于父类的构造函数，就是上面例子中的应用。

第二种情况是super作为对象时，在普通方法中，指向父类的原型对象；在静态方法中，指向父类。
<!-- ORIGINAL CHINESE CONTENT ENDS -->
