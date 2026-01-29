---
draft: false
original: content/zh/post/legacy/Set和Map数据结构.md
title: Set and Map Data Structures
date: 2018-05-02
description: '"ES6 Standard Introduction" Knowledge Points Summary'
categories:
- JavaScript
tags:
- JavaScript
- JavaScript
summary: ''
---

Set and Map Data Structures

### set
Basic usage

ES6 provides a new data structure called Set. It is similar to an array, but the values of its members are unique and there are no duplicate values.

Set itself is a constructor used to generate a Set data structure.

const s = new Set();

[2, 3, 5, 4, 5, 2, 2].forEach(x => s.add(x));

for (let i of s) {
console.log(i);
}
// 2 3 5 4

The Set function can accept an array (or other data structure with an iterable interface) as a parameter for initialization.

// Array deduplication
[...new Set(array)]

When adding values to a Set, no type conversion occurs, so 5 and "5" are two different values. Set internally determines whether two values are different using an algorithm called "same-value-zero equality," which is similar to the exact equality operator (===). The main difference is that NaN is equal to itself, while the exact equality operator considers NaN not equal to itself.

Additionally, two objects are never equal.

#### Properties and methods of Set instances

Set.prototype.constructor: Constructor, the default is the Set function.

Set.prototype.size: Returns the total number of members in the Set instance.

The methods of Set instances are divided into two categories: operation methods (used to operate on data) and traversal methods (used to traverse members).

add(value): Add a value and return the Set structure itself.

delete(value): Deletes a value and returns a Boolean value indicating whether the deletion is successful.

has(value): Returns a Boolean value indicating whether the value is a member of the Set.

clear(): Clears all members and has no return value.

#### Traversal Operation

Instances of the Set structure have four traversal methods that can be used to traverse members.

keys(): Returns a traversal of key names

values(): Returns a traversal of key values

entries(): Returns a traversal of key-value pairs

forEach(): Iterate over each member using a callback function

##### keys(), values(), entries()
Since the Set structure has no keys, only values (or the key and value are the same), the keys method and the values method behave identically.

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

##### Application of traversal

The spread operator (...) uses a for...of loop internally, so it can also be used with the Set structure.

let set = new Set(['red', 'green', 'blue']);
let arr = [...set];
// ['red', 'green', 'blue']

The spread operator combined with the Set construct can remove duplicate elements from an array.

Furthermore, the map and filter methods of arrays can also be used indirectly on Sets.

let set = new Set([1, 2, 3]);
set = new Set([...set].map(x => x * 2));
// Returns a Set structure: {2, 4, 6}

let set = new Set([1, 2, 3, 4, 5]);
set = new Set([...set].filter(x => (x % 2) == 0));
// Returns a Set structure: {2, 4}

Thus, using Sets, it's easy to implement unions, intersections, and differences.

let a = new Set([1, 2, 3]);
let b = new Set([4, 3, 2]);

// Union
let union = new Set([...a, ...b]);
// Set {1, 2, 3, 4}

// Intersection
let intersect = new Set([...a].filter(x => b.has(x)));
// Set {2, 3}

// Difference
let difference = new Set([...a].filter(x => !b.has(x)));

If you want to synchronously modify the original Set structure during a traversal operation, there is currently no direct method, but there are two workarounds. One is to map a new structure from the original Set structure and then assign it to the original Set structure; the other is to use the Array.from method.

let set = new Set([1, 2, 3]);
set = new Set([...set].map(val => val * 2));
// The values of set are 2, 4, and 6

// Method 2
let set = new Set([1, 2, 3]);
set = new Set(Array.from(set, val => val * 2));
// The values of set are 2, 4, and 6

### WeakSet

The WeakSet structure is similar to a Set in that it is also a collection of unique values. However, it differs from a Set in two ways.

First, the members of WeakSet can only be objects, not other types of values.

Secondly, the objects in WeakSet are all weak references, that is, the garbage collection mechanism does not consider the reference of WeakSet to the object. In other words, if other objects no longer reference the object, the garbage collection mechanism will automatically reclaim the memory occupied by the object, regardless of whether the object still exists in the WeakSet.

Because of this characteristic, WeakSet members are not suitable for reference, as they can disappear at any time. Furthermore, the number of members in a WeakSet depends on whether garbage collection has run. The number of members before and after garbage collection is likely to be different, and the timing of garbage collection is unpredictable. Therefore, ES6 stipulates that WeakSets cannot be iterated over.

#### grammar

WeakSet is a constructor that can use the new command to create a WeakSet data structure.

    const a = [[1, 2], [3, 4]];
    const ws = new WeakSet(a);
    // WeakSet {[1, 2], [3, 4]}

As a constructor, WeakSet can accept an array or array-like object as a parameter. (In fact, any object with the Iterable interface can be used as a parameter of WeakSet.) All members of the array will automatically become members of the WeakSet instance object.

The WeakSet structure has the following three methods.

WeakSet.prototype.add(value): adds a new member to the WeakSet instance.

WeakSet.prototype.delete(value): Clears the specified member of the WeakSet instance.

WeakSet.prototype.has(value): Returns a Boolean value indicating whether a value is in the WeakSet instance.

WeakSets cannot be iterated over because their members are weak references and can disappear at any time. The traversal mechanism cannot guarantee the existence of the members, and it is possible that the member will be unavailable just after the traversal is completed. One use of WeakSets is to store DOM nodes without worrying about memory leaks when these nodes are removed from the document.

Map

#### Meaning and basic usage

Map data structure. Similar to an object, it is also a collection of key-value pairs, but the scope of "key" is not limited to strings. Values of various types (including objects) can be used as keys.

In other words, the Object structure provides a "string-value" mapping, while the Map structure provides a "value-value" mapping, making it a more complete implementation of the Hash structure. If you need a "key-value pair" data structure, a Map is more suitable than an Object.

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

The Map constructor accepts an array as a parameter and actually executes the following algorithm.
const items = [
['name', '张三'],
['title', 'Author']
];

const map = new Map();

items.forEach(
([key, value]) => map.set(key, value)
);

Not only arrays, but any data structure with an Iterator interface and a two-element array as a member can be used as a parameter to the Map constructor. This means that both Sets and Maps can be used to generate new Maps.

    const set = new Set([
      ['foo', 1],
      ['bar', 2]
    ]);
    const m1 = new Map(set);
    m1.get('foo') // 1
    
    const m2 = new Map([['baz', 3]]);
    const m3 = new Map(m2);
    m3.get('baz') // 3

If you assign a value to the same key multiple times, the later values will overwrite the earlier ones. If you read an unknown key, undefined is returned. The Map structure only considers references to the same object as the same key.

Map keys are actually bound to memory addresses; if the memory addresses are different, they are considered two keys. This solves the problem of property clashes with the same name. When extending someone else's library, if we use objects as keys, we don't have to worry about our properties having the same name as the original author's.

#### Instance properties and operation methods

##### The size property returns the total number of members in the Map structure.

    const map = new Map();
    map.set('foo', true);

##### The set method sets the key value corresponding to the key to value and then returns the entire Map structure. If the key already has a value, the key value will be updated, otherwise a new key will be generated.

const m = new Map();

m.set('edition', 6)

let map = new Map() // Returns the entire Map deconstruction, so chaining is possible.
.set(1, 'a')
.set(2, 'b')

##### get(key) The get method retrieves the value corresponding to a key. If the key is not found, it returns undefined.

const m = new Map();

const hello = function() {console.log('hello');};
m.set(hello, 'Hello ES6!') // Key is a function

m.get(hello) // Hello ES6!

##### has(key) The has method returns a Boolean value indicating whether a key is in the current Map object.

const m = new Map();

m.set('edition', 6);

##### delete(key) The delete method deletes a key and returns true. If the deletion fails, it returns false.

    const m = new Map();
    m.set(undefined, 'nah');
    m.has(undefined) // true

##### The clear() method clears all members and has no return value.

#### Traversal Methods
The Map structure natively provides three traversal generator functions and one traversal method.

keys(): Returns an iterator of key names.

values(): Returns a iterator of key values.

entries(): Returns an iterator over all entries.

forEach(): Iterates over all members of a Map.

It is important to note that the traversal order of the Map is the insertion order.

Similar to the set method

#### Conversion between other data structures

##### Converting a Map to an Array
const myMap = new Map()
.set(true, 7)
.set({foo: 3}, ['abc']);
[...myMap]
// [ [ true, 7 ], [ { foo: 3 }, [ 'abc' ] ] ]

##### Converting an Array to a Map
new Map([
[true, 7],
[{foo: 3}, ['abc']]
])
// Map {
// true => 7,
// Object {foo: 3} => ['abc']
// }

##### Converting a Map to an Object
If all Map keys are strings, it can be converted to an object without loss.

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
If there is a non-string key, it will be converted to a string and used as the object key.

##### Convert object to Map

    function objToStrMap(obj) {
      let strMap = new Map();
      for (let k of Object.keys(obj)) {
        strMap.set(k, obj[k]);
      }
      return strMap;
    }
    
    objToStrMap({yes: true, no: false})
    // Map {"yes" => true, "no" => false}

##### Converting Maps to JSON
Converting a Map to JSON requires distinguishing between two situations. In one case, if the Map's keys are all strings, you can choose to convert to object JSON.

    function strMapToJson(strMap) {
      return JSON.stringify(strMapToObj(strMap));
    }
    
    let myMap = new Map().set('yes', true).set('no', false);
    strMapToJson(myMap)
    // '{"yes":true,"no":false}'

Another case is when a Map's keys contain non-strings. In this case, you can choose to convert it to a JSON array.

function mapToArrayJson(map) {
return JSON.stringify([...map]);
}

let myMap = new Map().set(true, 7).set({foo: 3}, ['abc']);
mapToArrayJson(myMap)
// '[[true,7],[{"foo":3},["abc"]]]'

##### JSON to Map
When converting JSON to Map, normally all keys are strings.

    function jsonToStrMap(jsonStr) {
      return objToStrMap(JSON.parse(jsonStr));
    }
    
    jsonToStrMap('{"yes": true, "no": false}')
    // Map {'yes' => true, 'no' => false}

However, there's a special case where the entire JSON is an array, and each array member is itself an array with two members. In this case, it can be converted to a Map one-to-one. This is often the inverse operation of converting a Map to an array JSON.

    function jsonToMap(jsonStr) {
      return new Map(JSON.parse(jsonStr));
    }
    
    jsonToMap('[[true,7],[{"foo":3},["abc"]]]')
    // Map {true => 7, Object {foo: 3} => ['abc']}

WeakMap

The WeakMap structure is similar to the Map structure and is also used to generate a collection of key-value pairs.

There are two differences between WeakMap and Map.

First, WeakMap only accepts objects as keys (except null) and does not accept values of other types as keys.

Secondly, the objects pointed to by the WeakMap keys are not included in the garbage collection mechanism.

The purpose of WeakMap design is that sometimes we want to store some data on an object, but this will form a reference to this object.

    const e1 = document.getElementById('foo');
    const e2 = document.getElementById('bar');
    const arr = [
      [e1, 'foo element'],
      [e2, 'bar element'],
    ];

In the above code, e1 and e2 are two objects. We add some text descriptions to these two objects through the arr array. This forms arr's references to e1 and e2.

Once these two objects are no longer needed, we must manually delete the reference, otherwise the garbage collection mechanism will not release the memory occupied by e1 and e2.

arr[0] = null;
arr[1] = null;

WeakMap was created to address this problem. The objects referenced by its keys are weak references, meaning they are not considered by the garbage collector. Therefore, as soon as all other references to the referenced object are cleared, the garbage collector will free the memory occupied by the object. In other words, once no longer needed, the key object and the corresponding key-value pair in the WeakMap automatically disappear, eliminating the need for manual reference deletion.

Basically, if you want to add data to an object without interfering with garbage collection, you can use a WeakMap. A typical application scenario is adding data to a DOM element in a web page. When the DOM element is cleared, the corresponding WeakMap entry is automatically removed.

const wm = new WeakMap();

const element = document.getElementById('example');

wm.set(element, 'some information');
wm.get(element) // "some information"

Note that WeakMap weakly references only the key name, not the value. The key and value are still referenced normally.

    const wm = new WeakMap();
    let key = {};
    let obj = {foo: 1};
    
    wm.set(key, obj);
    obj = null;
    wm.get(key)
    // Object {foo: 1}

#### WeakMap syntax
