---
title: Set和Map数据结构
date: 2018-05-02
description: 《ES6标准入门》 知识点整理
categories:
  - JavaScript
tags:
  - JavaScript
  - JavaScript
summary: ""
---
## Set 和 map数据结构

### set
基本用方法

ES6 提供了新的数据结构 Set。它类似于数组，但是成员的值都是唯一的，没有重复的值。

Set 本身是一个构造函数，用来生成 Set 数据结构。

    const s = new Set();

    [2, 3, 5, 4, 5, 2, 2].forEach(x => s.add(x));
    
    for (let i of s) {
      console.log(i);
    }
    // 2 3 5 4
    
Set 函数可以接受一个数组（或者具有 iterable 接口的其他数据结构）作为参数，用来初始化。

    // 数组去重
    [...new Set(array)]
    
向 Set 加入值的时候，不会发生类型转换，所以5和"5"是两个不同的值。Set 内部判断两个值是否不同，使用的算法叫做“Same-value-zero equality”，它类似于精确相等运算符（===），主要的区别是NaN等于自身，而精确相等运算符认为NaN不等于自身。

另外，两个对象总是不相等的。

#### Set 实例的属性和方法 

Set.prototype.constructor：构造函数，默认就是Set函数。

Set.prototype.size：返回Set实例的成员总数。

Set 实例的方法分为两大类：操作方法（用于操作数据）和遍历方法（用于遍历成员）。

add(value)：添加某个值，返回 Set 结构本身。

delete(value)：删除某个值，返回一个布尔值，表示删除是否成功。

has(value)：返回一个布尔值，表示该值是否为Set的成员。

clear()：清除所有成员，没有返回值。


#### 遍历操作

Set 结构的实例有四个遍历方法，可以用于遍历成员。

keys()：返回键名的遍历器

values()：返回键值的遍历器

entries()：返回键值对的遍历器

forEach()：使用回调函数遍历每个成员


##### keys()，values()，entries()
由于 Set 结构没有键名，只有键值（或者说键名和键值是同一个值），所以keys方法和values方法的行为完全一致。

    let set = new Set(['red', 'green', 'blue']);
    
    for (let item of set.keys()) {
      console.log(item);
    }
    // red
    // green
    // blue
    
    for (let item of set.values()) {
      console.log(item);
    }
    // red
    // green
    // blue
    
    for (let item of set.entries()) {
      console.log(item);
    }
    // ["red", "red"]
    // ["green", "green"]
    // ["blue", "blue"]
    
##### forEach()

    set = new Set([1, 4, 9]);
    set.forEach((value, key) => console.log(key + ' : ' + value))
    // 1 : 1
    // 4 : 4
    // 9 : 9

##### 遍历的应用

扩展运算符（...）内部使用for...of循环，所以也可以用于 Set 结构。

    let set = new Set(['red', 'green', 'blue']);
    let arr = [...set];
    // ['red', 'green', 'blue']
    
扩展运算符和 Set 结构相结合，就可以去除数组的重复成员。

而且，数组的map和filter方法也可以间接用于 Set 了。

    let set = new Set([1, 2, 3]);
    set = new Set([...set].map(x => x * 2));
    // 返回Set结构：{2, 4, 6}
    
    let set = new Set([1, 2, 3, 4, 5]);
    set = new Set([...set].filter(x => (x % 2) == 0));
    // 返回Set结构：{2, 4}
    
因此使用 Set 可以很容易地实现并集（Union）、交集（Intersect）和差集（Difference）。

    let a = new Set([1, 2, 3]);
    let b = new Set([4, 3, 2]);
    
    // 并集
    let union = new Set([...a, ...b]);
    // Set {1, 2, 3, 4}
    
    // 交集
    let intersect = new Set([...a].filter(x => b.has(x)));
    // set {2, 3}
    
    // 差集
    let difference = new Set([...a].filter(x => !b.has(x)));
    
如果想在遍历操作中，同步改变原来的 Set 结构，目前没有直接的方法，但有两种变通方法。一种是利用原 Set 结构映射出一个新的结构，然后赋值给原来的 Set 结构；另一种是利用Array.from方法。

    let set = new Set([1, 2, 3]);
    set = new Set([...set].map(val => val * 2));
    // set的值是2, 4, 6
    
    // 方法二
    let set = new Set([1, 2, 3]);
    set = new Set(Array.from(set, val => val * 2));
    // set的值是2, 4, 6
    
### WeakSet 

WeakSet 结构与 Set 类似，也是不重复的值的集合。但是，它与 Set 有两个区别。

首先，WeakSet 的成员只能是对象，而不能是其他类型的值。

其次，WeakSet 中的对象都是弱引用，即垃圾回收机制不考虑 WeakSet 对该对象的引用，也就是说，如果其他对象都不再引用该对象，那么垃圾回收机制会自动回收该对象所占用的内存，不考虑该对象还存在于 WeakSet 之中。

由于上面这个特点，WeakSet 的成员是不适合引用的，因为它会随时消失。另外，由于 WeakSet 内部有多少个成员，取决于垃圾回收机制有没有运行，运行前后很可能成员个数是不一样的，而垃圾回收机制何时运行是不可预测的，因此 ES6 规定 WeakSet 不可遍历。

#### 语法

WeakSet 是一个构造函数，可以使用new命令，创建 WeakSet 数据结构。

    const a = [[1, 2], [3, 4]];
    const ws = new WeakSet(a);
    // WeakSet {[1, 2], [3, 4]}

作为构造函数，WeakSet 可以接受一个数组或类似数组的对象作为参数。（实际上，任何具有 Iterable 接口的对象，都可以作为 WeakSet 的参数。）该数组的所有成员，都会自动成为 WeakSet 实例对象的成员。

WeakSet 结构有以下三个方法。

WeakSet.prototype.add(value)：向 WeakSet 实例添加一个新成员。

WeakSet.prototype.delete(value)：清除 WeakSet 实例的指定成员。

WeakSet.prototype.has(value)：返回一个布尔值，表示某个值是否在 WeakSet 实例之中。

WeakSet 不能遍历，是因为成员都是弱引用，随时可能消失，遍历机制无法保证成员的存在，很可能刚刚遍历结束，成员就取不到了。WeakSet 的一个用处，是储存 DOM 节点，而不用担心这些节点从文档移除时，会引发内存泄漏。

### Map 

#### 含义和基本用法

Map 数据结构。类似于对象，也是键值对的集合，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键。

也就是说，Object 结构提供了“字符串—值”的对应，Map 结构提供了“值—值”的对应，是一种更完善的 Hash 结构实现。如果你需要“键值对”的数据结构，Map 比 Object 更合适。

    const m = new Map();
    const o = {p: 'Hello World'};
    
    m.set(o, 'content')
    m.get(o) // "content"
    
    m.has(o) // true
    m.delete(o) // true
    m.has(o) // false
    
    const map = new Map([
      ['name', '张三'],
      ['title', 'Author']
    ]);
    
    map.size // 2
    map.has('name') // true
    map.get('name') // "张三"
    map.has('title') // true
    map.get('title') // "Author"
    
Map构造函数接受数组作为参数，实际上执行的是下面的算法。
    const items = [
      ['name', '张三'],
      ['title', 'Author']
    ];
    
    const map = new Map();
    
    items.forEach(
      ([key, value]) => map.set(key, value)
    );
    
不仅仅是数组，任何具有 Iterator 接口、且每个成员都是一个双元素的数组的数据结构都可以当作Map构造函数的参数。这就是说，Set和Map都可以用来生成新的 Map。

    const set = new Set([
      ['foo', 1],
      ['bar', 2]
    ]);
    const m1 = new Map(set);
    m1.get('foo') // 1
    
    const m2 = new Map([['baz', 3]]);
    const m3 = new Map(m2);
    m3.get('baz') // 3

如果对同一个键多次赋值，后面的值将覆盖前面的值。如果读取一个未知的键，则返回undefined。只有对同一个对象的引用，Map 结构才将其视为同一个键。

Map 的键实际上是跟内存地址绑定的，只要内存地址不一样，就视为两个键。这就解决了同名属性碰撞（clash）的问题，我们扩展别人的库的时候，如果使用对象作为键名，就不用担心自己的属性与原作者的属性同名。

#### 实例的属性和操作方法

##### size属性返回 Map 结构的成员总数。

    const map = new Map();
    map.set('foo', true);

##### set方法设置键名key对应的键值为value，然后返回整个 Map 结构。如果key已经有值，则键值会被更新，否则就新生成该键。

    const m = new Map();

    m.set('edition', 6)      

    let map = new Map()//返回的是整个Map解构所以可以用链式写法
      .set(1, 'a')
      .set(2, 'b')
      
##### get(key)  get方法读取key对应的键值，如果找不到key，返回undefined。

    const m = new Map();

    const hello = function() {console.log('hello');};
    m.set(hello, 'Hello ES6!') // 键是函数
    
    m.get(hello)  // Hello ES6!
    
##### has(key) has方法返回一个布尔值，表示某个键是否在当前 Map 对象之中。

    const m = new Map();

    m.set('edition', 6);

##### delete(key) delete方法删除某个键，返回true。如果删除失败，返回false。

    const m = new Map();
    m.set(undefined, 'nah');
    m.has(undefined)     // true

##### clear()方法清除所有成员，没有返回值。

#### 遍历方法
Map 结构原生提供三个遍历器生成函数和一个遍历方法。


keys()：返回键名的遍历器。

values()：返回键值的遍历器。

entries()：返回所有成员的遍历器。

forEach()：遍历 Map 的所有成员。

需要特别注意的是，Map 的遍历顺序就是插入顺序。

与set方法类似

#### 与其他数据结构的互相转换

##### Map 转为数组
    const myMap = new Map()
      .set(true, 7)
      .set({foo: 3}, ['abc']);
    [...myMap]
    // [ [ true, 7 ], [ { foo: 3 }, [ 'abc' ] ] ]
    
##### 数组 转为 Map
    new Map([
      [true, 7],
      [{foo: 3}, ['abc']]
    ])
    // Map {
    //   true => 7,
    //   Object {foo: 3} => ['abc']
    // }
    
##### Map 转为对象
如果所有 Map 的键都是字符串，它可以无损地转为对象。

    function strMapToObj(strMap) {
      let obj = Object.create(null);
      for (let [k,v] of strMap) {
        obj[k] = v;
      }
      return obj;
    }
    
    const myMap = new Map()
      .set('yes', true)
      .set('no', false);
    strMapToObj(myMap)
    // { yes: true, no: false }
如果有非字符串的键名，那么这个键名会被转成字符串，再作为对象的键名。

##### 对象转为 Map

    function objToStrMap(obj) {
      let strMap = new Map();
      for (let k of Object.keys(obj)) {
        strMap.set(k, obj[k]);
      }
      return strMap;
    }
    
    objToStrMap({yes: true, no: false})
    // Map {"yes" => true, "no" => false}

##### Map 转为 JSON
Map 转为 JSON 要区分两种情况。一种情况是，Map 的键名都是字符串，这时可以选择转为对象 JSON。

    function strMapToJson(strMap) {
      return JSON.stringify(strMapToObj(strMap));
    }
    
    let myMap = new Map().set('yes', true).set('no', false);
    strMapToJson(myMap)
    // '{"yes":true,"no":false}'

另一种情况是，Map 的键名有非字符串，这时可以选择转为数组 JSON。
    
    function mapToArrayJson(map) {
      return JSON.stringify([...map]);
    }
    
    let myMap = new Map().set(true, 7).set({foo: 3}, ['abc']);
    mapToArrayJson(myMap)
    // '[[true,7],[{"foo":3},["abc"]]]'
    
##### JSON 转为 Map
JSON 转为 Map，正常情况下，所有键名都是字符串。

    function jsonToStrMap(jsonStr) {
      return objToStrMap(JSON.parse(jsonStr));
    }
    
    jsonToStrMap('{"yes": true, "no": false}')
    // Map {'yes' => true, 'no' => false}

但是，有一种特殊情况，整个 JSON 就是一个数组，且每个数组成员本身，又是一个有两个成员的数组。这时，它可以一一对应地转为 Map。这往往是 Map 转为数组 JSON 的逆操作。

    function jsonToMap(jsonStr) {
      return new Map(JSON.parse(jsonStr));
    }
    
    jsonToMap('[[true,7],[{"foo":3},["abc"]]]')
    // Map {true => 7, Object {foo: 3} => ['abc']}


### WeakMap

WeakMap结构与Map结构类似，也是用于生成键值对的集合。

WeakMap与Map的区别有两点。

首先，WeakMap只接受对象作为键名（null除外），不接受其他类型的值作为键名。

其次，WeakMap的键名所指向的对象，不计入垃圾回收机制。

WeakMap的设计目的在于，有时我们想在某个对象上面存放一些数据，但是这会形成对于这个对象的引用。

    const e1 = document.getElementById('foo');
    const e2 = document.getElementById('bar');
    const arr = [
      [e1, 'foo 元素'],
      [e2, 'bar 元素'],
    ];

上面代码中，e1和e2是两个对象，我们通过arr数组对这两个对象添加一些文字说明。这就形成了arr对e1和e2的引用。

一旦不再需要这两个对象，我们就必须手动删除这个引用，否则垃圾回收机制就不会释放e1和e2占用的内存。

    arr [0] = null;
    arr [1] = null;
    
WeakMap 就是为了解决这个问题而诞生的，它的键名所引用的对象都是弱引用，即垃圾回收机制不将该引用考虑在内。因此，只要所引用的对象的其他引用都被清除，垃圾回收机制就会释放该对象所占用的内存。也就是说，一旦不再需要，WeakMap 里面的键名对象和所对应的键值对会自动消失，不用手动删除引用。

基本上，如果你要往对象上添加数据，又不想干扰垃圾回收机制，就可以使用 WeakMap。一个典型应用场景是，在网页的 DOM 元素上添加数据，就可以使用WeakMap结构。当该 DOM 元素被清除，其所对应的WeakMap记录就会自动被移除。
    
    const wm = new WeakMap();

    const element = document.getElementById('example');
    
    wm.set(element, 'some information');
    wm.get(element) // "some information"
    
注意，WeakMap 弱引用的只是键名，而不是键值。键值依然是正常引用。

    const wm = new WeakMap();
    let key = {};
    let obj = {foo: 1};
    
    wm.set(key, obj);
    obj = null;
    wm.get(key)
    // Object {foo: 1}

#### WeakMap 的语法

