---
title: ES5-创建对象
description: ES5知识点回顾
categories:
  - JavaScript
tags:
  - JavaScript
  - JavaScript
  - OOP
date: 2018-07-13 16:51:52
updated: 2019-02-25 16:51:52
summary: ""
---

在总结ES6的Class之前，我觉得有必要把ES5的知识先整理一下。这样才好比较和记忆

#### 工厂模式

工厂模式是用函数封装创建对象的过程。
例子：

```javascript
var Animal = function(name="动物"){
    var animal = new Object();
    animal.name=name
    animal.eat = function(){
        console.log("吃食物")
    }
    return animal
}
var dog = Animal("狗") 
```

虽然解决了创建多个相似对象的问题，但是并不能知道创建出来的对象类型，并且每次创建对象都是新生成的函数，没有复用。

#### 构造函数模式

调用构造函数后发生的事情是:

1. 创建一个新的对象
2. 将构造函数的作用域赋给新的对象（this指向新的对象）
3. 执行构造函数中的代码（为对象添加属性）
4. 返回新的对象

代码表述也就是:

```javascript
var Animal = function(name="动物"){
    this.name = name;
    this.eat = function(){
        console.log("吃食物")
    }

}
function newAnimal() {
    //下面是调用构造函数产生的代码
    var obj = {};
    //没有这一步，dog1 instanceof Animal会是false
    obj.__proto__ = Animal.prototype;
    Animal.call(obj)
    return obj
}    
var dog1=  newAnimal()
console.log(dog1 instanceof Animal)
```

可以看到，把实例的 `__proto__`指向Animal的原型对象，就可以使Animal变成实例的构造函数，这个后面说。

现在把前面的例子用构造函数模式重新写一下

```javascript
var Animal = function(name="动物"){
    this.name = name;
    this.eat = function(){
        console.log("吃食物")
    }
}
var dog = new Animal("狗") 
console.log(dog.constructor==Animal)//true
```

用构造函数生成的实例对象的`constructor`属性指向它的构造函数。

instanceof操作符用来检测对象类型。

```javascript
dog instanceof Animal //true
dog instanceof Object //true(所有对象均继承自Object)
```

既然Animal是一个构造函数，它和普通的函数一样也可以运行。看看不使用 `new` 操作符直接执行会发生什么:

```javascript
var Animal = function(name="动物"){
    this.name = name;
    this.food = "食物1"
    this.eat = function(){
        console.log("吃食物")
    }
}
Animal()
console.log(food)// "食物1"
eat()//吃食物
```

可以看到Animal的属性和方法都被添加到全局对象了，是因为在全局作用域调用函数时，this总是指向Globol

**别忘了，通常情况下，非对象调用的函数内部this总是指向全局**

构造函数比工厂模式稍微有改进，但也没有解决函数没有复用的问题。以下来验证：

```javascript
var Animal = function(name="动物"){
    this.name = name;
    this.food = "食物1"
    this.eat = function(){
        console.log("吃食物")
    }
}
var dog1= new Animal()
var dog2 = new Animal()
console.log(dog1.eat ==dog2.eat)//false    
```

很显然，对于一个吃食物的动作，我不需要两种函数来处理它。
那么…

```javascript
function Animal(){
    /.../
}
function eat(){
    console.log("吃食物")
}
```

但是，，这样全局定义函数容易被篡改，，所以也并不实用。

#### 原型模式

我们创建的每个函数都有`prototype`属性，这个属性指向原型对象，原型对象包含由构造函数创建的实例共享的属性和方法。

这就解决了所有实例共享函数。

把上面的用原型模式改下：

例1：

```javascript
function  Animal(){

}
Animal.prototype = {
  name : "动物",
  food : ["食物1","食物2"],
  eat(){
    console.log(this.foods)
  }
}

var dog = new Animal();
var cat = new Animal() 

console.log(dog.eat == cat.eat)//true
console.log(dog.name == cat.name)//true
console.log(dog.food == cat.food)//true
```

可以看到，dog和cat共享了同一个eat函数。所以原型对象到底是干什么的呢

##### 原型对象

只要有新的函数创建，函数就会自带`prototype`属性，指向原型对象。默认的，原型对象会自动获得一个`constructor`属性（所以实例也能使用这个属性），`constructor`属性指向构造函数。

也就是说

`Animal.prototype.constructor`指向Animal本身

也是在说`dog.__proto__.constructor==Animal` 指向构造函数Animal

那么用前面的例1实验一下

```javascript
console.log(dog.__proto__.constructor==Animal)//false
console.log(Animal.prototype.constructor===Animal)//false
```

发现并不是这样，那是因为`prototype`对象被我重写过了。这个也放后面说。

创建构造函数后其原型对象默认只会取得`constructor`属性，其它方法都是从`Object`继承而来。

当调用构造函数创建的实例后，实例的内部将会包含一个指针，指向构造函数的原型对象`[[prototype]]`，在Js中并没有标准的方式访问，在某些浏览器可以用`__proto__`来进行访问。

实例和原型对象这个关系可以用`isPrototypeOf()`来检定

```javascript
Animal.prototype.isPrototypeOf(dog)//true
```

前面产生的问题只涉及到原型和构造函数之间，并没有影响原型和实例

还有一种更推荐的方法检定

```javascript
Object.getPrototypeOf(dog)===Animal.prototype//true
```

**当代码读取实例对象的某个属性，会搜索具名属性，首先从对象实例本身开始，没有则继续找到其原型对象。**

如果我们在实例中添加了一个与原型同名的属性，将会在实例中创建该属性，屏蔽原型中的属性。
通过使用`hasOwnProperty()`方法，可以确定访问的是原型上的属性还是实例属性。

for in 操作符会遍历无论实例还是原型中的属性

##### 原型继承的问题

回到上面的两个问题

先说第二个，

```
console.log(dog.__proto__.constructor==Animal)//false
console.log(Animal.prototype.constructor===Animal)//false
```

实例原型的constructor不再指向构造函数

```
function  Animal(){

    }
    Animal.prototype = {
      name : "动物",
      food : ["食物1","食物2"],
      eat(){
        console.log(this.foods)
      }
    }

    var dog = new Animal();
```

原因是在创建构造函数之后，构造函数的原型就有了`constructor`属性，但我们在后面用对象字面量的形式重写了这个原型，导致`constructor`属性的丢失（`constructor`并不是从`Object`上面继承而来）

解决的办法是

```javascript
Animal.prototype = {
          constructor : Animal, 
          name : "动物",
          food : ["食物1","食物2"],
          eat(){
            console.log(this.foods)
          }
        }
```

当然，不解决也不会对实例有其它的影响。这个问题算是解决了。

再回到第一个问题

```javascript
function  Animal(){

}
Animal.prototype = {
  name : "动物",
  food : ["食物1","食物2"],
  eat(){
    console.log(this.foods)
  }
}

var dog = new Animal();
var cat = new Animal() 

console.log(dog.eat == cat.eat)//true
console.log(dog.name == cat.name)//true
console.log(dog.food == cat.food)//true
```

`dog.food`和`cat.food`明显共享的是一个原型上的对象，并且是引用类型，那么再实例中修改这个food就会引起其它实例中food的改变

```javascript
dog.food.push("火腿")

console.log(cat.food)//["食物1", "食物2", "火腿"]
```

很显然，如果我们不想让火腿也成为猫的食物，就应该把属性单独拿出来，而不是放在原型链里。

这个需求可以用构造函数解决

#### 组合使用构造函数模式和原型模式

这个既然前面都说的差不多了，就一个例子带过好了

```javascript
function  Animal(name="动物"){
  this.name = name
  this.foods = []
}
Animal.prototype = {
  constructor:Animal,
  eat(){
    console.log(this.foods)
  }
}

var dog = new Animal("哈士奇");
var cat = new Animal("橘猫") 
dog.foods.push("火腿")
cat.foods.push("鱼")

console.log(dog.name)//"哈士奇"
console.log(cat.name)//"橘猫"

dog.eat()//["火腿"]
cat.eat()//["鱼"]

console.log(dog.hasOwnProperty("name"))//true
console.log(dog.constructor.name)//Animal(注意这个跟函数声明方式有关)
console.log(dog instanceof Animal)//true
Object.getPrototypeOf(dog)===Animal.prototype//true
```

**自己总结一下，用构造函数和原型组合模式创建对象，对象的属性相当于从构造函数深拷贝而来，而方法相当于从原型浅拷贝来。**


