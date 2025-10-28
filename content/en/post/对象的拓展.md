---
draft: false
original: content/zh/post/legacy/对象的拓展.md
title: Object Expansion
date: 2018-04-24
description: '"ES6 Standard Introduction" Knowledge Points Summary'
categories:
- JavaScript
tags:
- JavaScript
- JavaScript
summary: ''
---

### Object Extensions
#### Concise Notation for Object Properties

    //A few examples
    function f(x,y){
        return {x,y}
    }
    f(1,2)//Objext {x:1,y:2}
    
    module.exports = { getItem, setItem, clear };
    
    const cart = {
    _wheels: 4,
    get wheels() {
        return this._wheels;
    },

set wheels(value) {
if (value < this._wheels) {
throw new Error('The value is too small!');
}
this._wheels = value;
}
}
cart.wheels //4
set.wheels = 1 //Error 'The value is too small!'

#### Attribute Name Expression

// Method 1
obj.foo = true;

// Method 2
obj['a' + 'bc'] = 123;

Note that if the property name expression is an object, the object will be automatically converted to the string [object Object] by default. Be especially careful with this.
const keyA = {a: 1};
const keyB = {b: 2};

const myObject = {
[keyA]: 'valueA',
[keyB]: 'valueB'
};

myObject // Object { [object Object]: "valueB"}

In the above code, both [keyA] and [keyB] return [object Object], so [keyB] will overwrite [keyA], and myObject will end up with only one [object Object] property.

#### Method name property
The function's name property returns the function's name. Object methods are also functions and therefore have a name property.

const person = {
sayName() {
console.log('hello!');
}
};
person.sayName.name // "sayName"

If an object method uses accessors and setters, the name property is not located on the method itself, but on the get/set property of the object that describes the method.

const obj = {
get foo(){},
set foo(x){}
}
const descriptor = Object.getOwnPropertyDescriptor(obj,"foo");
//The getOwnPropertyDescriptor method returns the property descriptor for an owned property on the specified object.
descriptor.get.name // "get foo"
descriptor.set.name // "set foo"

If the object's method is a Symbol value, the name property returns the description of the Symbol value.

const key1 = Symbol('description');
const key2 = Symbol();
let obj = {
[key1]() {},
[key2]() {},
};
obj[key1].name // "[description]"
obj[key2].name // ""

#### Object.is()
ES5 uses the == and === operators to compare two values for equality, but both have drawbacks.

The first one automatically converts the data type, and the following NaN is not equal to itself. And +0 is equal to -0. JavaScript lacks an operation that should ensure that two values are equal in all environments as long as they are the same.

ES6 introduces the "same-value equality" algorithm to address this issue. Object.is is a new method that implements this algorithm. It compares two values for strict equality, differing from === only in that +0 is not equal to -0 and NaN is equal to itself.

ES5 can deploy Object.is through the following code.

Object.defineProperty(Object, 'is', {
value: function(x, y) {
if (x === y) {
// For the case where +0 is not equal to -0
return x !== 0 || 1 / x === 1 / y;
}
// For the case where NaN is present
return x !== x && y !== y;
},
configurable: true,
enumerable: false,
writable: true
});

#### Object.assign()

The Object.assign() method is used to merge objects and copy all enumerable properties of the source object to the target object.

The first parameter is the target object, and the following parameters are source objects.

const target = {a:1};
const source1 = {b:2};
const source2 = {c:3};
Object.assign(target,source1,source2)

Object.assign copies properties with restrictions. It only copies the source object's own properties, not inherited properties or non-enumerable properties.

    Object.assign({b: 'c'},
      Object.defineProperty({}, 'invisible', {
        enumerable: false,
        value: 'hello'
      })
    )
    // { b: 'c' }

Properties whose property names are Symbol values will also be copied by Object.assign.

    Object.assign({ a: 'b' }, { [Symbol('c')]: 'd' })
    // { a: 'b', Symbol(c): 'd' }

The Object.assign method performs a shallow copy, not a deep copy. That is, if the value of a property of the source object is an object, the target object will get a reference to that object.

    const obj1 = {a: {b: 1}};
    const obj2 = Object.assign({}, obj1);
    
    obj1.a.b = 2;
    obj2.a.b // 2

The source object obj1's a attribute is the object, and the target object copies the object's reference. Any changes to the object will be reflected in the target object.

For nested objects, once a property with the same name is encountered, Object.assign is handled by replacing

const target = { a: { b: 'c', d: 'e' } }
const source = { a: { b: 'hello' } }
Object.assign(target, source)
// { a: { b: 'hello' } }
This means that the object is copied up to one level.

Common uses of Object.assign

##### Adding methods to objects

    Object.assign(SomeClass.prototype,{
        someMethod(arg1,arg2){
            //...
        }
    })
    SomeClass.prototype.someMethod = function (arg1, arg2) {
      //···
    };

##### Cloning an object

function clone(origin) {
let originProto = Object.getPrototypeOf(origin);
return Object.assign(Object.create(originProto), origin);
} // Maintain the inheritance chain

##### Merging multiple objects

    const merge =
    (target, ...sources) => Object.assign(target, ...sources);
    //or
    const merge =
    (...sources) => Object.assign({}, ...sources);

##### Assigning default values to properties

const DEFAULTS = {
logLevel: 0,
outputFormat: 'html'
};

function processContent(options) {
options = Object.assign({}, DEFAULTS, options);
console.log(options);
// ...
}
The DEFAULTS object represents the default values, while options represents user-provided parameters. processContent merges DEFAULTS and options into a new object. If both objects have properties with the same name, the options value overrides the DEFAULTS property value. Of course, the properties must be simple data types, otherwise the property replacement described above may occur.

#### Property Enumerability and Property Traversal
Each object property has a descriptor that controls its behavior. The object.getOwnPropertyDescriptor method retrieves the object that describes the property.

##### Enumeration

The original purpose of introducing the concept of "enumerable" is to allow certain properties to circumvent the for...in operation.

let obj = {foo:123};
Object.getOwnPropertyDescriptor(obj,foo);
//{value: 123, writable: true, enumerable: true, configurable: true}

The enumerable property becomes enumerable. Setting it to false means that certain operations will ignore this property. There are currently four types.

The for..in loop only iterates over the object itself and inherited enumerable properties.

Object.keys() only traverses its own enumerable property key names

JSON.stringify() only serializes enumerable properties of its own

Object.assign() copies the object's own enumerable properties. Inherited and non-enumerable properties are ignored.

In addition, ES6 stipulates that all methods of Class prototypes are non-enumerable.

In general, introducing inherited properties into operations can complicate things. Most of the time, we only care about the properties of the object itself. Therefore, try not to use for...in loops, and use Object.keys() instead.

##### Traversal
ES6 has five methods for iterating over object properties.

###### for...in

for...in loop iterates over an object's own and inherited enumerable properties (excluding Symbol properties).

###### Object.keys(obj)

Object.keys returns an array containing the key names of all enumerable properties (excluding Symbol properties) of the object itself (excluding inherited ones).

###### Object.getOwnPropertyNames(obj)
Object.getOwnPropertyNames returns an array containing the key names of all the object's own properties (excluding Symbol properties, but including non-enumerable properties).

###### Object.getOwnPropertySymbols(obj)

Object.getOwnPropertySymbols returns an array containing the key names of all Symbol properties of the object itself.

###### Reflect.ownKeys(obj)

Reflect.ownKeys returns an array containing all the key names of the object itself, regardless of whether the key name is a Symbol or a string, or whether it is enumerable.

The above five methods of traversing the key names of an object all follow the same order rules for attribute traversal.

First, iterate over all numeric keys and sort them in ascending order.

Next, iterate over all string keys and sort them in ascending order of join time.

Finally, iterate over all Symbol keys and sort them in ascending order of joining time.

Reflect.ownKeys({ [Symbol()]:0, b:0, 10:0, 2:0, a:0 })
// ['2', '10', 'b', 'a', Symbol()]
In the code above, the Reflect.ownKeys method returns an array containing all the properties of the argument object. The properties in this array are ordered as follows: the numeric properties 2 and 10 appear first, followed by the string properties b and a, and finally the Symbol properties.

#### Object.getOwnPropetryDescriptions()

Object.getOwnPropertyDescriptors returns a description object of all the own properties of the specified object

The purpose of this method is to solve the problem that Object.assign() cannot correctly copy get attributes and set attributes.

#### __proto__ attribute, Object.setPrototypeOf(), Object.getPrototypeOf()

##### __proto__

_proto__ is used to read or set the [[prototype]] object of the current object.

    //es6
    const obj = {
        method:function(){...}
    };
    obj.__proto__ = someOtherObj;
    
    //es5
    var obj = Object.create(someOtherObj);
    obj.method = function() { ... };

Only browsers must implement this property. Other environments do not necessarily need to deploy it.

let shape = function () {};
var p = {
a: function () {
console.log('a');
}
};

let circle = new shape();
circle.__proto__ = p; // Prototype object changed
circle.a(); // a
console.log(shape.prototype === circle.__proto__); // false

It is better to use Object.create(), Object.setPrototypeOf(), Object.getPrototypeOf() instead

##### Object.setPrototypeOf()

Used to set the prototype object of an object and return the parameter object itself. It is the method of setting the prototype object officially recommended by ES6

//es6
const o = Object.setPrototypeOf({}, null);
//es5
function (obj, proto) {
obj.__proto__ = proto;
return obj;
}

For example

let proto = {};
let obj = { x: 10 };
Object.setPrototypeOf(obj, proto);

proto.y = 20;
proto.z = 40;

obj.x // 10
obj.y // 20
obj.z // 40
// The above code sets the proto object as the prototype of the obj object, so the obj object can read the proto object's properties.

##### Object.getPrototypeOf()

This method works in conjunction with the Object.setPrototypeOf method to read an object's prototype.
For example

function Rectangle() {
// ...

const rec = new Rectangle();

Object.getPrototypeOf(rec) === Rectangle.prototype
// true

Object.setPrototypeOf(rec, Object.prototype);
Object.getPrototypeOf(rec) === Rectangle.prototype
// false

#### super keyword

The this keyword always points to the current object where the function is located. ES6 adds super to point to the current prototype object

    const proto = {
      foo: 'hello'
    };
    
    const obj = {
      foo: 'world',
      find() {
        return super.foo;
      }
    };
    
    Object.setPrototypeOf(obj, proto);
    obj.find() // "hello"

When the super keyword represents a prototype object, it can only be used in the method of an object.

const obj = {
foo: super.foo
}

// Error. Super is used inside a function, assigning a value to the foo property.
const obj = {
foo: () => super.foo
}

// Error.
const obj = {
foo: function () {
return super.foo
}

Internally in the JavaScript engine, super.foo is equivalent to Object.getPrototypeOf(this).foo (property) or Object.getPrototypeOf(this).foo.call(this) (method).

#### Object.keys(), Object.values(), Object.entries()

Similar to the previous array expansion

    let {keys, values, entries} = Object;
    let obj = { a: 1, b: 2, c: 3 };
    
    for (let key of keys(obj)) {
      console.log(key); // 'a', 'b', 'c'
    }
    
    for (let value of values(obj)) {
      console.log(value); // 1, 2, 3
    }
    
    for (let [key, value] of entries(obj)) {
      console.log([key, value]); // ['a', 1], ['b', 2], ['c', 3]
    }
