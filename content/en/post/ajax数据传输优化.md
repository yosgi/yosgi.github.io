---
draft: false
original: content/zh/post/legacy/ajax数据传输优化.md
layout: herformancejs
title: Ajax data transmission optimization
description: High Performance Javascript Knowledge Points
categories:
- JavaScript
- JavaScript
tags:
- JavaScript
date: 2018-11-28 14:47:40
summary: ''
---

#### Comparing POST and GET when using XHR
When sending data to a server, GET is faster because, for small amounts of data, a GET request only sends one packet to the server. A POST request, on the other hand, sends at least two packets: one for headers and one for the POST body. POST is better suited for sending large amounts of data to a server, firstly because it doesn't care about the number of extra packets, and secondly because Internet Explorer has a limit on URL length.

GET should be used for requests that do not change the server state and only retrieve data (idempotent behavior). Data requested by GET will be cached, which helps improve the performance of multiple requests.

#### What is dynamic script injection? What are its characteristics?

var scriptElement = document.createElement('script')
scriptElement.src = 'http://xxx.com/lib.js'
document.getElementsByTagName('head')[0].appendChild(scriptElement)
function jsonCallBack(jsonString) {
var data = eval('(' + jsonString + ')')
}

// lib.js
jsonCallBack({"status":1})
Using JavaScript to create a new script tag and set the src attribute to a URL from a different domain allows for cross-domain data requests.

The request header cannot be set, only the GET method can be used, and access must wait until all data is returned.

The response message must be executable JS code

Any code injected into a page using scripts can control the page, including modifying content and redirecting to other websites, so you need to be careful when introducing code from external sources.

#### What are the characteristics of MXHR (Multipart XHR)?

It can combine multiple http requests into one request. Reducing the number of requests will improve the performance of the page.

The element is created using a data:URL and therefore cannot be cached by the browser. This does not affect website behavior when using a separate packaged JS or CSS file for each page. For example, when using a single page, you can simply load the CSS externally once.

#### What are Beacons?

Use JavaScript to create an Image object and set the src attribute to the URL of the script on the server. The URL contains the key-value pairs that need to be transmitted.

var url = '/status_tracker.php';
var params = ['userName=yosgi','step=2'];
(new Image).src = url + '?' + params.join('&');
// This code sends a request to /status_tracker.php?step=2&time=23311

This code does not return any information to the client, and no image is actually displayed.

Although the performance cost is small, the length of the data that can be sent is very small because the URL has a maximum length. You can only determine whether the server has accepted the data by monitoring the onload event of the Image object.

#### The difference between JSON and JSON-P

When using XHR, the JSON data is returned as a string, which is then converted into a native object using eval().

The JSON-P data is treated as another Js file and executed as native code.

JSON-P can be used across domains, but should not be used when dealing with sensitive data.
#### About Custom Formats

Example of creating a custom format:

'John;Jack;David'

Just simply link the data with a delimiter and use split() after receiving it.

When creating a custom format, it is best to use a single character that should not exist in the data. The first few characters of the ASCII character set work well in most server languages.

\u0001 \u0002

#### Summary of Ajax optimization methods:

##### Reduce the number of requests, merge JS and CSS files, or use MXHR

##### Shorten the page loading time. After the main content of the page is loaded, use Ajax to get the secondary

##### Know when to use a mature Ajax library and when to write your own low-level Ajax code (most javascript libraries do not allow direct access to the readystatechange event)
