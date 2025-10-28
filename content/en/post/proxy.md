---
draft: false
original: content/zh/post/legacy/proxy.md
title: proxy
description: '"ES6 Standard Introduction" Knowledge Points Summary'
categories:
- JavaScript
tags:
- JavaScript
- JavaScript
date: 2018-05-18 09:59:26
summary: ''
---

### Overview

Proxy is used to modify the default behavior of certain operations, which is equivalent to making changes at the language level, so it is a kind of "meta programming", that is, programming the programming language.

Proxy can be understood as a layer of "interception" set up before the target object. All external access to the object must first pass through this interception layer, thus providing a mechanism to filter and rewrite external access. The word "proxy" originally means "agent", and here it is used to indicate that it "proxy" certain operations, which can be translated as "proxy".

var proxy = new Proxy(target, handler);

All usages of the Proxy object follow the same format as above, differing only in the way the handler parameter is written. Here, new Proxy() creates a Proxy instance, the target parameter represents the target object to be intercepted, and the handler parameter is also an object used to customize the interception behavior.

For example

var proxy = new Proxy({}, {
get: function(target, property) {
return 35;
}
});

proxy.time // 35
proxy.name // 35
proxy.title // 35

Proxy instances can also serve as prototypes for other objects.

var proxy = new Proxy({}, {
get: function(target, property) {
return 35;
}
});

let obj = Object.create(proxy);
obj.time // 35

In the above code, the proxy object is the prototype of the obj object. The obj object itself does not have a time property. Therefore, according to the prototype chain, the property is read from the proxy object, resulting in interception.

The same interceptor function can be set to intercept multiple operations.

    var handler = {
      get: function(target, name) {
        if (name === 'prototype') {
          return Object.prototype;
        }
        return 'Hello, ' + name;
      },
    
      apply: function(target, thisBinding, args) {
        return args[0];
      },
    
      construct: function(target, args) {
        return {value: args[1]};
      }
    };
    
    var fproxy = new Proxy(function(x, y) {
      return x + y;
    }, handler);
    
    fproxy(1, 2) // 1
    new fproxy(1, 2) // {value: 2}
    fproxy.prototype === Object.prototype // true
    fproxy.foo === "Hello, foo" // true


### Below is a list of interception operations supported by Proxy

There are 13 types in total.

get(target, propKey, receiver) : intercepts the reading of object properties, such as proxy.foo and proxy['foo'].

set(target, propKey, value, receiver) : intercepts the setting of object properties, such as proxy.foo = v or proxy['foo'] = v, and returns a Boolean value.

has(target, propKey): Intercepts the propKey in proxy operation and returns a Boolean value.
deleteProperty(target, propKey): Intercepts the delete proxy[propKey] operation and returns a Boolean value.

ownKeys(target): Intercepts Object.getOwnPropertyNames(proxy), Object.getOwnPropertySymbols(proxy), Object.keys(proxy), and the for...in loop, returning an array. This method returns the property names of all the target object's own properties, while Object.keys() only returns the target object's own traversable properties.

getOwnPropertyDescriptor(target, propKey): intercepts Object.getOwnPropertyDescriptor(proxy, propKey) and returns the property description object.

defineProperty(target, propKey, propDesc): Intercepts Object.defineProperty(proxy, propKey, propDesc) and Object.defineProperties(proxy, propDescs), returning a Boolean value.
preventExtensions(target): Intercepts Object.preventExtensions(proxy), returning a Boolean value.

getPrototypeOf(target): intercepts Object.getPrototypeOf(proxy) and returns an object.

isExtensible(target): intercepts Object.isExtensible(proxy) and returns a Boolean value.

setPrototypeOf(target, proto): Intercepts Object.setPrototypeOf(proxy, proto) and returns a Boolean value. If the target object is a function, two additional operations can be intercepted.

apply(target, object, args): intercepts the Proxy instance as a function call operation, such as proxy(...args), proxy.call(object, ...args), proxy.apply(...).

construct(target, args): intercepts operations where the Proxy instance is called as a constructor, such as new proxy(...args).

[See Ruan Yifeng's ES6 Primer](http://es6.ruanyifeng.com/#docs/proxy/)

### Usage Scenarios
Proxy is similar to the proxy pattern in design patterns and is commonly used in the following areas:

- Intercept and monitor external access to objects
- Reduce the complexity of functions or classes
- Verify complex operations or manage required resources before performing them

#### Extract the verification module

Assume that the Person object has an age attribute, which should be an integer not greater than 200. Then you can use Proxy to ensure that the age attribute value meets the requirements.

let validator = {
set: function(obj, prop, value) {
if (prop === 'age') {
if (!Number.isInteger(value)) {
throw new TypeError('The age is not an integer');
}
if (value > 200) {
throw new RangeError('The age seems invalid');
}
}

// For the age property and other properties that meet the conditions, save them directly
obj[prop] = value;
}
};

let person = new Proxy({}, validator);

person.age = 100;

person.age // 100
person.age = 'young' // Report an error
person.age = 300 // Report an error

If you were to develop a validator for all properties of an object directly, the code structure might quickly become bloated. Using Proxy, you can separate the validator from the core logic and make it independent:

    function createValidator(target, validator) {
        return new Proxy(target, {
            _validator: validator,
            set(target, key, value, proxy) {
                if (target.hasOwnProperty(key)) {
                    let validator = this._validator[key];
                    if (validator(value)) {
                        return Reflect.set(target, key, value, proxy);
                    } else {
                        throw Error(`Cannot set ${key} to ${value}. Invalid.`);
                    }
                } else {
                    throw Error(`${key} is not a valid property`)
                }
            }
        })
    }

    const personValidators = {
        name(val) {
            return typeof val === 'string';
        },
        age(val) {
            return typeof age === 'number' && age > 18;
        }
    }
    class Person {
        constructor(name, age) {
            this.name = name;
            this.age = age;
            return createValidator(this, personValidators);
        }
    }
    
    const bill = new Person('Bill', 25);
    
    //The following operations will report an error
    bill.name = 0; //Cannot set name to 0. Invalid.
    bill.age = 'Bill'; //Cannot set age to Bill. Invalid.
    
    
#### Private properties

Sometimes, we set internal properties on objects. The first character of the property name starts with an underscore, indicating that these properties should not be used externally. Combining get and set methods can prevent these internal properties from being read or written externally.

     const handler = {
      get (target, key) {
        invariant(key, 'get');
        return target[key];
      },
      set (target, key, value) {
        invariant(key, 'set');
        target[key] = value;
        return true;
      }
    };
    function invariant (key, action) {
      if (key[0] === '_') {
        throw new Error(`Invalid attempt to ${action} private "${key}" property`);
      }
    }
    const target = {};
    const proxy = new Proxy(target, handler);
    proxy._prop
    // Error: Invalid attempt to get private "_prop" property
    proxy._prop = 'c'
    // Error: Invalid attempt to set private "_prop" property
    
The second method is to use has to intercept the in operation

var handler = {
has (target, key) {
if (key[0] === '_') {
return false;
}
return key in target;
}
};
var target = { _prop: 'foo', prop: 'foo' };
var proxy = new Proxy(target, handler);
'_prop' in proxy // false

It is worth noting that the has method intercepts the HasProperty operation, not the HasOwnProperty operation. That is, the has method does not determine whether a property is an object's own property or an inherited property.

In addition, although the for...in loop also uses the in operator, the has interception does not take effect on the for...in loop.

#### Access Logs
For properties or interfaces that are frequently called, run slowly, or consume a lot of resources, developers may wish to record their usage or performance. This can be achieved by using a proxy to act as an intermediary, thus implementing logging functionality.

    let api = {
        _apiKey: '123abc456def',
        getUsers: function() { /* ... */ },
        getUser: function(userId) { /* ... */ },
        setUser: function(userId, config) { /* ... */ }
    };
    
    function logMethodAsync(timestamp, method) {
        setTimeout(function() {
            console.log(`${timestamp} - Logging ${method} request asynchronously.`);
        }, 0)
    }
    
    api = new Proxy(api, {
        get: function(target, key, proxy) {
            var value = target[key];
            return function(...arguments) {
                logMethodAsync(new Date(), key);
                return Reflect.apply(value, target, arguments);
            };
        }
    });
    
    api.getUsers();//Fri May 18 2018 09:36:09 GMT+0800 (China Standard Time) - Logging getUsers request asynchronously.

### Proxy.revocable()
The Proxy.revocable method returns a revocable Proxy instance.

let target = {};

let handler = {};

let {proxy, revoke} = Proxy.revocable(target, handler);

proxy.foo = 123;
proxy.foo // 123

revoke();
proxy.foo // TypeError: Revoked

The Proxy.revocable method returns an object whose proxy property is a Proxy instance and whose revoke property is a function that revokes the Proxy instance. In the code above, accessing the Proxy instance after executing the revoke function will throw an error.

One use case for Proxy.revocable is that the target object cannot be accessed directly and must be accessed through a proxy. Once the access is completed, the proxy right is revoked and no further access is allowed.

###this problem

Although Proxy can proxy access to the target object, it is not a transparent proxy for the target object. That is, without any interception, it cannot guarantee the same behavior as the target object. The main reason is that in the case of Proxy proxy, the this keyword inside the target object will point to the Proxy proxy.

const target = {
m: function () {
console.log(this === proxy);
}
};
const handler = {};

const proxy = new Proxy(target, handler);

target.m() // false
proxy.m() // true
In the above code, once proxy proxies target.m, the `this` inside the proxy will point to `proxy`, not `target`.
The following example shows how this change causes Proxy to fail to proxy the target object.

const _name = new WeakMap();

class Person {
constructor(name) {
_name.set(this, name);
}
get name() {
return _name.get(this);
}
}

const jane = new Person('Jane');
jane.name // 'Jane'

const proxy = new Proxy(jane, {});
proxy.name // undefined
In the above code, the name property of the target object jane is actually stored in the external WeakMap object _name, identified by the this key. When accessed through proxy.name, this points to the proxy, resulting in a value that cannot be retrieved, and thus undefined is returned.

In addition, some internal properties of native objects can only be obtained through the correct this, so Proxy cannot proxy the properties of these native objects.

const target = new Date();
const handler = {};
const proxy = new Proxy(target, handler);

proxy.getDate();
// TypeError: this is not a Date object.
In the above code, the getDate method can only be used on Date object instances. If this is not a Date object instance, an error will be thrown. Binding this to the original object can solve this problem.

    const target = new Date('2015-01-01');
    const handler = {
      get(target, prop) {
        if (prop === 'getDate') {
          return target.getDate.bind(target);
        }
        return Reflect.get(target, prop);
      }
    };
    const proxy = new Proxy(target, handler);
