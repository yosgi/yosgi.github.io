---
draft: true
original: 'content/zh/post/legacy/观察者模式和vue监听对象变化.md'
title: 观察者模式和vue监听对象变化
description: 《Javascript设计模式》 知识点整理
categories:
  - JavaScript
tags:
  - JavaScript
  - Design Patterns
date: 2018-05-05 22:38:54
updated: 2019-02-25 11:53:54
summary: ""
---

# ENGLISH TRANSLATION NEEDED

This is an automatically generated English stub. Please translate the content below into English and remove the `draft: true` flag when ready.

<!-- ORIGINAL CHINESE CONTENT STARTS -->
#### 发布订阅模式

发布订阅模式又叫观察者模式，他定义对象间的一种一对多的依赖关系，当一个对象状态发生改变时，所有依赖于他的对象都将得到通知，在Js开发中我们一般用事件模式代替传统的发布订阅模式。

发布订阅模式实现的步骤

1.指定发布者

2.给发布者添加一个缓存列表，用于存放回调函数以便通知订阅者

3.发布消息的时候发布者会遍历整个缓存列表，依次触发里面的回调函数

一个售楼处的例子，售楼处可以在发给订阅者的信息里加上房子的单价，面积等信息，订阅者接受到这个信息进行各自的处理

##### 售楼处的例子

```javascript
var salesOffices = {};
salesOffices.clientList = [];
salesOffices.listen = function(fn){
    // 发布者缓存回调函数
    salesOffices.clientList.push(fn);
}
salesOffices.trigger = function(){
    for(var i=0,fn;fn = this.clientList[i];i++){
        fn.apply(this,arguments)
    }
}

salesOffices.listen(function(price,squareMeter){
    console.log("价格="+price);
    console.log('squareMeter='+squareMeter);
})
salesOffices.trigger(2000000,88)
//价格=2000000
// squareMeter=88
```

下面为订阅的消息做一个key，添加上订阅者id，并把发布-订阅的功能提取出来作为一个对象。

```javascript
var event = {
    clientList:{},
    listen:function(key,id,fn){
        // key 订阅表示 id 订阅者id fnu回调函数
        // 一个订阅标识下面可能存在很多个订阅者以及回调函数
        // 所以将订阅者作为数组，数组中存放回调函数
        if(!this.clientList[key]){
            this.clientList[key]=[];
        }
        this.clientList[key].push({
            id,fn
        })
    },
    trigger:function(...args){//rest参数
        var key = args.shift();
        fns = this.clientList[key];
       	// 回调函数数组为空 什么都不做
        if(!fns||fns.length==0) return;
        // 依次触发回调函数数组中的函数
        for(var i=0,fn;fn = fns[i];i++){
            // fn 是一个有id fn 属性的对象
            fn.fn.apply(this,args)
        }
    },
    remove:function(key,fn){
        var fns = this.clientList[key];
        if(!fns) return false//对应的key没有人订阅
        if(!fn){//没有传入具体的回调则取消key的所有订阅
            fns && (fns.length=0) 
        }else{
            for(var i = fns.length-1;i>=0;i--){
                var _fn = fns[i].fn;
                if(_fn===fn){
                    fns.splice(i,1)//删除回调
                }
            }
        }
    }
};

//定义一个installEvent函数为对象安装发布订阅功能
var installEvent = function(obj){
    for(var i in event){
        // 遍历event对象的key 为 obj 添加上属性和属性方法
        obj[i] = event[i]
    }
}
var salesOffices = {};
installEvent(salesOffices)
salesOffices.listen("square88",1,f1 = function(price){
    console.log(`square88的消息，价格是${price}`)
})
salesOffices.listen("square88",2,f3 = function(price){
    console.log(`square88的消息，价格是${price}`)
})
salesOffices.listen("square100",2,f2 = function(price){
    console.log(`square100的消息，价格是${price}`)
})
salesOffices.trigger('square88',1000000)//square88的消息，价格是1000000  *2
salesOffices.trigger('square100',1500000)//square100的消息，价格是1500000

salesOffices.remove("square88",f1);
salesOffices.trigger('square88',1000000)//square88的消息，价格是1000000
```

##### vue怎么监听对象的变化

`Object.defineProperty`

 能自定义get和set函数，在获取和设置对象属性时可以触发对应回调函数。 利用这个方法，为对象中的每个属性安装发布订阅功能就可以了。

```javascript
// 创建一个Vue 构造函数，使用 prototype 继承方法
function Vue(data){
    // new新的对象后会有data属性 
    this.data = data;
    // watchList 相当于 上面的clientList
    this.watchList = [];
    // 为data对象添加 发布消息的功能
    this.$bindObserver(data)；
    
}
var $watch = function (key,fn){
    //监听的id是谁已经不重要，所以去掉了
    if(!this.clientList[key]){
        this.clientList[key]=[];
    }
    this.clientList[key].push(fn)
}

var $emit = function(...args){
    var key = args.shift();
    fns = this.watchList[key];
    if(!fns||fns.length==0) return;
    for(var i=0,fn;fn = fns[i];i++){
        fn.apply(this,args)
    }
}

var $remove = function(key,fn){
    var fns = this.clientList[key];
    if(!fns) return false
    if(!fn){
        fns && (fns.length=0) 
    }else{
        for(var i = fns.length-1;i>=0;i--){
            var _fn = fns[i].fn;
            if(_fn===fn){
                fns.splice(i,1)
            }
        }
    }
}

var $bindObserver = function(data){
var self = this;
var keys = Object.keys(data)
keys.forEach(key => {
    var result = data[key];
    //这里用到闭包 result 作为在函数内被内部函数引用的变量，一直存在于缓存中
    Object.defineProperty(data,key, {
        enumerable:true,
        configurable:true,
        get:function(){
            // return 的是上个作用域的result
            return result
        },
        set:function(newVal){
            self.$emit(key,newVal);
            result = newVal;
        }
    })
  })
}
Vue.prototype = {
    $watch,$emit,$remove,$bindObserver
}
var person={
    name:"yosgi",
    age:29
}
var app1 = new Vue(person)
app1.listen("age",function(val){
    console.log(`age被改变，值为${val}`)
})
app1.data.age = 30
age被改变，值为30
```

上面实现的代码还有问题。

对象往往是一个深层次的结构，对象的某个属性可能仍然是一个对象，这种情况怎么处理？ 应该用递归来处理

```javascript
function Vue(data){
    this.data = data;
    this.watchList = [];
    //相当于clientLists
    this.$bindObserver(data)
}
var $watch = function (key,fn){
    if(!this.watchList[key]){
        this.watchList[key]=[];
    }
    this.watchList[key].push(fn)
}

var $emit = function(...args){
    var key = args.shift();
    console.log(this.watchList)
    fns = app1.watchList[key];
    if(!fns||fns.length==0) return;
    for(var i=0,fn;fn = fns[i];i++){
        fn.apply(this,args)
    }
}

var $remove = function(key,fn){
    var fns = this.watchList[key];
    if(!fns) return false
    if(!fn){
        fns && (fns.length=0) 
    }else{
        for(var i = fns.length-1;i>=0;i--){
            var _fn = fns[i].fn;
            if(_fn===fn){
                fns.splice(i,1)
            }
        }
    }
}

var $bindObserver = function(data){
var self = this;
var keys = Object.keys(data)
keys.forEach(key => {
    var result = data[key];
    if(typeof result ==='object'){
        self.$bindObserver(data[key])
    }
    Object.defineProperty(data,key, {
        enumerable:true,
        configurable:true,
        get:function(){
            return result
        },
        set:function(newVal){
            self.$emit(key,newVal);
             //如果newVal也是对象，同样需要对 对象添加 发布消息的功能
            if(typeof newVal ==='object'){
                self.$bindObserver(newVal)
            }
            result = newVal;
        }
    })
  })
}
Vue.prototype = {
    $watch,$emit,$remove,$bindObserver
}
var person={
    name:"yosgi",
    age:29,
    address:{
        city:"hangZhou",
        province:{
            a:1,
            b:2
        }
    }
}
var app1 = new Vue(person)

app1.$watch("city",function(val){
    console.log(`city被改变，值为${val}`)
})

app1.data.address.city = "beijing"
//city被改变，值为beijing
```

#### 小结

发布订阅模式的优点是时间和对象之间的解耦。缺点是创建订阅者本身要消耗时间和内存，订阅一个消息后若消息始终没有发生，订阅者会始终存在与内存中。

vue监听对象变化是发布订阅模式的一种应用，其中发布者就是 watchList 订阅者，通过$bindObserver 发布消息 。$bindObserver的作用是监听对象属性的改变触发$emit。需要注意的是

1.可能存在嵌套对象，嵌套对象的属性需要有发布功能。

2.可能修改后的变量也是对象，改变新的对象的属性仍需要有发布的功能。
<!-- ORIGINAL CHINESE CONTENT ENDS -->
