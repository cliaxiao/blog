var express = require('express');
var router = express.Router();

module.exports = function(app) {
	/* GET home page. */
	app.get('/', function(req, res, next) {
    	res.render('index', { title: 'Express123dsfffgsfdg', success: 'asfdf', po: user });
  	});
 	app.get('/login', function(req, res, next) {
    	res.render('login', { 
      	title: '用户登陆',
   // user: req.session.user,
      	success: req.flash('success').toString(),
      	error: req.flash('error').toString()});
 	 });

	app.post('/login', function(req, res, next) {
	    var md5 = crypto.createHash('md5'),
	        password = md5.update(req.body.password).digest(hex);
	    User.get(req.body.username, function(err, user) {
	      if(!user) {
	       req.flash('error', '用户不存在');
	       return res.redirect('/login');
	     }

	     if(user.password != password) {
	       req.flash('error', '密码错误');
	       return res.redirect('/login');      
	      }
	    });
	   req.session.user = user;
	   req.flash('success', '登陆成功！');
	   res.redirect('/');
	 });

  /* register */
	app.get('/register', function(req, res, next) {
	    res.render('register', { 
	    	title: '注册',
	   		user: req.session.user,
	        success: req.flash('success').toString(),
	        error: req.flash('error').toString()
	   });
	 });

	app.post('/register', function(req, res, next) {
	    //检验用户密码以及确认密码是否一致
	    if(req.body.password != req.body.password-confirm) {
	      req.flash('error', "两次输入的密码不一致");
	      return res.redirect('/register');
	    }
	    //生成密码的散列值
	    var md5 = crypto.createHash('md5');
	    var password = md5.update(req.body.password).digest('base64');

	    //新建一个用户
	    var newUser = new User({
	      username: req.body.username,
	      password: password
	    });

	  //检查用户名是否已经存在
	    User.get(newUser.username, function(err, user) {
	      if(user) {
	        err = "Username already exists";
	      }
	      if(err) {
	        req.flash('error', err);
	        return res.redirect('/register');
	      }

	    //如果用户不存在则新增用户
	      newUser.save(function(err) {
	        if(err) {
	          req.flash('error', err);
	          return res.redirect('/register');
	        }
	        req.session.user = newUser;
	        req.flash('success', '注册成功');
	        res.redirect('/');
	      });
	    });
	});

  /* logout */
	app.get('/logout', function(req, res, next) {
	    req.session.user = null;
	    req.flash('success', '登出成功!');
	    res.redirect('/');
	  });

	  router.get('/home', function(req, res, next) {
	    var users = {
	      username: 'admin',
	      password: 'admin'
	    }
	    res.render('home', {title: 'Home', users: users});
	});
}
