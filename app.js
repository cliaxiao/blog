var express = require('express'),
	path = require('path'),
	favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),//用于处理和解析post请求的数据。
    settings = require('./settings'),
    routes = require('./routes/index'),
    users = require('./routes/users'),
    debug = require('debug')('my-application'), // debug模块  
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    flash = require('connect-flash'),
    multer = require('multer');//文件上传的中间件




var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 3000); // 设定监听端口  

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



/*使用 express-session 和 connect-mongo 模块实现了将会化信息存储到mongoldb中
后面可以通过 req.session 获取当前用户的会话对象，获取用户的相关信息。*/
app.use(session({
  secret: settings.cookieSecret,//防止篡改 cookie
  key: settings.db,//值为 cookie 的名字
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days 设定 cookie 的生存期
  store: new MongoStore({//tore 参数为 MongoStore 实例，把会话信息存储到数据库中，以避免丢失。
  	db:settings.db,
    url: 'mongodb://localhost/mrcroblog'
  })
}));
app.use(flash());
// set flash

app.use(function (err, req, res, next) {
  res.locals.user = req.session.user;
  res.locals.message = err.message;
  res.status(err.status || 500);
  res.render('error');
  next();
});
routes(app);


//文件上传的中间件
app.use(multer({
  dest: './public/images',
  rename: function (fieldname, filename) {
    return filename;
  }
}));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//module.exports = app;
//启动监听  
var server = app.listen(app.get('port'), function() {  
  debug('Express server listening on port ' + server.address().port);  
});  
