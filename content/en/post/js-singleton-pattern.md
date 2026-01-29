---
draft: false
original: content/zh/post/legacy/单例模式.md
title: Js singleton pattern
description: Javascript Design Patterns Knowledge Points
categories:
- JavaScript
tags:
- JavaScript
- Design Patterns
date: 2018-04-13 20:06:30
summary: ''
---

### Singleton Pattern
#### Simple Singleton Pattern Implementation
A variable is needed to indicate whether an instance of the object has been created.

	var Single = function(name){
		this.name = name;
		this.instance = null;
	}
	Single.getInstance = function(name){
	if(!this.instance){
		this.instace = new Single(name)
		}
	return this.instance
	}

	var a = Single.getInstance("a");
	var b = Single.getInstance("b");
	a===b //true

Disadvantages: Opaque, compared to the normal new creation instance, the getInstance method must be used to create a singleton.

#### Transparent Singleton Pattern
The goal is to implement a transparent singleton class. Below we will use the CreateDiv singleton class to create a unique div node on the page.

var CreateDiv = (function(){
var instance = null; //Self-executing function ensures instance is initialized only once
function CreateDiv(html){
if(instance){
return instance
}
this.html = html;
//this.init();
return instance = this;
}
CreateDiv.prototype.init = function(){
var div = document.createElement("div");
div.innerHTML = this.html;
document.body.append(div);
}

return CreateDiv
})()
var a = new CreateDiv("a");
var b = new CreateDiv("b");
a===b//true

To encapsulate the instance, a self-executing anonymous function and closure are used, which increases the complexity. CreateDiv is responsible for two things: first, creating the object and executing the init method; second, ensuring that there is only one object. This violates the single responsibility principle.

#### Implementing Singleton Pattern with Proxy

To solve the single responsibility problem mentioned above, we introduce the proxy pattern to implement this singleton pattern. First, we separate object creation from executing the init method.

function CreateDiv(html){
this.html = html;
this.init();
}
CreateDiv.prototype.init = function(html){
var div = document.createElement("div");
div.innerHTML = this.html;
document.body.append(div);
}
Next, introduce the proxy class

    var createDivProx = (function(){
        var instance;
        return function(html){
            if(!instance){
                instance = new CreateDiv(html)
            }
            return instance
        }
        
    })()
    var a = new createDivProx("a")
    var b= new createDivProx("b")
    a==b//true

#### Js singleton mode - private variables encapsulated using closures

Since we need an object, there is no need to create a class first.

To avoid the abuse of global variables, you can encapsulate the variables inside the closure and only expose the interface and external communication

var user = (function(){
var _name = "yosgi"
var _age = 29;
return {
getUserInfo(){
return _name + "-" + _age
}
}
})()

Or use ES6 Symbols

var _name = Symbol.for('name');
var _age = Symbol.for('age');
window[_name] = "yosgi"
window[_age] = 29 // _name and _user won't be accidentally overwritten

#### Creating a Lazy Singleton
A lazy singleton is one where an instance is created only when needed.

The next requirement is to create a div box (which may also be an iframe box in the future) when the login button is clicked.

	 var createLoginLayer = (function () {
	        vardiv;
	        return function () {
	            if (!div) {
	                div = document.createElement("div");
	                div.style.display = "none";
	                document.body.appendChild(div);
	            }
	            return div
	        }
	    })()
	    document.getElementById("login").onclick = function () {
	        var LoginLayer = createLoginLayer()
	        LoginLayer.style.display = 'block';
	    };

To solve the single responsibility problem, extract the code that maintains a single instance

//getSingle is used to manage singletons
var getSingle = (function(){
var result;
return function(fn){
if(!result){
//The closure allows result to store the result of fn
result = fn.apply(this, arguments)
}
return result
}
})()

	//createSingleIframe is used to create instances
    var createSingleIframe = function(){
        iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);
        return iframe
    }

    document.getElementById("login").onclick = function(){
        var Iframe = getSingle(createSingleIframe)
        Iframe.style.display = 'block';
        Iframe.src="http://baidu.com"
    };

#### Applying the Singleton Pattern
After rendering a list on the page, bind the addEventListener click event. If you're dynamically adding data via Ajax, you only need to bind it once, on the first render. If you don't want to determine the number of renders, you can use getSingle

    var getSingle = (function(){
    var result;
    return function(fn){
        if(!result){
            result = fn.apply(this, arguments)
        }
        return result
        }
    })()

         
    var bindEvent = function(){
    
            document.getElementById("div1").addEventListener("click",()=>{
                console.log("click")
            })
            return true
    }
    var render = function() {
        getSingle(bindEvent)
    }
    render()
    render()
    render()

You can notice that clicking div1 multiple times will only trigger a click event once (of course you can also use onclick, a click can only point to a single object at the same time, which I didn't notice before)
