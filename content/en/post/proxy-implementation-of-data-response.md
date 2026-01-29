---
draft: false
original: content/zh/post/legacy/数据响应的Proxy实现.md
title: Proxy implementation of data response
description: Javascript
categories:
- JavaScript
tags:
- JavaScript
- Vue
date: 2018-07-27 15:56:49
summary: ''
---

I have previously used Object.defineProperty and closures to accomplish this task.

{% post_link observer mode and vue monitoring object changes data response %}

After learning about ES6 Proxy, I hope to use proxy to accomplish this

{% post_link proxy Es6 proxy %}

Required:
1. Respond to changes in underlying data
2. Respond to changes in arrays
3. If the object being modified is also an object, respond to changes in the new object

Then let's test the proxy function briefly.

let dog = {
foods:["food 1","food 2","food 3"],
}
let proxy = new Proxy(dog.foods,{
get(target,key){
return target[key]
},
set(target,key,val){
console.log("change")
target[key] = val;
return true
}
})

proxy.push("food 3") //change change


I found that I could respond to changes in the array, but there was one more response. I guess it was caused by changes in both the length and content of the array.

With the previous foundation, it is easy to get this object that can respond to data changes

function observe(value, cb) {
//Declare the object to be returned
let proxyObj = value;
Object.keys(proxyObj).forEach((key) => {
//If the next level is a function or array, perform internal proxying
if(typeof proxyObj[key]=="object") proxyObj[key] = observe(proxyObj[key],cb)
})
//Return the proxy object
return proxyObj = defineReactive(proxyObj,cb)
}

function defineReactive (obj, cb) {
//Control the callback function to be triggered only once
let once = true;
let proxy = new Proxy(obj,{
get(target,key){
return target[key]
},
set(target,key,val){
if(typeof val=="object"){
//If the new value is also an object, return the proxy object
val = observe(val,cb)
}
target[key] = val;
if(once){
cb();
once = false
}
return true
}
});
return proxy
}
class Vue {
constructor(options) {
this._data = observe(options.data,options.render)
}
}

Let's test it.

let app = new Vue({
el: '#app',
data: {
text: [1,2,3,4],
text2:{
text3:1
}
},
render(){
console.log("render");
}
})
//Array changes
app._data.text.push(5)//"render"
//Object replaced with new object
app._data.text2 = {
text4:[1]
}//"render"
//New object changes again
app._data.text2.text4.push(2)//"render"
console.log(app._data.text2.text4)//Proxy {0: 1, 1: 2, length: 2}

The basic requirements are met, but there are still two problems

1. app._data.text returns a proxy object, which is not what I want
2. The app._data.text operation will trigger the set. We need a convenient method to trigger the set directly by setting app.text
