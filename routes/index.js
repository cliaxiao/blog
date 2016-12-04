var express = require('express'),
    router = express.Router(),
    crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js');



module.exports = function(app) {
	/* GET home page. */
  app.get('/', function(req, res) {
    //判断是否是第一页，并把请求的页数转换成number类型
    var page = req.query.p ? parseInt(req.query.p) : 1;//req.query.p 获取的页数为字符串形式
    //查询并返回第page页的10篇文章
  	Post.getAll(null, page, function(err, posts, total) {
  		if(err) {
  			posts = [];
  		}
  		res.render('index',
  		{ 
  			title: '主页',
  			user: req.session.user,
  			success: req.flash('success').toString(),
  			error: req.flash('error').toString(),
  			posts:  posts,
       // isFirstPage: (page - 1) == 0,
        pageNum: (total % 10 == 0) ? (total / 10) : (total / 10 + 1),//计算一共有多少页（total是所有文章的总和）
        //isLastPage: ((page - 1) * 10 + posts.length) == total,
  		});
  	});

  });

  /* login */
  app.get('/login', checkNotLogin);
  app.get('/login', function(req, res) {
    res.render('login', { 
      title: '用户登陆',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  app.post('/login', function(req, res) {
    var md5 = crypto.createHash('md5'),//创建并返回一个hash对象，它是一个指定算法的加密hash，用于生成hash摘要
        password = md5.update(req.body.password.toString()).digest('hex');//更新hash的内容为指定的data,计算所有传入数据的hash摘要
    User.get(req.body.username, function(err, user) {
    	//检查用户是否存在
      if(!user) {
       req.flash('error', '用户不存在');
       return res.redirect('/login');
     }

     //检查密码是否一致
     if(user.password != password) {
       req.flash('error', '密码错误');
       return res.redirect('/login');      
      }

          //用户名密码都匹配后，将用户信息存入session
    req.session.user = user;
    req.flash('success', '登陆成功！');
   	res.redirect('/');
    });
  });

  /* register */
  app.get('/register', function(req, res) {
    res.render('register', { 
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
   });
  });

  app.post('/register', function(req, res) {
    //检验用户密码以及确认密码是否一致
    if(req.body.password != req.body['password-confirm']) {
        req.flash('error', "两次输入的密码不一致");
        return res.redirect('/register');
    }
    //生成密码的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password.toString()).digest('hex');
    
    //新建一个用户
    var newUser = new User({
      username: req.body.username,
      password: password,
      email: req.body.email
    });
  //检查用户名是否已经存在
    User.get(newUser.username, function(err, user) {
    	//console.log(user)
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
        res.redirect('/');//重定向
      });
    });
  });

  /* logout */
  app.get('/logout', checkLogin);
  app.get('/logout', function(req, res) {
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');
  });

  /*post*/
  app.get('/post', checkLogin);
  app.get('/post', function(req, res) {
    res.render('post', {
    	title: '发表',
    	user: req.session.user,
      success: req.flash('success').toString(),
     	error: req.flash('error').toString()
    });
  });
  app.post('/post', checkLogin);
  app.post('/post', function(req, res) {
  	var curUser = req.session.user,
  	    postArticle = new Post(curUser.username, req.body.title, req.body.post);
  	    postArticle.save(function(err) {
  	    	if(err) {
  	    		req.flash('error', err);
  	    		return res.redirect('/');
  	    	}
  	    	req.flash('success', '发布成功！');
  	    	res.redirect('/')
  	    });
  });

  //上传文件
  app.get('/upload', checkLogin);
   console.log('21435')
  app.get('/upload', function(req, res) {
    res.render('upload', {
      title: '文件上传',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()

    })
  })
  app.post('/upload', function(req, res) {
    req.flash('success', '文件上传成功!');
    res.redirect('/upload');

  });
  function checkLogin(req, res, next) {
 	if(!req.session.user) {
 		req.flash('error', '请登录后再进行操作！');
 		res.redirect('/login');
 	}
 	next();
 }

 	function checkNotLogin(req, res, next) {
 		if(req.session.user) {
 			req.flash('error', '已登录！');
 			res.redirect('back');
 		}
 		next();
 	}

};
