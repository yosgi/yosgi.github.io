---
draft: false
original: content/zh/post/legacy/代理模式.md
title: Proxy Mode
description: Javascript Design Patterns Knowledge Points
categories:
- JavaScript
tags:
- JavaScript
- Design Patterns
date: 2018-04-19 09:46:11
summary: ''
---

#### Proxy Mode

##### Proxy Mode and Image Preloading

Let’s implement a picture preloading function without using proxy mode.

var myImage = (function(){
var imgNode = document.createElement("img");
document.body.appendChild(imgNode);
var img = new Image;
img.onload = function(){
imgNode.src = img.src;
}
return {
setSrc:function(src){
imgNode.src = "./bd_logo1.png"
img.src = src
}
}
})()
myImage.setSrc("http://data.17jita.com/attachment/forum/201412/20/213333npk8mvppcav3rmv8.png")

The problem is that if our network speed no longer requires preloading, we have to modify the myImage object.

At the same time, in addition to setting the src for the img node, myImage is also responsible for preloading images, which violates the single responsibility principle.

The following uses the proxy mode to implement the preloading function

    var myImage = (function(){
        var imgNode = document.createElement("img");
        document.body.appendChild(imgNode)
        return {
            setSrc:function(src){
                imgNode.src=src
            }
        }
    })()
    
    var proxyImage = (function(){
        var img = new Image;
        img.onload = function(){
            myImage.setSrc(this.src)
        }
        return {
            setSrc:function(src){
                myImage.setSrc("./bd_logo1.png")
                img.src = src;
            }
        }
    })()
    proxyImage.setSrc("http://data.17jita.com/attachment/forum/201412/20/213333npk8mvppcav3rmv8.png")

Indirectly access myIname through proxyImage to control the preloading of images.

When preloading is not required, just change the reference to proxyImage to myImage.

#### Virtual proxy merges http requests

In web development, the biggest overhead is network requests. Suppose we are doing a file synchronization function. When we select a checkbox, the corresponding file will be synchronized to another server.

    var　synchronousFile = function(id){
        console.log("Start synchronizing files"+id)
    }
    var proxysynchronousFile = (function(){
        var cache = [],
        timer;
        return function(id){
            cache.push(id);
            if(timer){
                return
            };
            timer = setTimeout(function(){
                synchronousFile(cache.join(","))
                clearTimeout(timer);
                timer = null;
                cache.length = 0;
            },2000)
        }
    })()
    var checkbox = document.getElementByTagName("input");
    for(var i=0,c;c = checkbox[i];i++){
        c.onclick = function(){
            if(this.checked===true){
                proxysynchronousFile(this.id)
            }
        }
    }
    
#### Caching proxy

##### Application of Cache Proxy - Calculating Product

The cache proxy can provide temporary storage for the calculation results. During the next calculation, if the parameters passed are the same as before, the previously stored calculation results can be directly returned.

var mult = function(...numbers){ // ES6 rest parameter
var a = 1;
for(var i = 0, number; number = numbers[i]; i++){
a* = number
}
return a
}
mult(2, 3) // 6

Add caching proxy

var proxyMult = (function(){
var chache = {};
return function(...numbers){
var args = numbers.join(',')
if(chache[args]){
return chache[args]
}
return chache[args] = mult(...numbers)//ES6 function extension operator, inverse operation of rest parameters
}
})(
)
proxyMult(2,3)//6

##### Application of cache proxy-ajax asynchronous request resources

For paging requirements encountered in projects, the backend only needs to fetch the same page once. The next time the same page is requested, the cached data can be used directly. A cache proxy can also be used. Unlike calculating a product, fetching data is an asynchronous operation, so the result cannot be directly cached. An asynchronous callback must be used.

var chache = {};
var request = function(num){
ajax(num) // Pretend to be an Ajax request
.success(function(res){
render(res.data) // Pretend to be a rendering operation
chache[num] = res.data
})
}
var getPage = function(num){
request(num)
}

var proxyPage = function(){
return function(num){
if(chache[num]){
return chache[num]
}
getPage(num)
}
}

#### Dynamically creating proxies with higher-order functions

You can pass a calculation function as a parameter to the proxy that creates the cache, so you can create a unified proxy for multiplication, addition, and subtraction.

//Multiplication
var mult = (...args)=>{
var a = 1 ;
for(var i=0,c;c=args[i];i++){
a *=c
}
return a
}
//Addition
var plus = (...args)=>{
var a = 0;
for(var i=0,c;c=args[i];i++){
a+=c
}
return a
}

//Proxy factory
var createProxyFactory = (fn)=>{
var chache = {};
return function(...args){
var arg = args.join(",");
if(arg in chache){
return chache[arg]
}
return chache[arg] = fn(...args)
}
    };
    var proxyMult = createProxyFactory(mult),
    proxyPlus = createProxyFactory(plus);
    
    proxyMult(1,2,3,4)//24
    proxyPlus(1,2,3,4)//10
    

#### Summary
The key to the proxy pattern is that when direct access to an object is inconvenient or unsatisfactory, a proxy object is provided to control access to the object. The proxy object then processes the request and then forwards it to the original object.

The most commonly used proxy modes in JavaScript development are virtual proxy and caching proxy.

Virtual proxies delay the creation of expensive objects until they are actually needed. (The imgNode sets its src after the img onload is complete.)

The cache proxy provides temporary storage for the results of some expensive operations. (The results are stored in chache)

When writing business code, you often don't need to guess in advance whether it is needed. When it is inconvenient to access an object directly, it is not too late to write a proxy.
