---
draft: false
original: content/zh/post/legacy/Web安全浅述.md
title: A Brief Introduction to Web Security
description: Web security related content
categories:
- Frontend
tags:
- Frontend
- JavaScript
date: 2018-07-05 10:05:36
summary: ''
---

![image](/images/web-security-overview/img1.png)

#### XSS
##### Concept
Cross-site scripting (CSS) is an attack that executes invalid HTML tags or JavaScript in the browser of a registered user of a website with a security vulnerability. Dynamically created HTML may contain hidden security vulnerabilities. Attackers can create scripts that trap users in their browsers, leaving them vulnerable to passive attacks.
##### Potential Impacts
- Using fake input forms to steal user personal information
- Using scripts to steal user cookies and send malicious requests
- Displaying forged articles or images

##### Classification
The first type is reflected XSS, also known as non-persistent XSS. Specifically, we pass our malicious script to the server via a URL, and the server simply "reflects" the script back to the visitor's browser without processing, causing the visitor's browser to execute the script.

One type is stored XSS, also known as persistent XSS. The biggest difference between it and reflected XSS is that the server will do some processing when it receives our malicious script.

For example, it can be stored in a database, and then when we visit the same page again, the malicious script can be retrieved from the database and returned to the browser for execution.

For example, when someone inserts a malicious script into a message, the server will display the previous message content to each visitor, so subsequent visitors will naturally receive the malicious script in the previous message and be unfortunately targeted.

##### Case

There are many examples of XSS online [Example 1](https://blog.csdn.net/u011781521/article/details/53894399/)
[Example 2](https://blog.csdn.net/ganyingxie123456/article/details/70230486)

##### XSS Defense Measures
Principle: Never allow data to become executable code. Do not trust any user data. Strictly separate data and code.
1. HttpOnly: The browser prohibits JavaScript in the page from accessing cookies with the HttpOnly attribute.
2. Input Validation: The XSS Filter performs format checks on input content, similar to a "whitelist," which can prevent attacks based on special characters. Implement the same input validation in both client-side JavaScript and server-side code (required on the server side).
3. Output Validation: When outputting variables to HTML pages, use encoding or escaping to prevent XSS attacks. HtmlEncode: Converts characters to HTMLEntities, according to the ISO-8859-1 standard. JavaScriptEncode can be used in JavaScript. Special characters (\) must be escaped, and output variables must be enclosed in quotes.

###### Output in HTML tag:


<div>$var</div>

Variables output within a tag, if not processed, can directly lead to XSS.

<div><script>alert(/XSS/)</script></div> or <a href=# ><img src=# onerror=alert(1) /></a>
Defense method: Use HtmlEncode for variables.

###### Output in Html attribute:

<div id="abc name="$var"></div>

Attack method:

<div id="abc" name=""><script>alert(/XSS/)</script><""></div>

Defense method: Use HtmlEncode.

###### Output in CSS: Various ways

Defense method: Whenever possible, prohibit user-controllable variables from being output in "style tags," "style attributes of HTML tags," and "CSS files."

Outputting in addresses: This is more complex. Generally, outputting in the URL path or search parameter requires URLEncoding.

When the entire URL is fully controlled by the user, URLEncoding the protocol (http://) and host (www.xxx.com) of the URL cannot be used. This can lead to the creation of a pseudo-protocol and exploit attacks.

Defense method: First check whether the variable begins with "http" (automatically adding it if it does not) to prevent pseudo-protocol XSS attacks. Then, URLEncode the variable.

###### Processing rich text
Defense method: The same principle applies to input checking. Use "XSS Filter": "Events" should be strictly prohibited; some dangerous tags:

`<iframe>`, `<script>`, `<base>`, `<form>`

should also be strictly prohibited. When selecting tags, attributes, and events, use a whitelist instead of a blacklist. For example, only relatively "safe" tags such as `<a>`, `<img>`, and `<div>` are allowed.

###### Defending against DOM-Based XSS

If the output is to an event or script, javascriptEncode must be performed once; if the output is to HTML content or attributes, HtmlEncode must be performed once.

CSRF Attacks

A Cross-Site Request Forgeries (CSRF) attack is a passive attack in which an attacker sets a trap to force authenticated users to perform unexpected status updates such as personal information or settings.

##### Case Study
[CSRF Attack and Defense](https://blog.csdn.net/stpeace/article/details/53512283)

##### Defending against CSRF

CSRF defense can be implemented on both the server and client sides. The defense effect is better if it is implemented on the server side. Currently, CSRF defense is generally implemented on the server side.

1. Key operations only accept POST requests and verification codes

The CSRF attack process often occurs without the user's knowledge, and network requests are constructed without the user's knowledge. Therefore, if a verification code is used, each operation requires user interaction, thereby simply and effectively defending against CSRF attacks.

However, if you need to enter a verification code for any action on a website, it will seriously affect the user experience, so verification codes generally only appear in special operations or are used when registering.

2. Detect Referer

Typically, internet pages are linked to each other, and the previous URL is always retained in the Referer property of the new page.
By examining the Referer value, we can determine whether the request is legitimate or illegitimate.

However, the problem is that the server does not always receive the Referer value, so Referer Check is generally used to monitor the occurrence of CSRF attacks rather than to defend against attacks.

3. Cookie Hashing (all forms contain the same pseudo-random value):

This is probably the simplest solution, because the attacker cannot obtain third-party cookies (in theory), so the data in the form will fail to be constructed.

Add a hash value to the form to verify that this is indeed the request sent by the user, and then perform hash value verification on the server side

Unless the user's cookies are stolen due to an XSS vulnerability in the website, most attackers will give up when they see the need to calculate the hash value.

SQL injection attacks

SQL injection attacks are a common method used by hackers to attack databases. This occurs when an application fails to verify the validity of user input, creating security risks. Users can submit a database query and, based on the program's response, obtain desired data. This is known as SQL injection.

##### Example
The SQL query code for login verification on a certain website is:

    strSQL = "SELECT * FROM users WHERE (name = '" + userName + "') and (pw = '"+ passWord +"');"

Malicious entry

userName = "1' OR '1'='1";
and

passWord = "1' OR '1'='1";

This will cause the original SQL string to be filled in as

    strSQL = "SELECT * FROM users WHERE (name = '1' OR '1'='1') and (pw = '1' OR '1'='1');"

That is, the SQL command actually executed will become the following

    strSQL = "SELECT * FROM users;"

Therefore, you can log in to the website without an account or password. Therefore, SQL injection attacks are commonly known as hackers' fill-in-the-blank game.

##### Defense Methods

From the perspective of security technology, SQL injection attacks can be prevented through database firewalls. Since SQL injection attacks often attack through applications, virtual patching technology can be used to identify the SQL features of injection attacks and achieve real-time attack blocking.

OS Command Injection

OS command injection is similar to SQL injection, except that SQL injection targets the database, while OS command injection targets the operating system. OS command injection allows you to execute arbitrary commands on the server.

##### Defense Methods

1. Don't call external programs. For example, on UNIX systems, there's a CGI program that can execute the sendmail command to send email. Perhaps your web application also has email functionality, and it would be easy to send email by directly calling the CGI program. However, avoid this approach because other OS commands may be mixed in with the sendmail command. The correct approach is to use a library for sending email.

2. Filter symbols such as ; , [ , ] , | , < , > , \

3. Set user permissions

HTTP header injection attack

HTTP Header Injection is an attack in which an attacker adds arbitrary response headers or bodies by inserting newlines in the response header field.

The attack of adding content to the header body is called HTTP Response Splitting Attack.

HTTP header injection is possible by inserting newlines into certain response header fields where the output value is required to process.

##### Example
For example, a request is as follows:

    GET/HTTP/1.1
    Host: www.example.com
    Connection: keep-alive
    Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
    Upgrade-Insecure-Requests: 1
    User-Agent: Mozilla/5.0'(select*from(select(sleep(20)))a) #
    Accept-Encoding: gzip, deflate, sdch
    Accept-Language: en-US,en;q=0.8,fr;q=0.6

The HTTP User-Agent header is "Mozilla/5.0'(select * from (select (sleep(20)))a) #". The "select * from (select (sleep(20)))" is abnormal. The attack here is to make the database sleep for 20 seconds without doing anything, thus wasting database processing threads. This is a simple injection, but more complex attacks are possible.

##### May cause impact:

1. Set any cookie information

2. Redirect to any URL

3. Displaying arbitrary body (HTTP response truncation attack)
