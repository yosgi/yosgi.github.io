---
draft: false
original: content/zh/post/legacy/Javascript排序算法.md
title: Javascript sorting algorithm
description: Javascript algorithm sorting algorithm
categories:
- JavaScript
tags:
- JavaScript
- JavaScript
date: 2018-06-25 18:48:42
summary: ''
---

## Bubble Sort

Bubble sort compares any two adjacent items and swaps them if the first is greater than the second. The items move upward into the correct order, much like bubbles rising to the surface, hence the name.```javascript
var bubbleSort = function (array) {
    function swap(index1,index2){
        var aux = array[index1];
        array[index1] = array[index2];
        array[index2] = aux; 
    }
     for (let i = 0; i < array.length; i++) {
     // The outer loop will iterate from the first to the last position in the array, controlling how many rounds the array goes through.
        for (let j = 0; j < array.length-1; j++) {
        // The inner loop iterates from the first to the second to last item, comparing and exchanging the current item and the next item.
           if(array[j] > array[j+1]){
                swap(j,j+1);
           }
        }
    }
    return array
}
```It is the simplest of all sorting algorithms. However, from a running time perspective, bubble sort is the worst.```javascript
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
```If we perform bubbleSort on an array of size 10, the cost is 100, so the complexity is O(n^2)

Notice that by the time the algorithm executes the second pass through the outer loop, the numbers 4 and 5 are already correctly sorted. They are still being compared in subsequent comparisons, even though this is unnecessary. Therefore, we can improve the bubble sort algorithm slightly.```javascript
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
```The cost of an array of size 5 is 15 and the complexity is O(n^2-(1+2+..+n))

## Selection Sort

The selection sort algorithm is an in-place comparison sort algorithm. The general idea behind selection sort is to find the smallest value in the data structure and place it first, then find the second smallest value and place it second, and so on.```javascript
var swap = function(array,index1,index2) {
[array[index1],array[index2]] =  [array[index2],array[index1]]
}
var  selectionSort  = function(array) {
    for(let i=0;i<array.length; i++ ) {
        // After each outer loop, the i-th item is the smallest item in the array after i.
        let minIndex = i
        for(let j=i ; j<array.length ; j++) {
            if(array[minIndex] > array[j] ) {
                swap(array,minIndex,j)
            }
        }
    }
    return array
}
```Selection sort is also an O(n²) algorithm. Like bubble sort, it involves two nested loops, resulting in a quadratic complexity.

Insertion Sort

Insertion sort constructs the final sorted array by sorting one item at a time. Assuming the first item is already sorted, and then it is compared to the second item, should the second item remain in its original position or be inserted before the first?

If it is before, then the first item should be moved back one position, if it is after, then it should not be moved.

This way, the first two items are correctly sorted and can be compared with the third item, and so on.```javascript
var insertionSort = function(array){
    var length = array.length;
    for(let i=1;i<length;i++){
        // The first item of the array is sorted by default
        var temp = array[i];
        // Insert a new item and sort
        var j = i;
        // If the previous item is larger than the newly inserted one, move it back one position.
        while(j>0&&array[j-1]>temp){
            array[j] = array[j - 1];
            j--
        }
        array[j]  =  temp;
    }
    return array
}
```The complexity is O(n-1+(2+3+..n-1)).
This algorithm performs better than selection sort and bubble sort when sorting small arrays.

## Merge Sort

Merge sort is a divide-and-conquer algorithm. The idea is to split the original array into smaller arrays until each small array has only one position, and then merge the small arrays into larger arrays until there is only one sorted large array.

Because the leftmost of the two sorted arrays is always the smallest, and the array with only one item left is already sorted, the final large array is also sorted.```javascript
var merge = function(left,right){
    // It is responsible for merging and sorting small arrays to generate large arrays until the original array is returned and sorted.
    var result = [],il=0,ir=0;
    // Compares whether the items from the left array are smaller than the items from the right array
    while(il<left.length&&ir<right.length){
        // If so, add the item from the left array to the merged result array
        if(left[il]<right[ir]){
            // and increment the control variable of the iteration array (
            result.push(left[il++])
        }else{
            // Otherwise, add the item from the right array and increment the control variable of the corresponding iteration array
            result.push(right[ir++])
        };
    }
    // Next, all remaining items in either the left or right array are added to the merged array.
    while(il<left.length){
        result.push(left[il++]); 
    }
    while (ir < right.length){ // {12}
        result.push(right[ir++]);
    } 
    return result
};
var mergeSortRec = function(array){
    // Recurse the large array down to an array with only one item, since it is already sorted.
    var length = array.length;
    if(length==1){
        return array
    }
    var mid = Math.floor(length/2),
    left =  array.slice(0,mid),
    right = array.slice(mid,length);
    console.log(left,right)
    // In order to continuously divide the original array into small arrays, we have to recursively call mergeSortRec on the left array and the right array again, and pass them as parameters to the merge function.
    return merge(mergeSortRec(left),mergeSortRec(right));
}
```Merge sort is a sorting algorithm that can be used in practice. Merge sort has good performance and its complexity is O(nlog^n).

## Quick sort

Let's first look at a civilian version of quick sort```javascript
var quickSort = function(arr){
    if(arr.length<=1){
        return arr;
    }
    var pivotIndex = Math.floor((arr.length-1)/2);
    var pivot  = arr[pivotIndex];
    // The original code uses splice,
    // In v8, splice has a time complexity of O(n), so let's change it back.
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
```You can see that the quick sort process is three steps

1. Select an element in the dataset as the "pivot."
2. Move all elements smaller than the pivot to the left of the pivot; move all elements larger than the pivot to the right of the pivot.
3. Repeat steps 1 and 2 for the subsets to the left and right of the pivot until all subsets contain only one element.

[Quick Sort](http://www.ruanyifeng.com/blog/2011/04/quicksort_in_javascript.html)

The problem with the above sorting method is that each recursion requires opening two temporary arrays, which increases the space complexity. However, it is helpful for understanding quick sort;```javascript
var swap = function (arr,i,j) {
    [arr[i],arr[j]] = [arr[j],arr[i]]
}
var quickSort = function (arr, left, right) {
    if (left >= right) return 
    // Based on the leftmost item
    var base = arr[left];
    var i = left , j = right;
    while(i < j ) {
        // When the left side is the reference, j needs to change first, which is very important.
        // This ensures that when the number is finally returned, the number moved to the left is smaller than the reference number.
        while(i < j && arr[j] >= base) {
            j--
        }
        while (i < j && arr[i] <= base) {
            i++
        }
        // j finds a number smaller than the base, i finds a number larger than the base
        if (i<j) {
            swap(arr, i, j)
        }
    }
    // I call this step "returning to the original position", which is to swap the benchmark with the last smaller number found (which may be itself).
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
