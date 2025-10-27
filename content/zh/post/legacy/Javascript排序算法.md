---
title: Javascript排序算法
description: Javascript算法 排序算法
categories:
  - JavaScript
tags:
  - JavaScript
  - JavaScript
date: 2018-06-25 18:48:42
summary: ""
---
## 冒泡排序

冒泡排序比较任何两个相邻的项，如果第一个比第二个大，则交换它们。元素项向上移动至确的顺序，就好像气泡升至表面一样，冒泡排序因此得名。

```javascript
var bubbleSort = function (array) {
    function swap(index1,index2){
        var aux = array[index1];
        array[index1] = array[index2];
        array[index2] = aux; 
    }
     for (let i = 0; i < array.length; i++) {
     //外循环会从数组的第一位迭代到最后一位，控制了数组经过了多少轮排序
        for (let j = 0; j < array.length-1; j++) {
        //内循环从第一位迭代到倒数第二位，进行当前项和下一项的比较和交换
           if(array[j] > array[j+1]){
                swap(j,j+1);
           }
        }
    }
    return array
}
```

它在所有排序算法中最简单。然而，
从运行时间的角度来看，冒泡排序是最差的一个，

```javascript
var bubbleSort = function (array) {
    function swap(index1,index2){
        var aux = array[index1];
        array[index1] = array[index2];
        array[index2] = aux; 
    }
    var cost = 0; 
     for (let i = 0; i < array.length; i++) {
        cost ++;
        for (let j = 0; j < array.length-1; j++) {
            cost++; 
           if(array[j] > array[j+1]){
                swap(j,j+1);
           }
        }
    }
    console.log('cost for bubbleSort with input size ' + array.length + ' is' + cost);
}
bubbleSort([5, 4, 3, 2, 1])//cost for bubbleSort with input size 5  is 25
```

如果用大小为10的数组执行bubbleSort，开销是 100，所以复杂度是O(n^2)

注意当算法执行外循环的第二轮的时候，数字4和5已经是正确排序的了。在后续
比较中，它们还一直在进行着比较，即使这是不必要的。因此，我们可以稍稍改进一下冒泡排序
算法。

```javascript
var bubbleSort = function (array) {
    function swap(index1,index2){
        var aux = array[index1];
        array[index1] = array[index2];
        array[index2] = aux; 
    }
    var cost = 0; 
     for (let i = 0; i < array.length; i++) {
        cost ++;
        for (let j = 0; j < array.length-1-i; j++) {
            cost++; 
           if(array[j] > array[j+1]){
                swap(j,j+1);
           }
        }
    }
   
    console.log('cost for bubbleSort with input size ' + array.length + ' is' + cost);
}
bubbleSort([5, 4, 3, 2, 1])////cost for bubbleSort with input size 5  is 15
```

大小为5的数组开销为15 复杂度是O(n^2-(1+2+..+n))

## 选择排序

选择排序算法是一种原址比较排序算法。选择排序大致的思路是找到数据结构中的最小值并
将其放置在第一位，接着找到第二小的值并将其放在第二位，以此类推。

```javascript
var swap = function(array,index1,index2) {
[array[index1],array[index2]] =  [array[index2],array[index1]]
}
var  selectionSort  = function(array) {
    for(let i=0;i<array.length; i++ ) {
        // 外层每一次循环结束后 第i个都是i之后数组项中的最小
        let minIndex = i
        for(let j=i ; j<array.length ; j++) {
            if(array[minIndex] > array[j] ) {
                swap(array,minIndex,j)
            }
        }
    }
    return array
}
```

选择排序同样也是一个复杂度为O(n2)的算法。和冒泡排序一样，它包含有嵌套的两个循环，
这导致了二次方的复杂度。

## 插入排序

插入排序每次排一个数组项，以此方式构建最后的排序数组。假定第一项已经排序了，接着，
它和第二项进行比较，第二项是应该待在原位还是插到第一项之前呢？

如果是之前，那么第一项应该向后移动一个位置，如果是之后，那么不用动。

这样，头两项就已正确排序，接着和第三项比较，以此类推。

```javascript
var insertionSort = function(array){
    var length = array.length;
    for(let i=1;i<length;i++){
        //数组的第一项默认已经排序好
        var temp = array[i];
        //插入新的一项并排序
        var j = i;
        //如果之前的项大于新插入的则向后移动一位
        while(j>0&&array[j-1]>temp){
            array[j] = array[j - 1];
            j--
        }
        array[j]  =  temp;
    }
    return array
}
```

复杂度为O(n-1+(2+3+..n-1))
排序小型数组时，此算法比选择排序和冒泡排序性能要好。

## 归并排序

归并排序是一种分治算法。其思想是将原始数组切分成较小的数组，直到每个小数组只有一个位置，接着将小数组归并成较大的数组，直到最后只有一个排序完毕的大数组。

因为已经排序好的两个数组 处于数组最左边的总是最小的，而只剩一项的数组是已经排序好的数组，
所以最后的大数组也是排序完毕的

```javascript
var merge = function(left,right){
    //它负责合并和排序小数组来产生大数组，直到回到原始数组并已排序完成
    var result = [],il=0,ir=0;
    //比较来自left数组的项是否比来自right数组的项小
    while(il<left.length&&ir<right.length){
        //如果是，将该项从left数组添加至归并结果数组
        if(left[il]<right[ir]){
            //并递增迭代数组的控制变量（
            result.push(left[il++])
        }else{
            //否则，从right数组添加项并递增相应的迭代数组的控制变量
            result.push(right[ir++])
        };
    }
    //接下来，将left数组或者right数组所有剩余的项添加到归并数组中。
    while(il<left.length){
        result.push(left[il++]); 
    }
    while (ir < right.length){ // {12}
        result.push(right[ir++]);
    } 
    return result
};
var mergeSortRec = function(array){
    //将大数组递归至只有一项的数组，因为它已排序了。
    var length = array.length;
    if(length==1){
        return array
    }
    var mid = Math.floor(length/2),
    left =  array.slice(0,mid),
    right = array.slice(mid,length);
    console.log(left,right)
    //为了不断将原始数组分成小数组，我们得再次对left数组和right数组递归调用mergeSortRec，并同时作为参数传递给merge函数。
    return merge(mergeSortRec(left),mergeSortRec(right));
}
```

归并排序是可以被实际使用的排序算法，归并排序性能不错，其复杂度为O(nlog^n)。

## 快速排序

先看一下一个平民版的快速排序

```javascript
var quickSort = function(arr){
    if(arr.length<=1){
        return arr;
    }
    var pivotIndex = Math.floor((arr.length-1)/2);
    var pivot  = arr[pivotIndex];
    //原代码用的splice,
    //在v8中splice是时间复杂度为O(n),先不管了改回来
    var left = [];
    var right = [];
    for(var i=0;i<arr.length;i++){
        if(i!=pivotIndex){
            if(arr[i]<pivot){
                left.push(arr[i])
            }else{
                right.push(arr[i])
            }
        }
    } 
    return quickSort(left).concat([pivot],quickSort(right))
}
var arr = quickSort([85, 24, 63, 45, 17, 31, 96, 50])
//[17, 24, 31, 45, 50, 63, 85, 96]
```

可以看到快速排序的过程是三步

1. 在数据集之中，选择一个元素作为”基准”（pivot）。
2. 所有小于”基准”的元素，都移到”基准”的左边；所有大于”基准”的元素，都移到”基准”的右边。
3. 对”基准”左边和右边的两个子集，不断重复第一步和第二步，直到所有子集只剩下一个元素为止。

[快速排序](http://www.ruanyifeng.com/blog/2011/04/quicksort_in_javascript.html)

上面排序方法的的问题是每次递归都需要开了2个临时数组，导致了空间复杂度增大。不过对于快速排序的理解是有帮助的；

```javascript
var swap = function (arr,i,j) {
    [arr[i],arr[j]] = [arr[j],arr[i]]
}
var quickSort = function (arr, left, right) {
    if (left >= right) return 
    // 以最左边的项为基准
    var base = arr[left];
    var i = left , j = right;
    while(i < j ) {
        // 左边为基准时j需要先变，这点很重要。
        // 这样才能保证最后归位时，被移动到左边的是小于基准的数
        while(i < j && arr[j] >= base) {
            j--
        }
        while (i < j && arr[i] <= base) {
            i++
        }
        // j找到比基准小的数，i找到比基准大的数
        if (i<j) {
            swap(arr, i, j)
        }
    }
    // 这一步我叫它归位，讲基准和最后找到的比它小的数对换（可能是本身）
    if (i == j) {
        swap(arr,j,left)
    }
    quickSort(arr,left,j-1)
    quickSort(arr,j+1,right)
}

var arr = [3,1,2,6,3,6,7,1,8,3,1,6,78,8,9,19,23,432,1]
var sortFunc = function (arr) {
    var left = 0 ,right = arr.length - 1
    quickSort(arr,left,right)
    return arr
}
```

