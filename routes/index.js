var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

var crypto = require('crypto'),
    User = require('../models/users'),
    Post = require('../models/post'),
    setting = require('../setting'),
    checkToken = require('../models/checkToken'),
    secret = setting.tokenSecret;

module.exports = function(app){
  //for parsing application/json
  app.use(bodyParser.json());
  //for parsing application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }));

  //for parsing text,text/xml
  app.use(bodyParser.text({ type: 'text/*' }));

  app.get('/', function(req, res){
    res.render('index',{ title: 'Express' });
  })
  //获取博客列表
  app.get('/get/post', function(req, res) {
    var username = null;
    //根据查询条件查询
    if(req.query.name != null){
      username = req.query.name;
    }
    //查询所有
    if(req.query.isAll){
      username = null;
    }
    Post.get(username,function(err,posts){
      if(err){posts = []};
      res.send(posts);
    })
  });
  //请求某个用户的信息 √
  app.get('/get/user', checkToken, function(req, res){
    var username = null;
    if(req.query.name != null){
      username = req.query.name;
    }
    User.get(username, function(err, users){
      if (err) {users = []}
      res.send(users);
    })
  })
  //退出登录
  app.get('/get/logout',  function(req, res){
    try{
      //退出登录,将用户信息从session中删除
      req.session.user = null;
      //销毁服务端Session
      req.session.destroy();  
      res.send({ status: 'successed', message: "登出成功！" })
    } catch(err){
      res.send({ status: 'failed', message: "出错了，原因如下：" + err })
    }
  })
  //检查是否已登录
  app.get('/get/checklogin', function(req, res){
    if(req.session['user']){
      res.send({ status: 'successed', message: "当前状态: 已登录！" ,userName:req.session.user.name});
    }else{
      res.send({ status: 'failed', message: "当前状态: 未登录！" ,userName:null});
    }
  })
  //用户注册 √
  app.post('/post/reg', function(req, res){
    var name = req.body.name,
        psd = req.body.psd,
        psd_re = req.body['psd_repeat'];
    if(psd != psd_re){
      res.send({ status: 'failed', message: "两次输入的密码不一致！" });
      return
    }
    var md5 = crypto.createHash('md5'),
        psd = md5.update(req.body.psd).digest('hex');
        var newUser = new User({
          name: name,
          password: psd,
          email: req.body.email
        });
        //检查用户名是否已存在
        User.get(name,function(err, user){
          if(err){
            res.send({status: 'error', message:"出错了，原因如下：" + err });
            return;
          }
          if(user){
            res.send({ status: 'failed', message: "用户已存在!" });
            return;
          }
          newUser.save(function(err, user){
            if(err){
              res.send({ status: 'error', message: "出错了，原因如下：" + err });
              return;
            }
            else{
              res.send({ status: 'success', message: "注册成功!" });
            }
          })
        })
  })
  //用户登录 √
  app.post('/post/login', function(req, res){
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.psd).digest('hex');
    //查询用户信息
    User.get(req.body.name,function(err, user){
      if(err){
        res.send({ status: 'error', message: "出错了，原因如下：" + err });
      }
      else if(!user){
        res.send({ status: 'failed', message: "用户不存在！" });
      }else if(user.password != password){
        res.send({ status: 'failed', message: "密码错误!" });
      }else{
        //用户名密码都匹配后，将用户信息存入 session
        //req.session.user = user;
        var userInfo = {
          name: user.name,
          password: user.password
        }
        var token = jwt.sign(userInfo, secret, { expiresIn: 60*60 })//60s * 60min = 1hour,
        console.log(token); 
        res.send({ status: 'successed', message: token});
      }
    })
  })
  //保存用户新增的文章
  app.post('/post/post', function(req, res){
    var currentUser = req.session['user'],
        post = new Post(currentUser, req.body.title, req.body.post);
    post.save(function(err){
      if (err) {
        res.send({ status: 'failed', message: "出错了，原因如下：" + err });
      }else{
        res.send({ status: 'successed', message: "保存成功！" });
      }
    })
  })
  //解决跨域的问题
  app.all('*',function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers','Content-Type, Content-Length,'
     + 'Authorization, Accept, X-Requested-With');

    //res.setHeader("Access-Control-Max-Age", "3600");
    //是否支持cookie跨域
    res.setHeader("Access-Control-Allow-Credentials", "true"); 
    next();
  });
  app.all('/get/*', function(req, res, next){
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if(req.method == 'OPTIONS'){
      res.send(200);
    }else{
      console.log(req.method);
      next();
    }
  });
  app.all('/post/*', function(req, res, next){
    //res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    if(req.method == "OPTIONS"){
      res.send(200);
    }else{
      console.log(req.method);
      next();
    }
  });
}