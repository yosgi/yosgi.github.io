---
draft: true
original: 'content/zh/post/legacy/Hexo 升级到 5.md'
title: Hexo 升级到 5
description: 填坑日记
categories:
  - Life
date: 2020-12-11 12:37:55
summary: ""
---

# ENGLISH TRANSLATION NEEDED

This is an automatically generated English stub. Please translate the content below into English and remove the `draft: true` flag when ready.

<!-- ORIGINAL CHINESE CONTENT STARTS -->
一年多没有更新博客，拉下来 `hexo s` 发现生成的页面是空白的，并且也没有报错

查了资料发现是没有 下载 \_config.yml 中配置的 theme: next

于是 去 next 官网找到 相应的下载命令

```
git clone https://github.com/iissnan/hexo-theme-next themes/next
```

发现下载的速度令人发指 ，于是 切换 npm 包源

```
git clone https://github.com.cnpmjs.org/iissnan/hexo-theme-next themes/next
```

之后再 `hexo s --debug` ，久违的博客页面终于显示了出来。

接下来就是部署到 github page 上

##### 新的问题

`hexo d -g` 之后发现报错 `The "mode" argument must be integer. Received an instance of Object`

网上查找发现是 因为 npm 版本过高引起的问题

我总不能切回旧版本 node ，写别的项目再切回去吧

本着用新不用旧的原则 ，开始升级 hexo

##### 升级 hexo

这里使用 npm-upgrade 来进行 packge.json 的更新

```
npm install -g npm-upgrade
npm-upgrade
npm i
```

操作后我的 package 如下

```json
{

  "name": "hexo-site",

  "version": "0.0.0",

  "private": true,

  "hexo": {

​    "version": "5.2.0"

  },

  "dependencies": {

​    "hexo": "^5.2.0",

​    "hexo-asset-image": "^1.0.0",

​    "hexo-deployer-git": "^2.1.0",

​    "hexo-generator-archive": "^1.0.0",

​    "hexo-generator-category": "^1.0.0",

​    "hexo-generator-index": "^2.0.0",

​    "hexo-generator-searchdb": "^1.3.3",

​    "hexo-generator-tag": "^1.0.0",

​    "hexo-renderer-ejs": "^1.0.0",

​    "hexo-renderer-marked": "^3.3.0",

​    "hexo-renderer-stylus": "^2.0.1",

​    "hexo-renderer-swig": "^1.1.0",

​    "hexo-server": "^2.0.0",

​    "hexo-theme-next": "^8.1.0"

  }

}
```

##### 升级后的新问题

升级后部署到 github page ，果然又出现了新的问题，发现部署之后的网站只显示了

`hexo {% extends '_layout.swig' %}`

使用 debug 发现一个 warn

```
INFO  Validating config
WARN  Deprecated config detected: "external_link" with a Boolean value is deprecated. See https://hexo.io/docs/configuration for more details.
```

原来是 external_link 这个 属性被改成了 object 类型，马上去修改 \_config.yml

```
external_link:
  enable: true

```

再次 `hexo s` 发现 问题并没有解决

从 [issue： 与 hexo 5 不兼容](https://github.com/ahonn/hexo-theme-even/issues/266) 找到了解决办法，原来是 Hexo 5 把 swig 渲染插件删了，需要单独安装

```npm i hexo-renderer-swig
npm i hexo-renderer-swig
```

再 `hexo s`

成功

##### 小调整

next 主题下的 翻页出现显示的问题，直接改成

```
{% if page.prev or page.next %}

  <nav class="pagination">
    {{
      paginator({
        prev_text: '上页',
       next_text: '下页',
        mid_size: 1
      })
    }}
  </nav>

{% endif %}
```
<!-- ORIGINAL CHINESE CONTENT ENDS -->
