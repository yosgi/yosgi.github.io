---
draft: false
original: content/zh/post/legacy/观察者模式和vue监听对象变化.md
title: Observer mode and Vue monitoring object changes
description: Javascript Design Patterns Knowledge Points
categories:
- JavaScript
tags:
- JavaScript
- Design Patterns
date: 2018-05-05 22:38:54
updated: 2019-02-25 11:53:54
summary: ''
---

#### Publish-Subscribe Mode

The publish-subscribe pattern is also called the observer pattern. It defines a one-to-many dependency relationship between objects. When the state of an object changes, all objects that depend on it will be notified. In Js development, we generally use the event pattern instead of the traditional publish-subscribe pattern.

Steps to implement the publish-subscribe model

1. Specify the publisher

2. Add a cache list to the publisher to store callback functions for notifying subscribers

3. When publishing a message, the publisher will traverse the entire cache list and trigger the callback functions in it in turn

For example, a sales office can add information such as the unit price and area of the house to the information sent to the subscribers, and the subscribers receive the information and process it accordingly.

##### Sales Office Example```javascript
var salesOffices = {};
salesOffices.clientList = [];
salesOffices.listen = function(fn){
    // Publisher cache callback function
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
// Price = 2000000
// squareMeter=88
```Next, create a key for the subscribed message, add the subscriber ID, and extract the publish-subscribe functionality as an object.```javascript
var event = {
    clientList:{},
    listen:function(key,id,fn){
        // key subscription representation id subscriber id fnu callback function
        // There may be many subscribers and callback functions under a subscription identifier.
        // So the subscriber is treated as an array, and the callback function is stored in the array
        if(!this.clientList[key]){
            this.clientList[key]=[];
        }
        this.clientList[key].push({
            id,fn
        })
    },
    trigger:function(...args){// rest parameters
        var key = args.shift();
        fns = this.clientList[key];
       	// The callback function array is empty and does nothing.
        if(!fns||fns.length==0) return;
        // Trigger the functions in the callback function array in sequence
        for(var i=0,fn;fn = fns[i];i++){
            // fn is an object with a property id fn
            fn.fn.apply(this,args)
        }
    },
    remove:function(key,fn){
        var fns = this.clientList[key];
        if(!fns) return false// No one has subscribed to the corresponding key
        if(!fn){// If no specific callback is passed in, all subscriptions for the key will be canceled.
            fns && (fns.length=0) 
        }else{
            for(var i = fns.length-1;i>=0;i--){
                var _fn = fns[i].fn;
                if(_fn===fn){
                    fns.splice(i,1)// Delete callback
                }
            }
        }
    }
};

// Define an installEvent function to install publish and subscribe functions for the object
var installEvent = function(obj){
    for(var i in event){
        // Traverse the key of the event object and add attributes and attribute methods to obj
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
salesOffices.trigger('square88',1000000)// According to square88, the price is 1000000 * 2
salesOffices.trigger('square100',1500000)// Square100's news, the price is 1500000

salesOffices.remove("square88",f1);
salesOffices.trigger('square88',1000000)// Square88's news, the price is 1000000
```##### How does Vue monitor object changes?

`Object.defineProperty`

You can customize get and set functions, and trigger corresponding callback functions when getting and setting object properties. Using this method, you can install publish and subscribe functions for each property in the object.```javascript
// Create a Vue constructor using prototype inheritance
function Vue(data){
    // The new object will have data attributes
    this.data = data;
    // watchList is equivalent to the clientList above
    this.watchList = [];
    // Add the function of publishing messages to the data object
    this.$bindObserver(data)；
    
}
var $watch = function (key,fn){
    // It doesn't matter who the monitored ID is, so it is removed.
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
    // Here, the closure result is used as a variable referenced by the inner function within the function, and it always exists in the cache.
    Object.defineProperty(data,key, {
        enumerable:true,
        configurable:true,
        get:function(){
            // The return is the result of the previous scope
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
```There are still problems with the code implemented above.

Objects are often a deep structure, and a property of an object may still be an object. How to deal with this situation? Should we use recursion to handle it?```javascript
function Vue(data){
    this.data = data;
    this.watchList = [];
    // Equivalent to clientLists
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
             // If newVal is also an object, you also need to add the function of publishing messages to the object
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
// The city is changed to beijing
```Summary

The advantage of the publish-subscribe model is the decoupling of time and objects. The disadvantage is that creating a subscriber consumes time and memory. If a message is never received after subscribing to it, the subscriber will remain in memory.

Vue monitoring object changes is an application of the publish-subscribe model, in which the publisher is the watchList subscriber, which publishes messages through $bindObserver. The role of $bindObserver is to monitor the changes in object properties to trigger $emit. It should be noted that

1. There may be nested objects, and the properties of the nested objects need to have publishing functions.

2. The modified variable may also be an object, and changing the properties of the new object still requires the publishing function.
