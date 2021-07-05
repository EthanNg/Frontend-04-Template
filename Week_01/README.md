# 目录
> 1.class-01-实现一个TicTacToe游戏
>> (+*) 实现UI

> 2.class-02-给游戏添加一个完美的AI
>> (+*) 策略：对方最好的策略，就是我方最差的策略
>>> (+*) 第一层：我要赢
>>> (+*) 第二层：别输
>>> (+*) 第三层：...
>>> (+*) 棋谱

# 学习笔记
## 技巧

1. 借助label可以选择break指定的loop

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
> 用途：将棋盘从二维数组变为一维数组，那么此时我们的复制就可以使用以上方法去复制，它不仅继承了数据，也继承了方法。

> 反过来说，是否更复杂的类型就不适合使用 Object.create 来复制了？