---
title: vue + express + mongodb 搭建一个后台登录系统
description: 关键词 nodejs vue express mongodb
summary: ""
categories: 
  - Vue
tags:
  - Vue
  - Node.js
  - Database
date: 2018-12-13 18:15:10
---
#### 需要准备的
首先安装这些东西

[nodeJs](https://nodejs.org/zh-cn/) , npm

![image](/images/vue-express-mongodb-admin-system/1.png)

[mongodb](https://www.mongodb.com/) , [adminMongo](https://github.com/mrvautin/adminMongo)(非必须)

![image](/images/vue-express-mongodb-admin-system/2.png)

![image](/images/vue-express-mongodb-admin-system/3.png)

[vue-element-admin](https://panjiachen.github.io/vue-element-admin-site/)

[express](http://www.expressjs.com.cn/)

前端的页面我决定用[vue-element-admin](https://panjiachen.github.io/vue-element-admin-site/)，git clone 后就可以看到完整的开发框架




![image](/images/vue-express-mongodb-admin-system/4.png)

#### 前端登录思路

验证思路是登录成功后，服务端返回token(标识用户的唯一身份),之后将token储存在本地cookie中，下次打开页面或者刷新页面就能记住用户的登录状态。

在用户登录成功后，会在全局钩子router.beforeEach，判断是否已获得token，在获得token之后去获取用户的信息。


下面看具体登录页的主要代码

    //index.vue
    handleLogin() {
          this.$refs.loginForm.validate(valid => {
            if (valid) {
              this.loading = true
              this.$store.dispatch('LoginByUsername', this.loginForm).then(() => {
                this.loading = false
                this.$router.push({ path: this.redirect || '/' })
              }).catch(() => {
                this.loading = false
              })
            } else {
              console.log('error submit!!')
              return false
            }
          })
        },


可以点击登录后，先进行了表单验证,然后触发了vuex 的 LoginByUsername 的 action，
从代码中搜索一下这个异步操作做了什么
    
    // user.js
    import { loginByUsername, logout, getUserInfo } from '@/api/login'
    import { getToken, setToken, removeToken } from '@/utils/auth'
    actions: {
    LoginByUsername({ commit }, userInfo) {
          const username = userInfo.username.trim()
          return new Promise((resolve, reject) => {
            loginByUsername(username, userInfo.password).then(response => {
              const data = response.data
              commit('SET_TOKEN', data.token)
              setToken(response.data.token)
              resolve()
            }).catch(error => {
              reject(error)
            })
          })
        },
        ...
可以看到这个 LoginByUsername 中调用了login.js 的 loginByUsername 方法，loginByUsername 接受了 username 和 password    两个参数。可以推测 loginByUsername 是发送了请求，在请求完毕之后提交了 SET_TOKEN 这种方法 ，并且调用了 auth.js 中的 setToken 

    // login.js
    import request from '@/utils/request'
    export function loginByUsername(username, password) {
      const data = {
        username,
        password
      }
      return request({
        url: '/login/login',
        method: 'post',
        data
      })
    }

可以看到这里是发送了请求，其中request 应该是封装了axios 的方法，具体怎么封装后面再看。

    // user.js
     mutations: {
        SET_TOKEN: (state, token) => {
          state.token = token
        },

可以看到 SET_TOKEN 就是将请求返回的token值更新到vuex的state中。

    //auth.js
    import Cookies from 'js-cookie'
    const TokenKey = 'Admin-Token'
    export function setToken(token) {
      return Cookies.set(TokenKey, token)
    }
setToken方法是把token存进cookie中




#### 后台思路

按照前端的逻辑，我们需要有一个登录的接口，登录的时候从数据库中查询，如果正确就返回token给前端，还需要有一个接口来接收token，返回给前端用户的具体信息。

##### express
先从[express](http://www.expressjs.com.cn/)开始说

通过应用生成器工具express-generator 可以快速创建一个应用的骨架。生成后应该可以看到下面的目录结构。
![image](/images/vue-express-mongodb-admin-system/5.png)

    npm install //安装依赖模块
    npm start //启动项目




因为每次修改之后还需要重新 npm start 会比较麻烦，所以我用[nodemon](https://www.npmjs.com/package/nodemon)来进行热更新。

    npm install -g nodemon //安装nodemon
    
    
    
![image](/images/vue-express-mongodb-admin-system/6.png)

就能启动express应用了

![image](/images/vue-express-mongodb-admin-system/7.png)

下面看express项目的结构

bin是应用的启动目录，

    var http = require('http');
    var port = normalizePort(process.env.PORT || '3000');
    app.set('port', port);
    var server = http.createServer(app);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

public是项目的静态文件目录

routes 控制路由,我们需要在这里做登录的接口

views 是视图文件，我们在这里放html文件


##### mongodb

注册登录需要数据库，我使用了mongodb ，用[mongoose](https://github.com/Automattic/mongoose)
操作数据库，文档有介绍的就不啰嗦了。

在express的目录下建立一个database文件夹，建立文件model.js 以及处理文件bdHandler.js
    
    // models.js
    module.exports = { 
        user:{ 
            username:{type:String,required:true},
            password:{type:String,required:true},
            roles:{type:String,required:true}
        }
    };
    
    //bdHandel.js
    //提供其他文件对model的操作
    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var models = require("./models");
    
    for(var m in models){ 
        mongoose.model(m,new Schema(models[m]));
    }
    
    module.exports = { 
        getModel: function(type){ 
            return _getModel(type);
        }
    };
    
    var _getModel = function(type){ 
        return mongoose.model(type);
    };
    
然后我们需要链接到数据库，并把bdHandel设置为全局的以便于在路由中使用
    
    //在app.js中添加
    global.dbHandel = require('./database/dbHandler');
    global.db = mongoose.connect("mongodb://localhost:27017/ch_users", { useNewUrlParser: true })

##### 后台接口
做完后，我们就可以去处理登录的接口部分了


    var express = require('express');
    var router = express.Router();
    var dbhandler = require('../database/dbHandler');
    var jwt = require('jwt-simple');
    router.post("/login", function (req, res) {                      
    // 从此路径检测到post方式则进行post数据的处理操作
      //这里的User就是从model中获取user对象
      var User = dbhandler.getModel('user');
      var {username} = req.body;                //获取post上来的 data数据中 username
      
      User.findOne({ username }, function (err, doc) {   //通过此model以用户名的条件 查询数据库中的匹配信息
        if (err) {                            //错误就返回 状态码为500的错误
          res.send(500);
          console.log(err);
        } else if (!doc) {                                 //查询不到用户名匹配信息，则用户名不存在
          res.send({code:400,message:'用户名不存在'});                            //    状态码返回404
        } else {
          if (req.body.password != doc.password) {     //查询到匹配用户名的信息，但相应的password属性不匹配
            res.send({code:400,message:'密码错误'});  
          } else {                                   
          //信息匹配成功返回20000，返回token
            let token = jwt.encode(doc, secret);
            res.send({code:20000,token});
          }
        }
      })
    })
    module.exports = router;

其中用户认证用的是基于 JWT 身份验证的方法，其中的secret是存在服务器上的密码,为了方便我把它作为了一个全局变量

    //app.js
    global.secret = 'yosgi'

别忘了router还需要在app.js中注册

    //app.js
    var users = require('./routes/users');
    app.use('/login', users);
这样我们的登录接口就做完了，在前端页面试试吧。

#### 前端登录页面
我们的express应用监听的是localhost:3000,因此我们需要往localhost:3000/login/login
的地址发送POST请求。

首先要把mock中的模拟请求去掉，才能真正发送请求。

    // mock\index.js
    // Mock.mock(/\/login\/login/, 'post', loginAPI.loginByUsername)
    这一段注释掉
    
点击登录尝试一下 发现是在向

    http://serve-dev/login/login
    
发送请求，猜测是axios方面的baseURL设置的，在utils/request.js中看到下面的代码

    //request.js
    import axios from 'axios'
    const service = axios.create({
      baseURL: process.env.BASE_API, // api 的 base_url
      timeout: 5000 // request timeout
    })

在config的dev.env.js中去掉
    
    //dev.env.js
    module.exports = {
      NODE_ENV: '"development"',
      ENV_CONFIG: '"dev"',
      BASE_API: '' 
    }

现在发送请求的地址是

    http://localhost:9527/login/login

为什么不直接把BASE_API改成http://localhost:3000呢？因为这样的话就会跨域，跨域可以后台用cors解决，不过我这边决定还是用proxyTable插件比较方便。
    
    // index.js
    dev: {
    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
      '/login/login':{
          target: 'http://localhost:3000',// 3000 端口启动的本地服务器
          changeOrigin: true
      }
    }
    
这样就把向/login/login的请求发送到了http://localhost:3000/login/login上了
尝试一下

我们事先在数据库做好了admin用户
![image](/images/vue-express-mongodb-admin-system/8.png)

请求结果

![image](/images/vue-express-mongodb-admin-system/9.png)

![image](/images/vue-express-mongodb-admin-system/10.png)

这步成功后，token就被储存到了vuex以及cookie中。接下来需要做的是

1. 使用token进行验证，拉取用户信息
2. 做注册用户的接口
3. 做登出的接口

