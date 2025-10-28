---
draft: false
original: content/zh/post/legacy/Reflect.md
title: Reflect
description: '"ES6 Standard Introduction" Knowledge Points Summary'
categories:
- JavaScript
tags:
- JavaScript
- JavaScript
date: 2018-05-24 18:39:00
summary: ''
---

Reflect

#### Overview
The Reflect object, like the Proxy object, is a new ES6 API for manipulating objects. The Reflect object's design goals are:
1. To move some explicitly language-internal methods of the Object object (such as Object.defineProperty ) to the Reflect object. Currently, some methods are implemented on both the Object and Reflect objects; future new methods will be implemented only on the Reflect object. This means that language-internal methods can be accessed from the Reflect object.

2. To modify the return values of some Object methods to make them more reasonable. For example, Object.defineProperty(obj, name, desc) will throw an error if a property cannot be defined, while Reflect.defineProperty(obj, name, desc) will return false .

    //Old way of writing
        try {
          Object.defineProperty(target, property, attributes);
          //success
        } catch (e) {
          // failure
        }
        
        //New writing method
        if (Reflect.defineProperty(target, property, attributes)) {
          //success
        } else {
          // failure
    }
        

3. Make all Object operations into functional behaviors. Some Object operations are imperative, such as name in obj and delete obj[name], and Reflect.has(obj, name) and Reflect.deleteProperty(obj, name) make them into functional behaviors.

// Old syntax
'assign' in Object // true

// New syntax
Reflect.has(Object, 'assign') // true

(4) The methods of the Reflect object correspond one-to-one with the methods of the Proxy object. For any method on the Proxy object, you can find the corresponding method on the Reflect object. This allows the Proxy object to easily call the corresponding Reflect method to implement the default behavior, which serves as the basis for modifying the behavior. In other words, no matter how the Proxy object modifies the default behavior, you can always obtain the default behavior on Reflect.

var loggedObj = new Proxy(obj, {
get(target, name) {
console.log('get', target, name);
return Reflect.get(target, name);
},
deleteProperty(target, name) {
console.log('delete' + name);
return Reflect.deleteProperty(target, name);
},
has(target, name) {
console.log('has' + name);
return Reflect.has(target, name);
}
});
In the above code, each interception operation (get, delete, has) on the Proxy object internally calls the corresponding Reflect method to ensure that the native behavior is executed normally. The added work is to output a line of log for each operation.

#### Static Methods
- The Reflect object has a total of 13 static methods.

- Reflect.apply(target, thisArg, args)
- Reflect.construct(target, args)
- Reflect.get(target, name, receiver)
- Reflect.set(target, name, value, receiver)
- Reflect.defineProperty(target, name, desc)
- Reflect.deleteProperty(target, name)
- Reflect.has(target, name)
- Reflect.ownKeys(target)
- Reflect.isExtensible(target)
- Reflect.preventExtensions(target)
- Reflect.getOwnPropertyDescriptor(target, name)
- Reflect.getPrototypeOf(target)
- Reflect.setPrototypeOf(target, prototype)

Most of the functions of the above methods are the same as those of the Object object's methods of the same name, and they are similar to the methods of the Proxy object.

[Es6 Introduction Ruan Yifeng](http://es6.ruanyifeng.com/#docs/reflect)
