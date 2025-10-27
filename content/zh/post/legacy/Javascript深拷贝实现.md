---
title: Javascript深拷贝实现
description: Javascript基础
categories:
  - JavaScript
tags:
  - JavaScript
date: 2018-06-26 17:01:50
summary: ""
---
#### 如何实现深拷贝

##### Object.assign()

只能处理一层的深拷贝

    var oldObj = {a:1};
    var newObj = Object.assign({},oldObj)
    console.log(oldObj===newObj)//false

##### 序列/反序列

无法实现对函数 、RegExp等特殊对象的克隆

会抛弃对象的constructor,所有的构造函数会指向Object

对象有循环引用,会报错

这种方法能正确处理的对象只有 Number, String, Boolean, Array, 扁平对象，即那些能够被 json 直接表示的数据结构

    // 构造函数
    function person(pname) {
      this.name = pname;
    }
    
    const Messi = new person('Messi');
    
    // 函数
    function say() {
      console.log('hi');
    };
    
    const oldObj = {
      a: say,
      b: new Array(1),
      c: new RegExp('ab+c', 'i'),
      d: Messi
    };
    
    const newObj = JSON.parse(JSON.stringify(oldObj));
    
    // 无法复制数函
    console.log(newObj.a, oldObj.a); // undefined [Function: say]
    // 稀疏数组复制错误
    console.log(newObj.b[0], oldObj.b[0]); // null undefined
    // 无法复制正则对象
    console.log(newObj.c, oldObj.c); // {} /ab+c/i
    // 构造函数指向错误
    console.log(newObj.d.constructor, oldObj.d.constructor); // [Function: Object] [Function: person]


#####  递归拷贝


    function isArray(arr) {
      return Object.prototype.toString.call(arr) == '[object Array]'
    };
    
    function _clone(oldObj) {
      console.log(typeof oldObj)
      if (typeof oldObj !== "object") {
          return oldObj;
      }
      var obj = isArray(oldObj) ? [] : {}
      for (var i in oldObj) {
          if (oldObj.hasOwnProperty(i)) {
              if (oldObj[i] == oldObj) {
                  continue
              }
              obj[i] = _clone(oldObj[i])
          }
      }
      return obj
    }
    //还是用上面的测试
    function Person(pname) {
    this.name = name;
    }
    const Messi = new Person('Messi');
    function say() {
        console.log('hi');
    };
    const oldObj = {
        a: say,
        b: new Array(1),
        c: new RegExp('ab+c', 'i'),
        d: Messi
    };
    const newObj = _clone(oldObj)
    // 函数可复制
    console.log(newObj.a, oldObj.a); // [Function: say] [Function: say]
    // 稀疏数组可以复制
    console.log(newObj.b[0], oldObj.b[0]); // undefined undefined
    // 无法复制正则对象
    console.log(newObj.c, oldObj.c); // {} /ab+c/i
    // 构造函数指向错误
    console.log(newObj.d.constructor, oldObj.d.constructor); // [Function: Object] [Function: person]
    //循环引用也不行，上面的continue去掉会内存溢出

同样存在无法复制正则对象，构造函数指向错误等问题。
    
##### 递归拷贝 改进版


       const isType = function (obj, type) {
      //用来区别属性类型的函数
      if (typeof obj !== 'object') return false
      const typeString = Object.prototype.toString.call(obj);
      let flag;
      //flag作为属性判断的标识
      switch (type) {
        case 'Array':
          flag = typeString === '[object Array]';
          break;
        case 'Date':
          flag = typeString === '[object Date]';
          break;
        case 'RegExp':
          flag = typeString === '[object RegExp]';
          break;
        case 'Set':
          flag = typeString === '[object Set]';
          break;
        case 'Map':
          flag = typeString === '[object Map]';
          break;
        case 'Symbol':
          flag = typeString === '[object Symbol]';
          break;
        default:
          flag = false;
      }
      return flag;
    }
    
    function _clone(oldObj) {
      let obj;
      if (isType(oldObj) == false) {
        //基本数据类型,函数,和我没考虑到的类型，一律直接引用（偷懒）
        obj = oldObj
      } else if (isType(oldObj, 'Array')) {
        //处理数组
        obj = [];
      } else if (isType(oldObj, 'RegExp')) {
        //处理正则
        let flags = '';
        if (oldObj.global) flags += "g";//全局
        if (oldObj.ignoreCase) flags += "i";//大小写
        if (oldObj.multiline) flags += "m";//
        return obj = new RegExp(oldObj.source, getRegExp(oldObj));
      } else if (isType(oldObj, 'Date')) {
        //处理时间对象
        return obj = new Date(oldObj.getTime());
      } else if (isType(oldObj, 'Set')) {
        //处理Set
        return obj = new Set([...obj]);
      } else if (isType(oldObj, 'Map')) {
        //处理Map
        return obj = new Map([...obj]);
      } else if (isType(oldObj, 'Symbol')) {
        //处理Symbol
        return obj = Symbol(String(oldObj).slice(7, -1))
      } else {
        // 处理对象原型
        let proto = Object.getPrototypeOf(oldObj);
        obj = Object.create(proto);
      }
      for (var i in oldObj) {
        if (oldObj.hasOwnProperty(i)) {
          if (oldObj[i] == oldObj) {
            obj[i] = oldObj
          } else {
            obj[i] = _clone(oldObj[i])
          }
        }
      }
      return obj
    }
    
    function Person(pname) {
        this.name = pname;
    }
    const Messi = new Person('Messi');
    function say() {
        console.log('hi');
    };
    const oldObj = {
        a: say,
        b: new Array(1),
        c: new RegExp('ab+c', 'i'),
        d: Messi,
        e:new Set([1,2,3]),
        f:new Map([['foo', 1],['bar', 2]]),
        g:Symbol("yosgi")
    };
    const newObj = _.clone(oldObj)
    // 函数
    console.log(newObj.a, oldObj.a); // [Function: say] [Function: say]
    // 稀疏数组
    console.log(newObj.b[0], oldObj.b[0]); // undefined undefined
    // 正则对象
    console.log(newObj.c, oldObj.c); // /ab+c/i /ab+c/i
    // 构造函数
    console.log(newObj.d.constructor, oldObj.d.constructor); // [Function: person] [Function: person]
    //Set
    console.log(newObj.e, oldObj.e)//Set(3) {1, 2, 3} Set(3) {1, 2, 3}
    //Map
    console.log(newObj.f, oldObj.f)//Map(2) {"foo" => 1, "bar" => 2} Map(2) {"foo" => 1, "bar" => 2}
    //Symbol
    console.log(newObj.g, oldObj.g)//Symbol(yosgi) Symbol(yosgi)
    //循环引用
    // var oldObj = {};;
    // oldObj.a = oldObj;
    // const newObj = _.clone(oldObj)
    // console.log(oldObj,newObj)//{a: {…}} {a: {…}}
   
函数,数组,正则对象,构造函数,Set,Map,Symbol,循环引用都考虑在内

然鹅，还有Buffer，Promise，proxy等...
##### lodash

真香

    function person(pname) {
        this.name = pname;
    }
    const Messi = new person('Messi');
    function say() {
        console.log('hi');
    };
    const oldObj = {
        a: say,
        b: new Array(1),
        c: new RegExp('ab+c', 'i'),
        d: Messi
    };
    const newObj = _.clone(oldObj)
    // 函数
    console.log(newObj.a, oldObj.a); // [Function: say] [Function: say]
    // 稀疏数组
    console.log(newObj.b[0], oldObj.b[0]); // undefined undefined
    // 正则对象
    console.log(newObj.c, oldObj.c); // /ab+c/i /ab+c/i
    // 构造函数
    console.log(newObj.d.constructor, oldObj.d.constructor); // [Function: person] [Function: person]
    //循环引用
    var oldObj = {};;
    oldObj.a = oldObj;
    const newObj = _.clone(oldObj)
