公共UI一般需要同时包含：duoui.css和duoui.js

## 常用方法

### 点触事件：duoui.touch(elem, child, callback);
可兼容触屏和非触屏模式，如果设备不支持触屏，即以click处理。（该方法依赖Zepto）

1. elem元素选择器或Zepto DOM对象
1. child为子元素选择器（可选，用于事件委托）

例子

    duoui.touch('.list', function(){
        console.log(this); //list元素
    })
    
### URL参数反系列化：duoui.unparam(search)
search参数可选

例子，假设当前页面：http://m.fine3q.com/event/test/bridge.html?id=123&origin=1

    var = param = duoui.unparam(); 
    //得到{id: 123,origin: 1}    
    
### 将普通对象按某个key重新排序：duoui.sort(data, key, asc)
1. data为原始对象
1. key为排序参考键
1. asc为排序规则，默认升序

### 返回当前时间的多久前：duoui.time(timestamp, brief)
1. timestamp时间戳
1. brief，超过30天后，是否只返回年月日

### 本地存储：duoui.data(key, value)
数据是存储在一个名为duoui的公共key中。

1. 如果只传一个key，即返回对应的value
1. 如果传了key、value，即设置一个localStorage
1. remove 为true，清空一个key


    duoui.data('user'); //取一个key的值
    duoui.data('user', {id: 123}); //设置一个key的值
    duoui.data('user', undefined); //清空一个key
