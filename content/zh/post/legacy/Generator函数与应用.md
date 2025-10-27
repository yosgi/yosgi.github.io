---
title: Generator函数与应用
description: 《ES6标准入门》 知识点整理
categories:
  - JavaScript
tags:
  - JavaScript
  - JavaScript
date: 2018-07-06 18:37:55
summary: ""
---
![image](/images/generator-function-usage/Generator.png)

#### 基本概念

形式上，Generator 函数是一个普通函数，但是有两个特征。一是，function关键字与函数名之间有一个星号；二是，函数体内部使用yield表达式，定义不同的内部状态
    
    function* helloWorldGenerator() {
      yield 'hello';
      yield 'world';
      return 'ending';
    }
    
    var hw = helloWorldGenerator();

调用 Generator 函数后，该函数并不执行，返回的也不是函数运行结果，而是一个指向内部状态的遍历器对象

调用 Generator 函数，返回一个遍历器对象，代表 Generator 函数的内部指针。以后，每次调用遍历器对象的next方法，就会返回一个有着value和done两个属性的对象。value属性表示当前的内部状态的值，是yield表达式后面那个表达式的值；done属性是一个布尔值，表示是否遍历结束。


#### yield 表达式

yield表达式是暂停标志。

遇到yield表达式，就暂停执行后面的操作，并将紧跟在yield后面的那个表达式的值，作为返回的对象的value属性值。

直到return语句为止，并将return语句后面的表达式的值，作为返回的对象的value属性值。如果该函数没有return语句，则返回的对象的value属性值为undefined。

yield表达式只能用在 Generator 函数里面。

另外，yield表达式如果用在另一个表达式之中，必须放在圆括号里面。

yield表达式用作函数参数或放在赋值表达式的右边，可以不加括号。


    function* demo() {
      console.log('Hello' + yield); // SyntaxError
      console.log('Hello' + yield 123); // SyntaxError
    
      console.log('Hello' + (yield)); // OK
      console.log('Hello' + (yield 123)); // OK
      foo(yield 'a', yield 'b'); // OK
        let input = yield; // OK
    }   
    
#### 遍历器对象

可以把 Generator 赋值给对象的Symbol.iterator属性，从而使得该对象具有 Iterator 接口。

    var myIterable = {};
    myIterable[Symbol.iterator] = function* () {
      yield 1;
      yield 2;
      yield 3;
    };
    
    [...myIterable] // [1, 2, 3]
    
Generator 函数执行后，返回一个遍历器对象。该对象本身也具有Symbol.iterator属性，执行后返回自身。
，(ES6 规定这个遍历器是 Generator 函数的实例，也继承了 Generator 函数的prototype对象上的方法)。

    function* gen(){
      // some code
    }
    
    var g = gen();
    
    g[Symbol.iterator]() === g// true
    g instanceof  gen=== g// true
    
    
for...of循环可以自动遍历 Generator 函数时生成的Iterator对象，

    function* foo() {
      yield 1;
      yield 2;
      yield 3;
      yield 4;
      yield 5;
      return 6;
    }
    
    for (let v of foo()) {
      console.log(v);
    }
    // 1 2 3 4 5
    
同样，可以遍历使用Generator作为Iterator接口的对象

    function* objectEntries() {
      let propKeys = Object.keys(this);
    
      for (let propKey of propKeys) {
        yield [propKey, this[propKey]];
      }
    }
    
    let jane = { first: 'Jane', last: 'Doe' };
    
    jane[Symbol.iterator] = objectEntries;
    
    for (let [key, value] of jane) {
      console.log(`${key}: ${value}`);
    }
    // first: Jane
    // last: Doe
    
#### 方法
next()、throw()、return() 的共同点

它们的作用都是让 Generator 函数恢复执行，并且使用不同的语句替换yield表达式。


    //next()是将yield表达式替换成一个值。
    const g = function* (x, y) {
      let result = yield x + y;
      return result;
    };
    
    const gen = g(1, 2);
    gen.next(); // Object {value: 3, done: false}
    
    gen.next(1); // Object {value: 1, done: true}
    // 相当于将 let result = yield x + y
    // 替换成 let result = 1;
    //throw()是将yield表达式替换成一个throw语句。
    gen.throw(new Error('出错了')); // Uncaught Error: 出错了
    // 相当于将 let result = yield x + y
    // 替换成 let result = throw(new Error('出错了'));
    return()是将yield表达式替换成一个return语句。
    gen.return(2); // Object {value: 2, done: true}
    // 相当于将 let result = yield x + y
    // 替换成 let result = return 2;
    
    
#### yield*
从语法角度看，如果yield表达式后面跟的是一个遍历器对象，需要在yield表达式后面加上星号，表明它返回的是一个遍历器对象。这被称为yield*表达式。

任何数据结构只要有 Iterator 接口，就可以被yield*遍历。

    let read = function* () {
        yield 'hello';
        yield* 'hello';
      };
      
    for(let i of read()){
        console.log(i)
    }
    //hello h,e,l,l,o
    
yield*语句遍历完全二叉树。

    // 下面是二叉树的构造函数，
    // 三个参数分别是左树、当前节点和右树
    function Tree(left, label, right) {
      this.left = left;
      this.label = label;
      this.right = right;
    }
    
    // 下面是中序（inorder）遍历函数。
    // 由于返回的是一个遍历器，所以要用generator函数。
    // 函数体内采用递归算法，所以左树和右树要用yield*遍历
    function* inorder(t) {
      if (t) {
        yield* inorder(t.left);
        yield t.label;
        yield* inorder(t.right);
      }
    }
    
    // 下面生成二叉树
    function make(array) {
      // 判断是否为叶节点
      if (array.length == 1) return new Tree(null, array[0], null);
      return new Tree(make(array[0]), array[1], make(array[2]));
    }
    let tree = make([[['a'], 'b', ['c']], 'd', [['e'], 'f', ['g']]]);
    
    // 遍历二叉树
    var result = [];
    for (let node of inorder(tree)) {
      result.push(node);
    }
    
    result
    // ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    
#### 应用

##### 状态机

    var clock = function* () {
      while (true) {
        console.log('Tick!');
        yield;
        console.log('Tock!');
        yield;
      }
    };
上面的 Generator 实现与 ES5 实现对比，少了用来保存状态的外部变量，这样就更简洁，更安全。


##### 异步操作的同步化表达

    function* main() {
      var result = yield request("http://some.url");
      var resp = JSON.parse(result);
        console.log(resp.value);
    }
    
    function request(url) {
      makeAjaxCall(url, function(response){
        it.next(response);
      });
    }
    
    var it = main();
    it.next();
    
异步操作的后续操作可以放在yield表达式下面，反正要等到调用next方法时再执行

##### 控制流管理

使用一个函数，按次序自动执行所有步骤。

    function* longRunningTask(value1) {
      try {
        var value2 = yield step1(value1);
        var value3 = yield step2(value2);
        var value4 = yield step3(value3);
        var value5 = yield step4(value4);
        // Do something with value4
      } catch (e) {
        // Handle any error from step1 through step4
      }
    }
    scheduler(longRunningTask(initialValue));

    function scheduler(task) {
      var taskObj = task.next(task.value);
      // 如果Generator函数未结束，就继续调用
      if (!taskObj.done) {
        task.value = taskObj.value
        scheduler(task);
      }
    }
    
==上面这种做法，只适合同步操作，即所有的task都必须是同步的，不能有异步操作。因为这里的代码一得到返回值，就继续往下执行，没有判断异步操作何时完成。如果要控制异步的操作流程，见下面thunk部分==

yield*可以将任务分解成多个依次执行的任务。

    let jobs = [job1, job2, job3];
    
    function* iterateJobs(jobs){
      for (var i=0; i< jobs.length; i++){
        var job = jobs[i];
        yield* iterateSteps(job.steps);
      }
    }
    for (var step of iterateJobs(jobs)){
      console.log(step.id);
    }

数组jobs封装了一个项目的多个任务，iterateJobs则是依次为这些任务加上yield*命令。

##### 作为数组结构

Generator 可以看作是一个数组结构，因为 Generator 函数可以返回一系列的值，这意味着它可以对任意表达式，提供类似数组的接口。

    function* doStuff() {
      yield fs.readFile.bind(null, 'hello.txt');
      yield fs.readFile.bind(null, 'world.txt');
      yield fs.readFile.bind(null, 'and-such.txt');
    }
    for (task of doStuff()) {
      // task是一个函数，可以像回调函数那样使用它
    }
    //es5
    function doStuff() {
      return [
        fs.readFile.bind(null, 'hello.txt'),
        fs.readFile.bind(null, 'world.txt'),
        fs.readFile.bind(null, 'and-such.txt')
      ];
    }
    
##### 封装异步任务

Generator 函数可以暂停执行和恢复执行，这是它能封装异步任务的根本原因。除此之外，它还有两个特性，使它可以作为异步编程的完整解决方案：函数体内外的数据交换和错误处理机制。

异步操作需要暂停的地方，都用yield语句注明。

next返回值的 value 属性，是 Generator 函数向外输出数据；next方法还可以接受参数，向 Generator 函数体内输入数据。

Generator 函数体外，使用指针对象的throw方法抛出的错误，可以被函数体内的try...catch代码块捕获。

例子：

    var fetch = require('node-fetch');
    
    function* gen(){
      var url = 'https://api.github.com/users/github';
      var result = yield fetch(url);
      console.log(result.bio);
    }
    var g = gen();
    var result = g.next();
    
    result.value.then(function(data){
      return data.json();
    }).then(function(data){
      g.next(data);
    });




#### Generator 函数的异步流程管理

先拿个例子看下只用Generator试试管理异步流程：

    function fetchData(time,fn){
        //一个异步函数，在random*1000ms后执行回调
        setTimeout(function(){
          fn(time)
        },Math.random()*1000)
    }
    
    var taskList = function *(){
        for(let i=0;i<10;i++){
            //生成任务0~10
            yield fetchData(i,function(data){
                console.log(`任务${data}的回调`)
            })
        }
    }
    
    var taskObj = taskList()
    var task = taskObj.next()
    while(!task.done){
        task = taskObj.next()
    }
    //任务6的回调
    //任务4的回调
    //任务0的回调
    //任务2的回调
    //任务1的回调
    //任务7的回调
    //任务8的回调
    //任务9的回调
    //任务5的回调
    //任务3的回调

可以看到每运行fetchData执行的任务顺序都是不一样的，不能达到“执行一个后执行下一个”的效果。这时，Thunk 函数就能派上用处。


###### Thunk函数
Thunk 函数替换多参数函数，将其替换成一个只接受回调函数作为参数的单参数函数。

    function thunkify(fn) {
        return function() {
          var args = new Array(arguments.length);
          var ctx = this;
      
          for (var i = 0; i < args.length; ++i) {
            args[i] = arguments[i];
          }
      
          return function (done) {
            var called;
      
            args.push(function () {
              if (called) return;
              called = true;
              done.apply(null, arguments);
            });
      
            try {
              fn.apply(ctx, args);
            } catch (err) {
              done(err);
            }
          }
        }
      };

举个例子：

    var fetchData = function(data,fn){
        setTimeout(function(){
            console.log("读取文件"+data+"中")
            fn(data)
        },1000)
    }
    fetchData(1,function(data){
        console.log("文件"+data+"读取完毕")   
    })//普通的调用函数
    var fetchDataThunk = thunkify(fetchData)
    fetchDataThunk(1)(function(data){
        console.log("文件"+data+"读取完毕")   
    })//加入chunk的调用
    
可以的看出fetchDataThunk(1)调用之后会返回一个以回调函数作为参数的函数。再结合yield可以把函数内部的结果返回给next()调用的结果。可以实现在函数外部控制函数内的调用。

还是拿上面的fetchData为例子：

    var thunkify = require('thunkify');
    var fetchData = function(data,fn){
        setTimeout(function(){
            console.log("读取文件"+data+"中")
            fn(data)
        },Math.random()*1000)
    }
    var fetchDataThunk = thunkify(fetchData)
    var taskList = function *(){
        var f1 = yield fetchDataThunk(1)
        var f2 = yield fetchDataThunk(2)
    }
    
    
    var task = taskList();
    var taskObj = task.next();
    console.log(taskObj)
    taskObj.value(function(data){
        console.log("文件"+data+"读取完毕")
        var taskObj2 = task.next();
        taskObj2.value(function(data){
            console.log("文件"+data+"读取完毕")
        })
    })
    // 读取文件1中
    // 文件1读取完毕
    // 读取文件2中
    // 文件2读取完毕

接下来，回到一开始的需求，用thunk使Generator 中的函数“执行一个后执行下一个”

    //nodejs环境下运行
    var thunkify = require('thunkify');
    var fetchData = function(data,fn){
        setTimeout(function(){
            console.log("读取文件"+data+"中")
            fn(data)
        },Math.random()*1000)
    }
    var fetchDataThunk = thunkify(fetchData)
    var taskList = function *(){
        for(let i=0;i<5;i++){
            yield fetchDataThunk(i)
            console.log("文件"+i+"读取完毕")
        }
    }
    
    function run (fn){
        var task = fn();
        function next(){
            //task.next()返回的是{value:[Function],done:false/true}
            //value属性用来调用下一步需要执行的方法
            var result  = task.next();
            if (result.done) return;
            result.value(next);
        }
        next()
    }
    
    run(taskList)
    // 读取文件0中
    // 文件0读取完毕
    // 读取文件1中
    // 文件1读取完毕
    // 读取文件2中
    // 文件2读取完毕
    // 读取文件3中
    // 文件3读取完毕
    // 读取文件4中
    // 文件4读取完毕

可以看到，taskList里面的异步函数是按顺序执行的，和同步可以说是差不多了

Thunk 函数并不是 Generator 函数自动执行的唯一方案。因为自动执行的关键是，必须有一种机制，自动控制 Generator 函数的流程，接收和交还程序的执行权。回调函数可以做到这一点，Promise 对象也可以做到这一点。

#### co 模块

上面编写Generator 函数的执行器还是麻烦了点。co 模块可以解决这个问题。
兴高采烈的使用一下

    //nodejs环境下运行
    var co = require('co');
    var fetchData = function(data){
        setTimeout(function(){
            console.log("读取文件"+data+"中")
        },Math.random()*1000)
    }
    var taskList = function *(){
        for(let i=0;i<5;i++){
            yield fetchData(i)
            console.log("文件"+i+"读取完毕")
        }
    }
    
    
    co(taskList)
    // UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 1): TypeError: You may //only yield a function, promise, generator, array, or object, but the following object was passed: //"undefined"
    //(node:16260) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, //promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
    读取文件0中
    
报错了。只好看看源码



    function co(gen) {
      var ctx = this;
    
      return new Promise(function(resolve, reject) {
        if (typeof gen === 'function') gen = gen.call(ctx);
        if (!gen || typeof gen.next !== 'function') return resolve(gen);
    
        onFulfilled();
        function onFulfilled(res) {
          var ret;
          try {
            ret = gen.next(res);
          } catch (e) {
            return reject(e);
          }
          next(ret);
        }
      });
    }
    function next(ret) {
      if (ret.done) return resolve(ret.value);
      var value = toPromise.call(ctx, ret.value);
      if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
      return onRejected(
        new TypeError(
          'You may only yield a function, promise, generator, array, or object, '
          + 'but the following object was passed: "'
          + String(ret.value)
          + '"'
        )
      );
    }
    
co 模块其实就是将两种自动执行器（Thunk 函数和 Promise 对象），包装成一个模块。使用 co 的前提条件是，Generator 函数的yield命令后面，只能是 Thunk 函数或 Promise 对象。

改写成Promise试一试

    var co = require('co');
    var fetchData =function(data){
        new Promise((resolve,reject)=>{
            setTimeout(function(){
                console.log("读取文件"+data+"中")
                resolve()
            },Math.random()*1000)
        })
    }
    var taskList = function *(){
        var f1 = fetchData(0)
        console.log("文件"+0+"读取完毕")
        var f2 = fetchData(1)
        console.log("文件"+1+"读取完毕")
    }
    
    co(taskList).then(res=>{
        console.log("全部完毕")
    }).catch(e=>{
        console.log("错误")
    })
    // 文件0读取完毕
    // 文件1读取完毕
    // 全部完毕
    // 读取文件1中
