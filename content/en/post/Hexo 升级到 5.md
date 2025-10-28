---
draft: false
original: content/zh/post/legacy/Hexo 升级到 5.md
title: Hexo upgraded to 5
description: Filling Diary
categories:
- Life
date: 2020-12-11 12:37:55
summary: ''
---

I haven't updated my blog for more than a year. I pulled down `hexo s` and found that the generated page was blank and there was no error.

I checked the information and found that the theme configured in \_config.yml was not downloaded: next

So go to next official website to find the corresponding download command```

git clone https://github.com/iissnan/hexo-theme-next themes/next
```

I found the download speed was outrageous, so I switched the npm package source.```

git clone https://github.com.cnpmjs.org/iissnan/hexo-theme-next themes/next
```

After that, run `hexo s --debug` and the long-lost blog page finally appeared.

The next step is to deploy it to the github page

##### New Questions

`hexo d -g` and then I get the error `The "mode" argument must be integer. Received an instance of Object`

I searched online and found that the problem was caused by the npm version being too high.

I can't switch back to the old version of node. I have to write another project and then switch back.

Based on the principle of using new instead of old, start upgrading hexo

##### Upgrading hexo

Here we use npm-upgrade to update packge.json```

npm install -g npm-upgrade
npm-upgrade
npm i
```

After the operation, my package is as follows

```

json
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
```##### New issues after upgrading

After the upgrade, I deployed it to github page. Sure enough, a new problem occurred. I found that the website after deployment only showed

`hexo {% extends '_layout.swig' %}`

Using debug, I found a warning.```

INFO  Validating config
WARN  Deprecated config detected: "external_link" with a Boolean value is deprecated. See https://hexo.io/docs/configuration for more details.
```

It turns out that the external_link attribute has been changed to object type. Immediately modify \_config.yml```

external_link:
  enable: true

`

```

hexo s` again found that the problem was not solved

I found a solution from [issue: incompatible with hexo 5](https://github.com/ahonn/hexo-theme-even/issues/266). It turns out that Hexo 5 deleted the swig rendering plugin and needs to be installed separately.

```

npm i hexo-renderer-swig
npm i hexo-renderer-swig
```

Again `hexo s`

success

##### Minor Adjustments

Next theme has page turning display problem, just change it to```

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
