---
draft: false
original: 'content/zh/post/legacy/Js加载优化.md'
title: "JavaScript Loading Optimization"
description: "Notes from 'High Performance JavaScript'"
categories:
  - JavaScript
tags:
  - JavaScript
date: 2018-09-04 09:23:11
summary: ""
---

##### Why should the `<script>` tag be placed at the bottom of the `<body>` tag whenever possible?
Placing `<script>` tags at the end of the `<body>` helps avoid blocking page rendering because downloading and executing scripts can modify the DOM and block other resource downloads. Many browsers use a single thread for UI rendering and JavaScript execution, so moving scripts to the bottom reduces perceived load time and improves responsiveness.

##### What are the `defer` and `async` attributes and how do they behave?

- `defer` indicates that the script will not modify the DOM during parsing, so its execution can be deferred safely. The browser will begin downloading the script as it encounters the `<script src="...">` tag during parsing, but will delay execution until the document has been parsed; deferred scripts are executed in order and before the `DOMContentLoaded`/`load` events. The `defer` attribute only applies when `src` is present.

- `async` loads scripts asynchronously. Like `defer`, it downloads the script in parallel with other resources, but the key difference is execution timing: an `async` script runs as soon as it finishes downloading (which can interrupt parsing), whereas `defer` scripts wait until parsing completes and execute in document order.

Use `async` for independent scripts (analytics, ads) and `defer` for scripts that rely on the document structure or need predictable ordering.

##### What are dynamic script elements and how do you create them?

You can create `<script>` elements dynamically via DOM methods, which allows non-blocking loading and execution. Dynamically injecting a `<script>` and appending it to the document starts download without blocking other tasks, making it a widely used technique for non-blocking script loading.

Example:```javascript
function loadScript(url, callback) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.onload = function () {
    callback();
    // Ensure the script is ready before calling other code that depends on it
  };
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}
```This pattern starts downloading the script and invokes the callback when the script is loaded and executed.

##### How does XMLHttpRequest-based script injection work and what are its limitations?

You can fetch script text via `XMLHttpRequest` (or `fetch`) and then inject it into the page by creating a `<script>` element with the response text. This avoids an extra round-trip for script loading in some scenarios but has limitations:

- Same-origin policies and CORS restrictions apply when fetching external resources.
- Injected scripts run with the privileges of inline code and may be harder to cache or reuse as separate static assets.
- Debugging is less straightforward because the script appears inline rather than as a separate file in dev tools (unless you add source mapping or use blob URLs).

Example:```javascript
var xhr = new XMLHttpRequest();
xhr.open('GET', 'test.js', true);
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {
    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.text = xhr.responseText;
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  }
};
xhr.send(null);
```Use this approach carefully and prefer proper caching headers and CORS configuration when loading cross-origin code.

<!-- End of translation -->

<!-- ORIGINAL CHINESE BODY STARTS -->
##### Why should the `<script>` tag be placed at the bottom of the `<body>` tag whenever possible?
Placing `<script>` tags at the end of the `<body>` helps avoid blocking page rendering because downloading and executing scripts can modify the DOM and block other resource downloads. Many browsers use a single thread for UI rendering and JavaScript execution, so moving scripts to the bottom reduces perceived load time and improves responsiveness.

##### What are the `defer` and `async` attributes and how do they behave?

- `defer` indicates that the script will not modify the DOM during parsing, so its execution can be deferred safely. The browser will begin downloading the script as it encounters the `<script src="...">` tag during parsing, but will delay execution until the document has been parsed; deferred scripts are executed in order and before the `DOMContentLoaded`/`load` events. The `defer` attribute only applies when `src` is present.

- `async` loads scripts asynchronously. Like `defer`, it downloads the script in parallel with other resources, but the key difference is execution timing: an `async` script runs as soon as it finishes downloading (which can interrupt parsing), whereas `defer` scripts wait until parsing completes and execute in document order.

Use `async` for independent scripts (analytics, ads) and `defer` for scripts that rely on the document structure or need predictable ordering.

##### What are dynamic script elements and how do you create them?

You can create `<script>` elements dynamically via DOM methods, which allows non-blocking loading and execution. Dynamically injecting a `<script>` and appending it to the document starts download without blocking other tasks, making it a widely used technique for non-blocking script loading.

Example:```javascript
function loadScript(url, callback) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.onload = function () {
    callback();
    // Ensure the script is ready before calling other code that depends on it
  };
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}
```This pattern starts downloading the script and invokes the callback when the script is loaded and executed.

##### How does XMLHttpRequest-based script injection work and what are its limitations?

You can fetch script text via `XMLHttpRequest` (or `fetch`) and then inject it into the page by creating a `<script>` element with the response text. This avoids an extra round-trip for script loading in some scenarios but has limitations:

- Same-origin policies and CORS restrictions apply when fetching external resources.
- Injected scripts run with the privileges of inline code and may be harder to cache or reuse as separate static assets.
- Debugging is less straightforward because the script appears inline rather than as a separate file in dev tools (unless you add source mapping or use blob URLs).

Example:```javascript
var xhr = new XMLHttpRequest();
xhr.open('GET', 'test.js', true);
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {
    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.text = xhr.responseText;
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  }
};
xhr.send(null);
```Use this approach carefully and prefer proper caching headers and CORS configuration when loading cross-origin code.

<!-- End of translation -->
<!-- ORIGINAL CHINESE BODY ENDS -->
