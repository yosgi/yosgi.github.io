---
draft: false
original: content/zh/post/legacy/vue易错易混知识点整理.md
title: Summary of Vue's easy-to-error and easy-to-confuse knowledge points
description: <ES6 Standard Introduction> Knowledge Points Summary
categories:
- Vue
tags:
- JavaScript
- Vue
date: 2018-09-10 18:30:10
summary: ''
---

#### What is MVVM? How does it differ from MVC?
MVC stands for Model-View-Controller. It organizes code by separating business logic, data, and user interface. Communication is one-way: the view sends instructions to the controller. After completing the business logic, the controller instructs the model to change its state. The model then sends the new data to the view, and the user receives feedback.

MVVM stands for Model-View-ViewModel. Like the MVC pattern, its primary purpose is to separate the view and model. However, the MVVM controller doesn't listen to browser events. Instead, it listens to a property table. Browser events modify properties, triggering methods in the controller. This adds a layer of business control, called the VM. When data in the ViewModel changes, the View layer is updated. When a view declares two-way data binding (usually to form elements), the framework also monitors changes in the View layer (form). Once the value changes, the data in the ViewModel bound to the View layer is automatically updated.

New Vue is the viewmodel

#### How to chain filters and pass parameters?

Series

{{ message | filterA | filterB }}

Accepts parameters

{{ message | filterA('arg1', arg2) }}

Here, filterA is defined as a filter function that accepts three parameters: the value of message as the first parameter, the plain string 'arg1' as the second parameter, and the value of the expression arg2 as the third parameter.

#### What is the difference between computed properties and methods? What is the difference between computed properties and listener properties?

The difference between computed properties and methods is that computed properties are cached based on dependencies and are only evaluated when the relevant dependencies change.

Listeners allow us to perform asynchronous operations (access an API) and set intermediate states (like loading...).

Computed properties have only getters by default, but you can also provide a setter if needed.

#### How does $watch observe instance expressions? How does it observe changes within an object? How does it trigger a callback immediately?

Observe Expression

    vm.$watch(
      function () {
        return this.a + this.b
      },
      function (newVal, oldVal) {
      }
    )

Changes within the object

vm.$watch('someObject', callback, {
deep: true
})
vm.someObject.nestedValue = 123

The callback is triggered immediately.

vm.$watch('a', callback, {
immediate: true
})

#### What is the difference between v-show and v-if?

v-if supports v-else and v-else-if syntax, and also supports <template/> syntax; v-show does not support these;

v-show is achieved by simply switching the CSS attribute display property of the element to achieve the display and hide effect;

v-if is a "true" conditional rendering, because it ensures that event listeners and child components within the conditional block are properly destroyed and recreated during the toggle process;

v-if is also lazy: if the condition is false on initial rendering, nothing is done - the conditional block is not rendered until the condition becomes true for the first time;

In contrast, v-show is much simpler - the element will always be rendered regardless of the initial conditions, and is simply toggled based on CSS;

#### What is the function of key in v-if?

In order to render elements more efficiently, Vue usually reuses elements, and unique key values will prevent elements from being reused but re-rendered.

#### How should the key in v-for be used? Why is the key needed?

When using v-for to update a list of rendered elements, the default in-place reuse strategy is used; when the list data is modified, it will determine whether a value has been modified based on the key value. If modified, it will re-render the item, otherwise reuse the previous element;

Therefore, the key is to use an item in the array that does not change as the key value, that is, each data has a unique and unchanging ID to identify the uniqueness of this data. (Instead of using the index value of the array, because it will change after inserting a new item)

The purpose of key is to update the virtual DOM efficiently. In addition, when using transitions between elements with the same tag name in Vue, the key attribute is also used. Its purpose is to allow Vue to distinguish them. Otherwise, Vue will only replace its internal properties without triggering the transition effect.

#### How to make Vue detect the use of index to directly set an item or modify the length of the array?

// Vue.set
Vue.set(vm.items, indexOfItem, newValue)
// Array.prototype.splice
vm.items.splice(indexOfItem, 1, newValue)

#### Using modifiers to convert user input to numeric values? Automatically filtering leading and trailing whitespace in user input?

<input v-model.number="age" type="number">
<input v-model.trim="msg">

#### Why must data be a function?

Because only in this way can each instance maintain an independent copy of the returned object, otherwise the modification of one instance will affect other instances.

#### How to globally import basic components in batches from a folder?

import Vue from 'vue'
import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'
// See webpack's API for details
const requireComponent = require.context(
// Relative path to the component directory
'./components',
// Whether to search its subdirectories
false,
// Regular expression matching base component file names
/Base[A-Z]\w+\.(vue|js)$/
)

requireComponent.keys().forEach(fileName => {
// Get component configuration
const componentConfig = requireComponent(fileName)

// Get the component's PascalCase name
const componentName = upperFirst(
camelCase(
// Strip the leading `./` and trailing extension from the file name
fileName.replace(/^\.\/(.*)\.\w+$/, '$1')
)
)

// Registering a component globally
Vue.component(
componentName,
// If this component's options are exported via `export default`,
// then `.default` will be used first.
// Otherwise, fallback to the module's root.
componentConfig.default || componentConfig
)
})

#### What is component feature inheritance? How can I customize feature inheritance?

Attributes added to a component instance are automatically added to the component's root element. Conflicting values for class and style attributes are merged, and conflicting values for other attributes are replaced.

If you do not want the root element of a component to inherit attributes, you can set inheritAttrs: false in the component's options, for example

ue.component('my-component', {
inheritAttrs: false,
// ...
})

Used with the instance's $attrs property, you can manually assign attributes to a specific element. For example,

Vue.component('base-input', {
inheritAttrs: false,
props: ['label', 'value'],
template: `
<label>
{{ label }}
<input
v-bind="$attrs"
v-bind:value="value"
v-on:input="$emit('input', $event.target.value)"
>
</label>
`
})

#### How do I bind native events to a component? How do I bind to a specific element in a component?

If you want to listen to native events directly on the root element of the component, you can use the native modifier, for example

    <base-input v-on:focus.native="onFocus"></base-input>

If the root element is not the element that needs to be listened to, the parent's native will be invalid. You can use the $listeners property, which is an object containing all the listeners acting on this component. For example, the $listeners in the <base-input /> component is

{
focus: function (event) { /* ... */ }
}

This allows you to target an event listener to a specific child element of this component, as shown below.

Vue.component('base-input', {
inheritAttrs: false,
props: ['label', 'value'],
computed: {
inputListeners: function () {
var vm = this
return Object.assign({},
// We add all listeners from the parent
this.$listeners,
// Then we add custom listeners,
// or override some listener behavior
{
// Here we make sure the component works with `v-model`
input: function (event) {
vm.$emit('input', event.target.value)
}
}
)
}
},
template: `
<label>
{{ label }}
<input
v-bind="$attrs"
v-bind:value="value"
v-on="inputListeners"
>
</label>
`
})

#### What is the .sync modifier and how do I use it?

.sync is an abbreviation for the method in which a child component triggers a parent component event and modifies the parent component value. Example usage:

    this.$emit('update:title', newTitle)
    <text-document
      v-bind:title="doc.title"
      v-on:update:title="doc.title = $event"
    ></text-document>
    //can be abbreviated to
    <text-document v-bind:title.sync="doc.title"></text-document>

#### How to directly access the root instance, parent component instance, child component instance (child element)

Accessing the root instance

this.$root
//Best to use Vuex

Access the parent component instance

this.$parent

Or use dependency injection

provide: function () {
return {
getMap: this.getMap
}
}

inject: ['getMap']

Accessing child components or elements

this.$refs


#### How to unregister a manually bound eventListener before the instance is destroyed?

Using programmatic event listeners, such as a pattern for integrating third-party libraries

// Attach this date picker to an input field once.
// It will be mounted to the DOM.
mounted: function () {
// Pikaday is a third-party date picker library.
this.picker = new Pikaday({
field: this.$refs.input,
format: 'YYYY-MM-DD'
})
},
// Before the component is destroyed,
// also destroy the date picker.
beforeDestroy: function () {
this.picker.destroy()
}

The problem is that first, the piker needs to be saved in the instance, and second, the creation code and cleanup code are separated, making it difficult to programmatically clean up everything that was created.
The solution is

mounted: function () {
var picker = new Pikaday({
field: this.$refs.input,
format: 'YYYY-MM-DD'
})

this.$once('hook:beforeDestroy', function () {
picker.destroy()
})
}

#### When would you use a custom directive? How?

When you need to perform low-level operations on **normal DOM elements**, you may need to use custom instructions

For example, you want the input box to get the focus when the page loads, or you want an element to change its background color when it loads.

Example of input box:

// Register a global custom directive `v-focus`
Vue.directive('focus', {
// When the bound element is inserted into the DOM...
inserted: function (el) {
// Focus the element
el.focus()
}
})

or local instructions

directives: {
focus: {
// Directive definition
inserted: function (el) {
el.focus()
}
}
}
<input v-focus>

Background color examples

    <div v-demo="{ color: 'white', text: 'hello!' }"></div>

Vue.directive('demo', function (el, binding) {
console.log(binding.value.color) // => "white"
console.log(binding.value.text) // => "hello!"
})

#### What are the types of Vue plugins? How do I use them?

A Vue.js plugin should have a public method called install . The first argument of this method is the Vue constructor, and the second argument is an optional options object:

MyPlugin.install = function (Vue, options) {
// 1. Add a global method or property
Vue.myGlobalMethod = function () {
// Logic...
}

// 2. Add a global resource
Vue.directive('my-directive', {
bind (el, binding, vnode, oldVnode) {
// Logic...
}
...
})

// 3. Inject the component
Vue.mixin({
created: function () {
// Logic...
}
...
})

// 4. Add an instance method
Vue.prototype.$myMethod = function (methodOptions) {
// Logic...
}
}
