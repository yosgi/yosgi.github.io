#!/usr/bin/env node
// Syntax-check complete algorithm examples and exercise corrected logic.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
}
const files = walk(path.join(root,'content')).filter(p=>p.endsWith('.md'));
const snippets = text => [...text.matchAll(/^```(?:javascript|js)\n([\s\S]*?)^```/gm)].map(m=>m[1]);
let syntax = 0, cases = 0;
for (const file of files) {
  const text = fs.readFileSync(file,'utf8');
  if (!/^categories:\s*\n  - Algorithms\s*$/m.test(text.split('---')[1]||'')) continue;
  snippets(text).forEach((code,index)=>{
    try { new vm.Script(code,{filename:`${file}:block-${index+1}`}); syntax++; }
    catch(error) { throw new Error(`Broken algorithm example: ${file}, block ${index+1}`,{cause:error}); }
  });
}
function source(lang,prefix,block=0) {
  const matches = files.filter(p=>p.includes(`/content/${lang}/post/`) && path.basename(p).startsWith(prefix));
  assert.equal(matches.length,1,`Ambiguous article prefix ${lang}/${prefix}`);
  const code = snippets(fs.readFileSync(matches[0],'utf8'))[block];
  assert.ok(code,`Missing block ${block+1} in ${matches[0]}`);
  return code;
}
const prelude = `
function TreeNode(val=0,left=null,right=null){this.val=val;this.left=left;this.right=right;}
function tree(values){
 if(!values.length||values[0]===null)return null;
 const root=new TreeNode(values[0]),queue=[root];let i=1;
 for(let head=0;head<queue.length&&i<values.length;head++){
  for(const side of ['left','right']){const val=values[i++];if(val!==undefined&&val!==null){queue[head][side]=new TreeNode(val);queue.push(queue[head][side]);}}
 }
 return root;
}
function inorder(root){return root?[...inorder(root.left),root.val,...inorder(root.right)]:[];}
`;
function evaluate(code,expression) {
  const result = vm.runInNewContext(prelude+'\n'+code+'\n'+expression,{console:{log(){}}},{timeout:1500});
  return result === undefined ? undefined : JSON.parse(JSON.stringify(result));
}
function expect(code,expression,expected) {
  assert.deepEqual(evaluate(code,expression),expected,expression); cases++;
}
let seed=104729;
const rand=n=>{seed=(seed*1664525+1013904223)>>>0;return seed%n;};
for (const lang of ['en','zh']) {
  for(const block of [0,1]) {
    const code=source(lang,'1893-',block);
    for(let i=0;i<80;i++) {
      const ranges=Array.from({length:1+rand(6)},()=>{const a=1+rand(15),b=1+rand(15);return [Math.min(a,b),Math.max(a,b)];});
      const left=1+rand(15),right=left+rand(16-left);
      const expected=Array.from({length:right-left+1},(_,k)=>left+k).every(n=>ranges.some(([a,b])=>a<=n&&n<=b));
      expect(code,`isCovered(${JSON.stringify(ranges)},${left},${right})`,expected);
    }
    expect(code,'isCovered([[1,10],[10,20]],21,21)',false);
    expect(code,'isCovered([[1,1]],1,2)',false);
    expect(code,'isCovered([[1,1]],1,1)',true);
  }
  const fbt=source(lang,'894-');
  for(const [n,count] of [[1,1],[2,0],[3,1],[5,2],[7,5],[9,14]]) {
    expect(fbt,`allPossibleFBT(${n}).length`,count);
    expect(fbt,`(()=>{const roots=allPossibleFBT(${n});function shape(r){if(!r)return '#';if(r.val!==0||!!r.left!==!!r.right)throw Error('not full');return '('+shape(r.left)+shape(r.right)+')';}function size(r){return r?1+size(r.left)+size(r.right):0;}return roots.every(r=>size(r)===${n})&&new Set(roots.map(shape)).size===roots.length;})()`,true);
  }
  const simple = [
    ['98-','isValidBST(tree([2,1,3]))',true],['98-','isValidBST(tree([5,1,4,null,null,3,6]))',false],
    ['783-','minDiffInBST(tree([4,2,6,1,3]))',1],
    ['1022-','sumRootToLeaf(tree([1,0,1,0,1,0,1]))',22],
    ['129-','sumNumbers(tree([1,2,3]))',25],
    ['124-','maxPathSum(tree([-10,9,20,null,null,15,7]))',42],
    ['1448-','goodNodes(tree([3,1,4,3,null,1,5]))',4],
    ['1372-','longestZigZag(tree([1]))',0],
    ['684-','findRedundantConnection([[1,2],[1,3],[2,3]])',[2,3]],
    ['1202-','smallestStringWithSwaps("dcab",[[0,3],[1,2],[0,2]])','abcd'],
    ['1046-','lastStoneWeight([2,7,4,1,8,1])',1],
  ];
  for (const [prefix,expression,expected] of simple) expect(source(lang,prefix),expression,expected);
  for(const block of [0,1]) {
    expect(source(lang,'875-',block),'minEatingSpeed([3,6,7,11],8)',4);
    expect(source(lang,'875-',block),'minEatingSpeed([30,11,23,4,20],5)',30);
    expect(source(lang,'875-',block),'minEatingSpeed([30,11,23,4,20],6)',23);
    expect(source(lang,'475-',block),'findRadius([1,2,3],[2])',1);
    expect(source(lang,'475-',block),'findRadius([1,5],[4,2])',1);
    expect(source(lang,'475-',block),'findRadius([1],[10])',9);
    expect(source(lang,'475-',block),'findRadius([20],[10])',10);
    expect(source(lang,'778-',block),'swimInWater([[0]])',0);
    expect(source(lang,'778-',block),'swimInWater([[0,2],[1,3]])',3);
    expect(source(lang,'1104-',block),'pathInZigZagTree(14)',[1,3,4,14]);
  }
  for(const block of [0,1,2]) expect(source(lang,'662-',block),'widthOfBinaryTree(tree([1,2,3,4,5,6,7,8]))',4);
  const recovered=source(lang,'99-');
  expect(recovered,'(()=>{const r=tree([3,1,4,null,null,2]);recoverTree(r);return inorder(r);})()',[1,2,3,4]);
  const summary=source(lang,lang==='zh'?'关于二叉树的总结':'summary-of-binary-trees');
  expect(summary,'findDepthFirst(tree([1,2,3]),n=>n.val===3).val',3);
  expect(summary,'findDepthFirst(null,n=>true)',null);
  const bfs=source(lang,lang==='zh'?'关于二叉树的总结':'summary-of-binary-trees',1);
  expect(bfs,'findBreadthFirst(tree([1,2,3]),n=>n.val===9)',null);
  expect(bfs,'findBreadthFirst(tree([1,2,3]),n=>n.val===2).val',2);
}
const frequent=source('en','347-');
expect(frequent,'topKFrequent([1,1,1,2,2,3],2).sort((a,b)=>a-b)',[1,2]);
expect(frequent,'topKFrequent([-1,-1,-1,2,2,3],1)',[-1]);
for(let i=0;i<30;i++) {
  const values=Array.from({length:2+rand(10)},(_,j)=>j-5),k=1+rand(values.length);
  const nums=values.flatMap((v,j)=>Array(j+1).fill(v));
  for(let j=nums.length-1;j>0;j--){const q=rand(j+1);[nums[j],nums[q]]=[nums[q],nums[j]];}
  expect(frequent,`topKFrequent(${JSON.stringify(nums)},${k}).sort((a,b)=>a-b)`,values.slice(-k));
}
const xor=source('en','1738-');
for(let trial=0;trial<30;trial++) {
  const rows=1+rand(4),cols=1+rand(4),matrix=Array.from({length:rows},()=>Array.from({length:cols},()=>rand(32))),all=[];
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){let value=0;for(let i=0;i<=r;i++)for(let j=0;j<=c;j++)value^=matrix[i][j];all.push(value);}
  all.sort((a,b)=>b-a);
  for(let k=1;k<=all.length;k++)expect(xor,`kthLargestValue(${JSON.stringify(matrix)},${k})`,all[k-1]);
}
expect(source('en','interview-question-17-14-'),'smallestK([1,3,5,7,2,4,6,8],4).sort((a,b)=>a-b)',[1,2,3,4]);
expect(source('en','interview-question-17-14-'),'smallestK([1],0)',[]);
expect(source('en','973-'),'kClosest([[1,3],[-2,2]],1)',[[-2,2]]);
expect(source('en','863-'),'(()=>{const r=tree([3,5,1,6,2,0,8,null,null,7,4]);return distanceK(r,r.left,2).sort((a,b)=>a-b);})()',[1,4,7]);
console.log(`PASS: ${syntax} algorithm snippets parse; ${cases} output checks including inclusive ranges, heap selection, XOR edge cases, trees and bilingual examples`);
