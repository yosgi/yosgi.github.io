if (typeof renderMathInElement === 'function') {
 renderMathInElement(document.querySelector('.article-body') || document.body, {delimiters:[{left:'$$',right:'$$',display:true},{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false},{left:'$',right:'$',display:false}],throwOnError:false});
}
