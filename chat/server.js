
//express  node.js中管理路由响应请求的模块，根据请求的URL返回相应的HTML页面

var express = require("express"),
    app = express(),
    httpserver = require("http").createServer(app),
    io = require("socket.io")(httpserver);

app.use("/", express.static(__dirname));

httpserver.listen(process.env.PORT || 3000);


var auserlist = [];

//io.on('connection', function (socket) {
io.sockets.on('connection', function (socket) {
    
    console.log('有人通过socket连接进来了');
    
    //socket.emit('hello', "欢迎你");
    
    //用户登录
    socket.on('login', function (data) {
        var j = 0;
        for (var i = 0; i < auserlist.length; i++) {
            if (data.name == auserlist[i].name) {
                j++;
                break;
            }
        }
        if (j > 0) {
            socket.emit('loginerr', "用户名称重复");
        }
        else {
            socket.username = data.name;
            socket.userid = data.userid;
            socket.userobj = data;
            socket.emit('loginsuess', auserlist);
            socket.broadcast.emit('loginopen', data);
            auserlist.push(data);
        }
    });
    
    //接收用户消息 通知除自己以外的所有人  
    socket.on('msg', function (user, txt) {
        var date = new Date(),
            m = (date.getMonth() + 1),
            d = date.getDate(),
            h = date.getHours(),
            mm=date.getMinutes(),
            s = date.getSeconds();
        m = m < 10 ? "0" + m : m;
        d = d < 10 ? "0" + d : d;
        h = h < 10 ? "0" + h : h;
        mm = mm < 10 ? "0" + mm : mm;
        s = s < 10 ? "0" + s : s;
        var getdate = date.getFullYear() + "/" + m + "/" + d + " " + h + ":" + mm + ":" + s;
        socket.broadcast.emit('msg', user, txt, getdate);
    });

    //断开连接的事件  
    socket.on('disconnect', function () {
        for (var i = 0; i < auserlist.length; i++) {
            if (socket.userid == auserlist[i].userid) {
                auserlist.splice(i, 1);
                break;
            }
        }
        //通知除自己以外的所有人  
        socket.broadcast.emit('loginout', socket.username);
    });
    

    //io.sockets.emit('system', nickname);  向所有用户发送请求

});
