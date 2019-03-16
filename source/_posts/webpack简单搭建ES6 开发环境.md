---
title: webpack简单搭建ES6 开发环境
description: 
categories:
  - webpack
tags:
  - webpack
date: 2019-03-16 15:34:56
---
# webpack简单搭建ES6 开发环境

大体步骤如下:

- [ ] 初始化npm环境
- [ ] 安装webpack
- [ ] 安装webpack-dev-server
- [ ] 安装babel

 npm 和 webpack 的安装文档很多就不赘述了。如果安装过程过慢就使用 npm.taobao.org 来安装就好。

## 配置webpack

先npm init ，一路 yes 就行

创建src文件夹，创建index.js作为入口文件

`npm install webpack webpack-cli --save-dev`

创建webpack.dev.config

```javascript
module.exports = {

    entry: './src/index.js',// 入口文件

    output: {

        path: __dirname,// 当前目录

        filename: './release/bundle.js'

    }

}
```

在package.json 中 修改 scripts 属性

```json
...
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "ebpack --config ./webpack.dev.config.js --mode development"
  }
 ...
```

做完之后 使用 `npm run dev` 命令 就会发现在 release 文件夹下面出现bundle.js 的文件

## 启动本地服务器

`npm install webpack-dev-server html-webpack-plugin --save-dev`

其中 webpack-dev-server 用作启动本地服务器，html-webpack-plugin 用来生成html模板

在根目录下创建 index.html

再次修改package.json 中的 scripts 

```json
...
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "webpack-dev-server --config ./webpack.dev.config.js --mode development "
  }
...
```

修改webpack.dev.config.js

```json
const path = require('path') //nodejs 文件模块
const HtmlWebpackPlugin = require('html-webpack-plugin')

...
plugins:[
        new HtmlWebpackPlugin({
            template: './index.html'
        })
    ],
    devServer: {
        contentBase: path.join(__dirname, './release'), // 根目录
        open: true, // 自动打开浏览器
        port: 9000
    } 
...
```

做完这些再输入`npm run dev` 命令可以启动本地服务器

## 解析ES6

`npm install babel-core babel-loader babel-polyfill babel-preset-es2015 babel-preset-latest --save-dev`

创建.babelrc

```json
{

    "presets": [

        "es2015","latest"

    ],

    "plugins": []

}
```

修改webpack.dev.config.js 加入es6的解析

```json
module: { 

        rules: [{ //es6 解析

            test: /\.js?$/, // 需要检验哪些文件

            exclude: /(node_modules)/, // node_modules 可以略过

            loader: 'babel-loader' // babel-loader 对Js文件进行处理如果是ES6语法就变成ES5让浏览器能够执行

        }]

    },
```

在index.js 使用ES6 语法尝试一下是否成功

```javascript
class Person {

    constructor(name) {

        this.name = name

    }

    getName () {

        return this.name

    }

}

let p = new Person('yosgi')

alert(p.getName())
```

运行后会看到 alert 的 输出，带表成功了。

源码 https://github.com/yosgi/webpack-ES6-dev