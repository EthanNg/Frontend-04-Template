# 学习笔记

1.class-01-实现一个TicTacToe游戏
2.class-02-给游戏添加一个完美的AI

## 技巧

1. 借助 label 可以选择 break 指定的 loop

   ```javascript
   outer: for (let i = 0; i < 3; i++) {
     for (let j = 0; j < 3; j++) {
       if (condition) {
         break outer;
       }
     }
   }
   ```

   

2. 通过 Object.create 和一个旧的一维数组 old_arr 创建新的一维数组 new_arr，new_arr 可以继承 old_arr 的 prototype。当对 new_arr 进行改变时，不会影响到 old_arr。若尝试获取未自定义的索引，会通过原型链去从 old_arr 中取。

   ```javascript
   var old_arr = [0, 1, 2];
   console.log(old_arr); // [0, 1, 2]
   
   var new_arr = Object.create(old_arr);
   console.log(new_arr); // [0, 1, 2]
   
   new_arr[1] = 3;
   console.log(old_arr); // [0, 1, 2]
   console.log(new_arr); // [0, 3, 2]
   
   old_arr[2] = 4;
   console.log(old_arr); // [0, 1, 4]
   console.log(new_arr); // [0, 3, 4]
   ```
