---
title: proxy
description: 《ES6标准入门》 知识点整理
categories:
  - JavaScript
tags:
  - JavaScript
  - JavaScript
date: 2018-05-18 09:59:26
summary: ""
---
### 概述 

Proxy 用于修改某些操作的默认行为，等同于在语言层面做出修改，所以属于一种“元编程”（meta programming），即对编程语言进行编程。

Proxy 可以理解成，在目标对象之前架设一层“拦截”，外界对该对象的访问，都必须先通过这层拦截，因此提供了一种机制，可以对外界的访问进行过滤和改写。Proxy 这个词的原意是代理，用在这里表示由它来“代理”某些操作，可以译为“代理器”。

    var proxy = new Proxy(target, handler);
    
Proxy 对象的所有用法，都是上面这种形式，不同的只是handler参数的写法。其中，new Proxy()表示生成一个Proxy实例，target参数表示所要拦截的目标对象，handler参数也是一个对象，用来定制拦截行为。

举个栗子

    var proxy = new Proxy({}, {
      get: function(target, property) {
        return 35;
      }
    });
    
    proxy.time // 35
    proxy.name // 35
    proxy.title // 35
    
Proxy 实例也可以作为其他对象的原型对象。

    var proxy = new Proxy({}, {
      get: function(target, property) {
        return 35;
      }
    });
    
    let obj = Object.create(proxy);
    obj.time // 35
    
上面代码中，proxy对象是obj对象的原型，obj对象本身并没有time属性，所以根据原型链，会在proxy对象上读取该属性，导致被拦截。

同一个拦截器函数，可以设置拦截多个操作。

    var handler = {
      get: function(target, name) {
        if (name === 'prototype') {
          return Object.prototype;
        }
        return 'Hello, ' + name;
      },
    
      apply: function(target, thisBinding, args) {
        return args[0];
      },
    
      construct: function(target, args) {
        return {value: args[1]};
      }
    };
    
    var fproxy = new Proxy(function(x, y) {
      return x + y;
    }, handler);
    
    fproxy(1, 2) // 1
    new fproxy(1, 2) // {value: 2}
    fproxy.prototype === Object.prototype // true
    fproxy.foo === "Hello, foo" // true


    
### 下面是 Proxy 支持的拦截操作一览

一共 13 种。

get(target, propKey, receiver)：拦截对象属性的读取，比如proxy.foo和proxy['foo']。

set(target, propKey, value, receiver)：拦截对象属性的设置，比如proxy.foo = v或proxy['foo'] = v，返回一个布尔值。

has(target, propKey)：拦截propKey in proxy的操作，返回一个布尔值。
deleteProperty(target, propKey)：拦截delete proxy[propKey]的操作，返回一个布尔值。

ownKeys(target)：拦截Object.getOwnPropertyNames(proxy)、Object.getOwnPropertySymbols(proxy)、Object.keys(proxy)、for...in循环，返回一个数组。该方法返回目标对象所有自身的属性的属性名，而Object.keys()的返回结果仅包括目标对象自身的可遍历属性。

getOwnPropertyDescriptor(target, propKey)：拦截Object.getOwnPropertyDescriptor(proxy, propKey)，返回属性的描述对象。

defineProperty(target, propKey, propDesc)：拦截Object.defineProperty(proxy, propKey, propDesc）、Object.defineProperties(proxy, propDescs)，返回一个布尔值。
preventExtensions(target)：拦截Object.preventExtensions(proxy)，返回一个布尔值。

getPrototypeOf(target)：拦截Object.getPrototypeOf(proxy)，返回一个对象。

isExtensible(target)：拦截Object.isExtensible(proxy)，返回一个布尔值。

setPrototypeOf(target, proto)：拦截Object.setPrototypeOf(proxy, proto)，返回一个布尔值。如果目标对象是函数，那么还有两种额外操作可以拦截
。

apply(target, object, args)：拦截 Proxy 实例作为函数调用的操作，比如proxy(...args)、proxy.call(object, ...args)、proxy.apply(...)。

construct(target, args)：拦截 Proxy 实例作为构造函数调用的操作，比如new proxy(...args)。

[参考阮一峰ES6入门](http://es6.ruanyifeng.com/#docs/proxy/)

### 使用场景
proxy类似于设计模式中的代理模式，常用于以下几个方面

- 拦截和监视外部对对象的访问
- 降低函数或类的复杂度
- 在复杂操作前对操作进行校验或对所需资源进行管理


#### 抽离校验模块

假定Person对象有一个age属性，该属性应该是一个不大于 200 的整数，那么可以使用Proxy保证age的属性值符合要求。

    let validator = {
      set: function(obj, prop, value) {
        if (prop === 'age') {
          if (!Number.isInteger(value)) {
            throw new TypeError('The age is not an integer');
          }
          if (value > 200) {
            throw new RangeError('The age seems invalid');
          }
        }
    
        // 对于满足条件的 age 属性以及其他属性，直接保存
        obj[prop] = value;
      }
    };
    
    let person = new Proxy({}, validator);
    
    person.age = 100;
    
    person.age // 100
    person.age = 'young' // 报错
    person.age = 300 // 报错

如果要直接为对象的所有属性开发一个校验器可能很快就会让代码结构变得臃肿，使用 Proxy 则可以将校验器从核心逻辑分离出来自成一体：

    function createValidator(target, validator) {  
        return new Proxy(target, {
            _validator: validator,
            set(target, key, value, proxy) {
                if (target.hasOwnProperty(key)) {
                    let validator = this._validator[key];
                    if (validator(value)) {
                        return Reflect.set(target, key, value, proxy);
                    } else {
                        throw Error(`Cannot set ${key} to ${value}. Invalid.`);
                    }
                } else {
                    throw Error(`${key} is not a valid property`)
                }
            }
        })
    }

    const personValidators = {  
        name(val) {
            return typeof val === 'string';
        },
        age(val) {
            return typeof age === 'number' && age > 18;
        }
    }
    class Person {  
        constructor(name, age) {
            this.name = name;
            this.age = age;
            return createValidator(this, personValidators);
        }
    }
    
    const bill = new Person('Bill', 25);
    
    // 以下操作都会报错
    bill.name = 0;  //Cannot set name to 0. Invalid.
    bill.age = 'Bill';  //Cannot set age to Bill. Invalid.
    
    
#### 私有属性

有时，我们会在对象上面设置内部属性，属性名的第一个字符使用下划线开头，表示这些属性不应该被外部使用。结合get和set方法，就可以做到防止这些内部属性被外部读写。

     const handler = {
      get (target, key) {
        invariant(key, 'get');
        return target[key];
      },
      set (target, key, value) {
        invariant(key, 'set');
        target[key] = value;
        return true;
      }
    };
    function invariant (key, action) {
      if (key[0] === '_') {
        throw new Error(`Invalid attempt to ${action} private "${key}" property`);
      }
    }
    const target = {};
    const proxy = new Proxy(target, handler);
    proxy._prop
    // Error: Invalid attempt to get private "_prop" property
    proxy._prop = 'c'
    // Error: Invalid attempt to set private "_prop" property
    
第二种方法是使用 has 拦截 in 操作

    var handler = {
      has (target, key) {
        if (key[0] === '_') {
          return false;
        }
        return key in target;
      }
    };
    var target = { _prop: 'foo', prop: 'foo' };
    var proxy = new Proxy(target, handler);
    '_prop' in proxy // false
    
    
值得注意的是，has方法拦截的是HasProperty操作，而不是HasOwnProperty操作，即has方法不判断一个属性是对象自身的属性，还是继承的属性。

另外，虽然for...in循环也用到了in运算符，但是has拦截对for...in循环不生效。

#### 访问日志
对于那些调用频繁, 运行缓慢或占用资源较多的属性或接口，开发者会希望记录他们的使用情况或性能表现，这个时候可以使用proxy充当中间角色，从而实现日志功能

    let api = {  
        _apiKey: '123abc456def',
        getUsers: function() { /* ... */ },
        getUser: function(userId) { /* ... */ },
        setUser: function(userId, config) { /* ... */ }
    };
    
    function logMethodAsync(timestamp, method) {  
        setTimeout(function() {
            console.log(`${timestamp} - Logging ${method} request asynchronously.`);
        }, 0)
    }
    
    api = new Proxy(api, {  
        get: function(target, key, proxy) {
            var value = target[key];
            return function(...arguments) {
                logMethodAsync(new Date(), key);
                return Reflect.apply(value, target, arguments);
            };
        }
    });
    
    api.getUsers();//Fri May 18 2018 09:36:09 GMT+0800 (中国标准时间) - Logging getUsers request asynchronously.
    
### Proxy.revocable() 
Proxy.revocable方法返回一个可取消的 Proxy 实例。

    let target = {};
    let handler = {};
    
    let {proxy, revoke} = Proxy.revocable(target, handler);
    
    proxy.foo = 123;
    proxy.foo // 123
    
    revoke();
    proxy.foo // TypeError: Revoked
    
Proxy.revocable方法返回一个对象，该对象的proxy属性是Proxy实例，revoke属性是一个函数，可以取消Proxy实例。上面代码中，当执行revoke函数之后，再访问Proxy实例，就会抛出一个错误。

Proxy.revocable的一个使用场景是，目标对象不允许直接访问，必须通过代理访问，一旦访问结束，就收回代理权，不允许再次访问。

### this问题

虽然 Proxy 可以代理针对目标对象的访问，但它不是目标对象的透明代理，即不做任何拦截的情况下，也无法保证与目标对象的行为一致。主要原因就是在 Proxy 代理的情况下，目标对象内部的this关键字会指向 Proxy 代理。

    const target = {
      m: function () {
        console.log(this === proxy);
      }
    };
    const handler = {};
    
    const proxy = new Proxy(target, handler);
    
    target.m() // false
    proxy.m()  // true
上面代码中，一旦proxy代理target.m，后者内部的this就是指向proxy，而不是target。
下面是一个例子，由于this指向的变化，导致 Proxy 无法代理目标对象。

    const _name = new WeakMap();
    
    class Person {
      constructor(name) {
        _name.set(this, name);
      }
      get name() {
        return _name.get(this);
      }
    }
    
    const jane = new Person('Jane');
    jane.name // 'Jane'
    
    const proxy = new Proxy(jane, {});
    proxy.name // undefined
上面代码中，目标对象jane的name属性，实际保存在外部WeakMap对象_name上面，通过this键区分。由于通过proxy.name访问时，this指向proxy，导致无法取到值，所以返回undefined。

此外，有些原生对象的内部属性，只有通过正确的this才能拿到，所以 Proxy 也无法代理这些原生对象的属性。

    const target = new Date();
    const handler = {};
    const proxy = new Proxy(target, handler);
    
    proxy.getDate();
    // TypeError: this is not a Date object.
上面代码中，getDate方法只能在Date对象实例上面拿到，如果this不是Date对象实例就会报错。这时，this绑定原始对象，就可以解决这个问题。

    const target = new Date('2015-01-01');
    const handler = {
      get(target, prop) {
        if (prop === 'getDate') {
          return target.getDate.bind(target);
        }
        return Reflect.get(target, prop);
      }
    };
    const proxy = new Proxy(target, handler);
    
