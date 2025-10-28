---
draft: false
original: content/zh/post/legacy/正则表达式性能优化.md
title: Regular expression performance optimization
description: High Performance Javascript Knowledge Points
categories:
- JavaScript
- JavaScript
tags:
- JavaScript
date: 2018-11-06 15:48:14
summary: ''
---

#### How to understand backtracking? What is backtracking out of control?
When matching a string, a regular expression tests its components from left to right, requiring a decision when encountering quantifiers (* + ? {2}) and branches (|).

After a decision is made, other options may be recorded for future reference.

If the current match succeeds, continue testing the following expressions. If all succeed, the process ends.

If no matching value is found or a subsequent match fails, the regular expression backtracks to the last decision point and selects a recorded choice.

This process continues until a match is found or all permutations of the branches fail, at which point it abandons the match and moves on to the next character in the string.

Runaway backtracking is a situation where a regular expression causes the browser to freeze.

For example:

Use a regular expression that matches the tag

    let reg = /<html>[\s\S]*?<head>[\s\S]*?<title>[\s\S]*?<\/title>[\s\S]*?<\/head>[\s\S]*?<body>[\s\S]*?<\/body>[\s\S]*?<\/html>/
    
to string

    let str = `<html><head><title></title></head><body></body>`

To match, when the last [\s\S]\*? extends to the end of the string, because the last html closing tag is missing, the regular expression will try to expand to the second to last [\s\S]\*? to match the last body closing tag, and then continue to search for the second closed body tag until the end of the string, and so on.

#### Lazy and Greedy Quantifiers

The greedy quantifier (*) means repeating 0 or more times and matching as many times as possible.

The lazy quantifier (*?) will match 0 or more times, and will try to match 0 times.

example:

    let reg1 = /<html>[\s\S]*?<\/html>/
    let reg2 = /<html>[\s\S]*<\/html>/
    
    let str = `<html><html>sdasds<\/html><\/html>`
    str.match(reg1)//['<html><html>sdasds</html>']
    str.match(reg2)//['<html><html>sdasds</html></html>']
    

#### Use regular expressions to remove leading and trailing spaces?

##### Using two regular expressions

String.prototype.$trim = function() {
return this.replace(/^\s+/,"").replace(/\s+$/,"")
}

Two subexpressions are used: one to remove leading whitespace, and the other to remove trailing whitespace.
The same idea can be used with a single expression.

    String.prototype.$trim = function() {
        return this.replace(/^\s+|\s+$/g, "")
    }

This will be slower than the above method because both branch options will be tested for each string match.

##### Using capture groups

    String.prototype.$trim = function() {
        return this.replace(/^\s*([\s\S]*?)\s*$/, "$1")
    }

The lazy quantifier in the capture array will cause the regular expression to backtrack, because the lazy quantifier \*? of the [\s\S] class requires as few repetitions as possible, so the regular expression must stop and try to match the remaining \s\*? every time it matches a character. Consider the optimization plan

String.prototype.$trim = function() {
return this.replace(/^\s*([\s\S]*\S)?\s*$/, "$1")
}

For performance reasons, the lazy quantifier is replaced with a greedy quantifier. To ensure that the capture group matches the last non-blank character, the trailing \S is required.
In this expression, the greedy quantifier \* in [\s\S]\* indicates that any character class is repeated until the end of the string. The regular expression then backtracks one character at a time until it matches the next \S or reaches the first character.

###### Not using regular expressions

String.prototype.$trim = function() {
var start = 0,
end = this.length - 1
ws = "\n\r\t\f"
// Some whitespace characters, not all
while (ws.indexOf(this.charAt(start)) > -1) {
start ++
}
while (end > start && ws.indexOf(this.charAt(end)) > -1) {
end --
}
return this.slice(start, end + 1)
// The array items returned by the slice method do not include the items indexed by the second parameter
}

The advantage of this version is that it is not affected by the total length of the string. The disadvantage is that it is not suitable for handling large stretches of leading and trailing whitespace characters because the loop traversal efficiency is not as good as regular expressions. (Not being able to remember all whitespace characters is also a disadvantage.)

Hybrid Solutions

You can use regular expressions to filter out leading spaces and use non-regular expression methods to remove trailing characters.

String.prototype.$trim = function() {
var str = this.replace(/^\s+/,""),
end = str.length - 1,
ws = /\s/;
while (ws.test(str.charAt(end))) {
end --
}
return str.slice(0,end + 1)
}

This solution uses a regular expression in a loop to check for whitespace at the end of the string, making it possible to use the browser-defined list of whitespace characters.

##### in conclusion

In regular expression-based solutions, the total length of the string affects performance more than the number of characters trimmed. Non-regular expression solutions start searching from the end and are not affected by the total length of the string, but by the number of spaces trimmed.

Simply using regular expressions twice is a good solution. The mixed solution is particularly fast when processing long strings, but the cost is that the code is slightly longer and there are some shortcomings in handling long spaces at the end.

#### What are some ways to improve the efficiency of regular expressions?

##### Regular expressions start with simple, required characters.
A good start token is usually an anchor (^ or $), a specific string, or a character class ([a-z] or the \d shorthand).
Avoid starting with grouping or select characters like /one|two/

##### Reduce the number of branches and narrow the branch scope

You can reduce the need for branches by using character sets, such as replacing (.|\r|\n) with [\s\S], because character sets are faster than branches. When branches are necessary, put the most common branches first so that they are more likely to be detected as soon as possible.

##### Using non-capturing arrays

Capture array s time and memory record backreferences

#### Capture only the text of interest to reduce subsequent processing

If you need to quote part of a match, capture the necessary portion and then use backreferences.
For example, to match a string enclosed in quotes, use /"([^\"]*)\"/
rather than /"[^\"]\*"/ and then remove the quotes from the result.

##### Use appropriate quantifiers
The matching process for greedy and lazy quantifiers is very different.

##### Assign regular expressions to variables and reuse them

Avoid recompiling regular expressions within loop bodies

##### Split complex regular expressions into simpler fragments

For example, remove the two replacements of the leading and trailing blank characters
