---
title: async
description: 《ES6标准入门》 知识点整理
categories:
  - JavaScript
tags:
  - JavaScript
  - JavaScript
date: 2018-07-11 14:47:05
summary: ""
---


#### 用法
例1 控制按顺序完成异步操作

    var fetchData = function(id){
    return new Promise((reslove,reject)=>{
        setTimeout(function(){
            console.log(`任务${id}执行`)
            reslove(`执行结果${id}`)
        },Math.random()*1000)
        })
    }

    async function tasksList(){
        //这里面的任务并发执行
        let list = [1,2,3,4,5]
        let promises = list.map((task)=>{
           return fetchData(task)
        })
        let results = await Promise.all(promises);
        return results
    }
    
    tasksList().then((res)=>{
        console.log(res)
        console.log("全部任务完成")
    })
    任务1执行
    任务2执行
    任务4执行
    任务5执行
    任务3执行
    ["执行结果1", "执行结果2", "执行结果3", "执行结果4", "执行结果5"]
 可以看到很类似promise，结果的输出是按照list的顺序的，区别是promise在函数执行之前就已经在执行异步请求了。

例2 继发完成异步操作

    //fetchData和例1相同
    async function tasksList(){
        //这里面的任务继发执行
        let  results  = [];
        try{
            for(let i=0;i<5;i++){
                let result =  await fetchData(i)
                results.push(result)
            }
        }catch(e){
            console.log(e)
        }
        return results
    }
    
    tasksList().then((res)=>{
        console.log(res)
        console.log("全部任务完成")
    })
    任务0执行
    任务1执行
    任务2执行
    任务3执行
    ["执行结果0", "执行结果1", "执行结果2", "执行结果3", "执行结果4"]
    全部任务完成

#### 概念
async是Generator函数的语法糖。
async相比于Gennerator改进的地方在于:
##### 内置执行器

asycn不像Generator需要执行器(co模块)

#####  更好的语义 


async表示函数里有异步操作，await表示是紧跟在后面的表达式需要等待结果

#####  更广的适用性


async函数的await命令后面，可以使Promise对象和原始类型的值，原始类型的值会返回一个立即resolved的promise对象

##### 返回值是promise


可以用then方法指定下一步的操作

