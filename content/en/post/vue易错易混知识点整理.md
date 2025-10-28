---
draft: true
original: 'content/zh/post/legacy/vue易错易混知识点整理.md'
title: vue易错易混知识点整理
description: <ES6标准入门> 知识点整理
categories:
  - Vue
tags:
  - JavaScript
  - Vue
date: 2018-09-10 18:30:10
summary: ""
---

# ENGLISH TRANSLATION NEEDED

This is an automatically generated English stub. Please translate the content below into English and remove the `draft: true` flag when ready.

<!-- ORIGINAL CHINESE CONTENT STARTS -->
#### 什么是MVVM？与MVC有什么区别？
mvc是Model-View-Controller的缩写，用业务逻辑，数据，界面分离的方式组织代码，其中的通信是单项的，View 传送指令到 Controller；Controller 完成业务逻辑后，要求 Model 改变状态；Model 将新的数据发送到 View，用户得到反馈。

MVVM是Model-View-ViewModel的缩写，和MVC模式一样，主要目的是分离视图（View）和模型（Model），但是mvvm的控制器并不会去监听浏览器的事件,而是监听一个属性表,由浏览器的事件修改属性,以触发控制器中的方法,增加了一层控制业务的属性,而这层属性被称为VM。当 ViewModel 中数据变化，View 层会得到更新；而当 View 中声明了数据的双向绑定（通常是表单元素），框架也会监听 View 层（表单）值的变化。一旦值变化，View 层绑定的 ViewModel 中的数据也会得到自动更新。

new Vue 正是viewmodel



#### 过滤器怎么串联和传参数?

串联

    {{ message | filterA | filterB }}
    
接受参数

    {{ message | filterA('arg1', arg2) }}
    
这里，filterA 被定义为接收三个参数的过滤器函数。其中 message 的值作为第一个参数，普通字符串 'arg1' 作为第二个参数，表达式 arg2 的值作为第三个参数。
    
#### 计算属性和方法有什么区别？计算属性和侦听属性有什么区别？

计算属性和方法的区别是计算属性是基于依赖进行缓存的，只有在相关依赖发生改变后才会求值。

侦听器允许我们执行异步操作（访问一个API），并可以设置中间状态（比如loading...）。

计算属性默认只有getter ，不过在需要时也可以提供一个 setter 

#### $watch怎么观察实例的表达式？怎么观察对象内部变化？怎么立即触发回调？

观察表达式

    vm.$watch(
      function () {
        return this.a + this.b
      },
      function (newVal, oldVal) {
      }
    )

对象内部变化

    vm.$watch('someObject', callback, {
      deep: true
    })
    vm.someObject.nestedValue = 123
    
立即触发回调

    vm.$watch('a', callback, {
      immediate: true
    })
    
#### v-show和v-if的区别是什么？

v-if支持v-else和v-else-if语法，也支持< template/>语法；v-show不支持这些；

v-show是通过简单地切换元素的CSS属性display属性来实现显示隐藏效果；

v-if 是“真正的”条件渲染，因为它会确保在切换过程中条件块内的事件监听器和子组件适当地被销毁和重建；

v-if 也是惰性的：如果在初始渲染时条件为假，则什么也不做——直到条件第一次变为真时，才会开始渲染条件块；

相比之下， v-show 就简单得多——不管初始条件是什么，元素总是会被渲染，并且只是简单地基于 CSS 进行切换；


#### v-if中的key有什么作用？

为了更高效的渲染元素，vue通常会复用元素，唯一的key值会让元素不被复用而是重新渲染。


#### v-for中的key应该怎么使用？为什么需要key？

使用v-for更新已渲染的元素列表时,默认用就地复用策略;列表数据修改的时候,他会根据key值去判断某个值是否修改,如果修改,则重新渲染这一项,否则复用之前的元素;

因此，key的使用办法是使用数组中不会变化的那一项作为key值，即每条数据都有唯一且不变的id来标识这条数据的唯一性。(而不是使用数组的index值，因为在插入新项后会发生改变)

key的作用主要是为了高效的更新虚拟DOM。另外vue中在使用相同标签名元素的过渡切换时，也会使用到key属性，其目的也是为了让vue可以区分它们，否则vue只会替换其内部属性而不会触发过渡效果。

#### 怎么使vue检测到利用索引直接设置一个项或者修改数组的长度？

    // Vue.set
    Vue.set(vm.items, indexOfItem, newValue)
    // Array.prototype.splice
    vm.items.splice(indexOfItem, 1, newValue)
    
    
#### 使用修饰符使用户的输入值转为数字类型？自动过滤用户输入的首尾空白字符？

    <input v-model.number="age" type="number">
    <input v-model.trim="msg">
    
#### data为什么必须是函数？

因为只有这样每个实例才能维护一份被返回对象的独立的拷贝，否则对一个实例的修改会影响到其它的实例

#### 怎么从一个文件夹批量全局导入基础组件？

    import Vue from 'vue'
    import upperFirst from 'lodash/upperFirst'
    import camelCase from 'lodash/camelCase'
    //具体查看webpack的API
    const requireComponent = require.context(
      // 其组件目录的相对路径
      './components',
      // 是否查询其子目录
      false,
      // 匹配基础组件文件名的正则表达式
      /Base[A-Z]\w+\.(vue|js)$/
    )
    
    requireComponent.keys().forEach(fileName => {
      // 获取组件配置
      const componentConfig = requireComponent(fileName)
    
      // 获取组件的 PascalCase 命名
      const componentName = upperFirst(
        camelCase(
          // 剥去文件名开头的 `./` 和结尾的扩展名
          fileName.replace(/^\.\/(.*)\.\w+$/, '$1')
        )
      )
    
      // 全局注册组件
      Vue.component(
        componentName,
        // 如果这个组件选项是通过 `export default` 导出的，
        // 那么就会优先使用 `.default`，
        // 否则回退到使用模块的根。
        componentConfig.default || componentConfig
      )
    })
    
#### 组件的特性继承是什么？如何自定义特性继承？

添加到组件实例上的特性会被自动添加到组件的根元素上。其中class 和 style 特性如果冲突，两边的值会被合并，其它的特性的冲突则会被替换。


如果不希望组件的根元素继承特性，可以在组件的选项中设置inheritAttrs: false,例如

    ue.component('my-component', {
      inheritAttrs: false,
      // ...
    })
    
配合实例的$attrs属性使用，可以手动将特性赋予给指定元素，例如
    
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
    
#### 如何将原生事件绑定到组件？怎么绑定到组件的特定元素？

如果是想在组件的根元素直接监听原生事件，可以使用native修饰符，例如

    <base-input v-on:focus.native="onFocus"></base-input>

如果根元素不是需要监听的元素，父级的native将会失效，可以使用$listeners属性，它是一个包含了作用在这个组件上的所有监听器的对象。
例如<base-input />组件中的$listeners是

    {
      focus: function (event) { /* ... */ }
    }
    
这样就可以像如下将事件侦听器指向这个组件的某个特定子元素。

    Vue.component('base-input', {
      inheritAttrs: false,
      props: ['label', 'value'],
      computed: {
        inputListeners: function () {
          var vm = this
          return Object.assign({},
            // 我们从父级添加所有的监听器
            this.$listeners,
            // 然后我们添加自定义监听器，
            // 或覆写一些监听器的行为
            {
              // 这里确保组件配合 `v-model` 的工作
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

####     .sync修饰符是什么？ 怎么使用？

.sync是子组件触发父组件事件并修改父组件值的方法的缩写，使用例子：

    this.$emit('update:title', newTitle)
    <text-document
      v-bind:title="doc.title"
      v-on:update:title="doc.title = $event"
    ></text-document>
    //可以缩写成为
    <text-document v-bind:title.sync="doc.title"></text-document>


#### 怎么直接访问根实例，父组件实例，子组件实例（子元素）

访问根实例

    this.$root
    //最好还是使用vuex
    
访问父组件实例

    this.$parent

或者使用依赖注入

    provide: function () {
      return {
        getMap: this.getMap
      }
    }
    
    inject: ['getMap']
    
访问子组件或者子元素

    this.$refs
    

#### 如何在实例销毁前注销手动绑定的eventListener？

使用程序化的事件侦听器，比如一个集成的第三方库的模式

    // 一次性将这个日期选择器附加到一个输入框上
    // 它会被挂载到 DOM 上。
    mounted: function () {
      // Pikaday 是一个第三方日期选择器的库
      this.picker = new Pikaday({
        field: this.$refs.input,
        format: 'YYYY-MM-DD'
      })
    },
    // 在组件被销毁之前，
    // 也销毁这个日期选择器。
    beforeDestroy: function () {
      this.picker.destroy()
    }

存在的问题是第一需要在实例中保存这个piker，第二是建立代码和清理代码分开了，使得比较难程序化的清理所建立的所有东西。
解决办法是

    mounted: function () {
      var picker = new Pikaday({
        field: this.$refs.input,
        format: 'YYYY-MM-DD'
      })
    
      this.$once('hook:beforeDestroy', function () {
        picker.destroy()
      })
    }
    
#### 什么时候会使用到自定义指令？怎么使用？

当需要对**普通DOM元素**进行底层操作的时候可能需要用到自定义指令


比如想要输入框在页面加载的时候获取焦点，或者某个元素在加载的时候就改变相应的背景颜色。

输入框的例子：

    // 注册一个全局自定义指令 `v-focus`
    Vue.directive('focus', {
      // 当被绑定的元素插入到 DOM 中时……
      inserted: function (el) {
        // 聚焦元素
        el.focus()
      }
    })

或者局部指令

    directives: {
      focus: {
        // 指令的定义
        inserted: function (el) {
          el.focus()
        }
      }
    }
    <input v-focus>

背景颜色的例子

    <div v-demo="{ color: 'white', text: 'hello!' }"></div>

    Vue.directive('demo', function (el, binding) {
      console.log(binding.value.color) // => "white"
      console.log(binding.value.text)  // => "hello!"
    })
    
#### vue插件有哪几种？怎么使用插件？

Vue.js 的插件应当有一个公开方法 install 。这个方法的第一个参数是 Vue 构造器，第二个参数是一个可选的选项对象：


    MyPlugin.install = function (Vue, options) {
      // 1. 添加全局方法或属性
      Vue.myGlobalMethod = function () {
        // 逻辑...
      }
    
      // 2. 添加全局资源
      Vue.directive('my-directive', {
        bind (el, binding, vnode, oldVnode) {
          // 逻辑...
        }
        ...
      })
    
      // 3. 注入组件
      Vue.mixin({
        created: function () {
          // 逻辑...
        }
        ...
      })
    
      // 4. 添加实例方法
      Vue.prototype.$myMethod = function (methodOptions) {
        // 逻辑...
      }
    }
<!-- ORIGINAL CHINESE CONTENT ENDS -->
