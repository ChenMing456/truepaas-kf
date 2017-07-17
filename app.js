var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debug = require('debug')('truepaas-kf:server');
var http = require('http');
var multipart=require('connect-multiparty');
var session = require('express-session');

var mongoose=require('mongoose');
mongoose.Promise = global.Promise;
var db=mongoose.connect('mongodb://localhost:27017/imooc', {useMongoClient:true});
db.on('error',console.error.bind(console,'mongodb connection error'));
db.once('open',function(callback){
    console.log('mongodb connect successfully!');
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(multipart());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//specify the html we will use
app.use(express.static(path.join(__dirname,'public')));
app.use('/chat', express.static(__dirname + '/www'));
app.use('/admin', express.static(__dirname + '/admin'));

app.use(session({
    secret: 'my-secret',
    resave: false,
    cookie: {maxAge: 36000000 },  //设置maxAge是36000000ms，即3600s后session和相应的cookie失效过期
    saveUninitialized: true
}));

app.use(function(req,res,next){
    if (!req.session.admin) {
        if(req.originalUrl.indexOf('/admin/') === -1){
            next();//如果请求的地址是登录则通过，进行下一个请求
        } else {
            if(req.originalUrl !== '/admin/new/login') {
                res.statusCode = 302;
                res.send('unauthorized');
                return ;
            }
            next();
        }
    } else {
        next();
    }
});

require('./config/route')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

var debug = require('debug')('truepaas-kf:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
/**
 * socket 监听
 */

var io = require('socket.io').listen(server);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

var users = [];
var userId = {};
var toChat = {};
var arrAllSocket = [];
io.sockets.on('connection', function(socket) {
    socket.on('connect', function(obj) {
        console.log('Server接受了一个connect的消息');
        console.log('role:'+obj.role);
        if(obj.role==='user'){
            socket.role = 'user';
            socket.join(obj.fromid);

            if(io.sockets.manager.rooms['/'+obj.fromid].length==2){
                console.log('用户刷新后进入到房间内：'+JSON.stringify(io.sockets.manager.rooms));
                console.log('聊天室:'+'/'+obj.fromid+'   '+io.sockets.manager.rooms['/'+obj.fromid]);
                obj.roomid = obj.fromid;
                console.log('obj.roomid:'+obj.roomid);
                io.sockets.in(obj.toid).emit('newRoom',obj);
            }
            console.log('user分组完成');
        }
        else if(obj.role==='admin'){
            socket.role = 'admin';
            console.log('admin分组完成');
        }
        // socket._name = obj.fromid;
        // arrAllSocket.push({name:obj.fromid,socket:socket});
        console.log('Socket的数量:'+io.sockets.manager.rooms[""].length);
        // }
        // arrAllSocket.forEach(function(item){
        //   console.log('arrAllSocket：'+item.name);
        // })

    });
    //user leaves
    socket.on('disconnect', function() {
        console.log('server 判断 用户 下线!');
        if(socket.role == 'user'){
            // io.sockets.manager.rooms['/'+socket._name] = [];
        }
        //console.log('Sever接受了disconnect事件：'+arrAllSocket.length);
    });
    //处理客服与一个用户创建聊天室
    socket.on('join', function(obj) {

        console.log('server:'+JSON.stringify(obj));
        obj.flag = false;
        // if(!obj.fromid && !obj.toid){
        //console.log('aaaa:'+arrAllSocket.length);
        // arrAllSocket.forEach(function(item){
        // console.log('item:'+item.name);
        // if(item.name===obj.toid){
        //   obj.flag = true;
        //   item.socket.join(obj.toid);
        //   console.log('聊天室:'+obj.toid+'被创建');
        //   console.log(obj.toid+'加入:'+obj.toid+'聊天室');
        // }


        //if(io.sockets.manager.rooms['/'+obj.toid].length>0){
        if(obj.toid){
            obj.flag = true;
            socket.join(obj.toid);
            console.log(obj.fromid+'加入:'+obj.toid+'聊天室');
            console.log('聊天有几个:'+JSON.stringify(io.sockets.manager.rooms));
            obj.roomid = obj.toid;
            console.log('obj.roomid:'+obj.roomid);
            io.sockets.in(obj.toid).emit('newRoom',obj);
        }
        //}
        // })
        //if(io.sockets.manager.rooms['/'+obj.toid].length==2){

        //}


    });
    socket.on('userJoin',function(obj){
        //console.log('用户刷新后进入到房间内：'+obj.roomid+'  '+JSON.stringify(io.sockets.manager.rooms));
        // socket.join(obj.roomid);
        // console.log('用户刷新后进入到房间内：'+obj.roomid+'  '+JSON.stringify(io.sockets.manager.rooms));
    })
    //接收留言
    socket.on('postMsg', function(obj, color) {
        console.log('Server接受了一个postMsg的消息'+obj);
        obj.fromid = 'server';
        obj.msg = '留言成功！';
        socket.emit('newMsg',obj);

    });
    socket.on('private_msg', function(obj) {
        console.log('server收到了private_msg:'+JSON.stringify(obj));
        console.log('private_msg  聊天室:'+'/'+obj.roomid+'   '+io.sockets.manager.rooms['/'+obj.roomid]);
        socket.broadcast.to(obj.roomid).emit('newMsg', obj);
    })
});

