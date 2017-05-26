/* require()加载了express、path等模块,
以及routes文件夹下的index. js和users.js路由文件*/
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// var session = require('express-session');
// var MongoStore = require('connect-mongo')(session);

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

/*设置views文件夹为存放视图文件的目录,即存放模板文件的地方
,__dirname为全局变量,存储当前正在执行的脚本所在的目录。*/
app.set('views', path.join(__dirname, 'views'));

//设置视图模板引擎为ejs
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//设置/public/favicon.ico为favicon图标。
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//加载日志中间件
app.use(logger('dev')); 
//加载解析json的中间件
app.use(bodyParser.json()); 
//加载解析urlencoded请求体的中间件
app.use(bodyParser.urlencoded({ extended: false })); 
//加载解析cookie的中间件
app.use(cookieParser()); 
//设置public文件夹为存放静态文件的目录。
app.use(express.static(path.join(__dirname, 'public'))); 

// app.use(session({
//     secret: 'myblog',
//     resave: false, //重新保存：强制会话保存即使是未修改的
//     saveUninitialized: true, //强制“未初始化”的会话保存到存储。
//     store: new MongoStore({
//         url:'mongodb://'+settings.host+":"+settings.port+'/'+settings.db,
//         ttl: 20 * 60
//     })
// }));

//路由控制器
index(app);

// catch 404 and forward to error handler
//捕获404错误，并转发到错误处理器
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // 开发环境下的错误处理器，将错误信息渲染error模版并显示到浏览器中
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  //生产环境下的错误处理器，将错误信息渲染error模版并显示到浏览器中
  res.status(err.status || 500);
  res.render('error');
});

//导出app实例供其他模块调用
module.exports = app;
