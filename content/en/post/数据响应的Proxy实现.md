---
draft: true
original: 'content/zh/post/legacy/数据响应的Proxy实现.md'
title: 数据响应的Proxy实现
description: Javascript
categories:
  - JavaScript
tags:
  - JavaScript
  - Vue
date: 2018-07-27 15:56:49
summary: ""
---

# ENGLISH TRANSLATION NEEDED

This is an automatically generated English stub. Please translate the content below into English and remove the `draft: true` flag when ready.

<!-- ORIGINAL CHINESE CONTENT STARTS -->
在之前我利用Object.defineProperty 以及闭包完成的这个任务

{% post_link 观察者模式和vue监听对象变化 数据响应 %}

在学习了ES6的Proxy之后，我希望可以用proxy完成这个

{% post_link proxy Es6 proxy %}

    
需要完成的：
1. 能响应深层数据的变化
2. 能响应数组的变化
3. 如果改变后的也是对象，能响应新对象的变化


那么先简单测试一下proxy的功能

    let dog = {
        foods:["食物1","食物2","食物3"],
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
    
    proxy.push("食物3")//change change
    

发现可以响应数组的变化，不过多了一次响应。猜测应该是数组的长度和内容都发生了变化引起的。

有了前面的基础，很容易就能得到这个能响应数据变化的对象

    function observe(value, cb) {
        //声明需要返回的对象
        let proxyObj = value;
        Object.keys(proxyObj).forEach((key) => {
            //如果下一级是函数或者数组,进行内部的代理
            if(typeof proxyObj[key]=="object") proxyObj[key] = observe(proxyObj[key],cb)
        })
        //返回代理对象
        return proxyObj = defineReactive(proxyObj,cb)
    }
    
    function defineReactive (obj, cb) {
        //控制只触发一次回调函数
        let once = true;
        let proxy = new Proxy(obj,{
            get(target,key){
                return target[key]
            },
            set(target,key,val){
                if(typeof val=="object"){
                    //如果新值也是对象，返回代理对象
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
    
    
下面进行测试

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
    //数组改变
    app._data.text.push(5)//"render"
    //对象替换为新对象
    app._data.text2 = {
        text4:[1]
    }//"render"
    //新对象再次改变
    app._data.text2.text4.push(2)//"render"
    console.log(app._data.text2.text4)//Proxy {0: 1, 1: 2, length: 2}
    
    
    
    
    基本需求完成了，但是还有两个问题
 
    
1. app._data.text返回的是proxy对象，这不是我想要的结果
2. app._data.text操作才会触发set，我们需要一种方便的方法通过app.text直接设置就能触发set
<!-- ORIGINAL CHINESE CONTENT ENDS -->
