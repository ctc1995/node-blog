var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var multer = require('multer');

var crypto = require('crypto'),
    User = require('../models/users'),
    Product = require('../models/product'),
    Img = require('../models/img'),
    qiniuToken = require('../models/qiniuToken'),
    setting = require('../setting'),
    checkToken = require('../models/checkToken'),
    secret = setting.tokenSecret;

module.exports = function(app){
  //解决跨域的问题
  app.all('*',function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers','Content-Type, Content-Length,'
     + 'Authorization, Accept, X-Requested-With');

    res.setHeader("Access-Control-Max-Age", "3600");
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
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    if(req.method == "OPTIONS"){
      res.send(200);
    }else{
      console.log(req.method);
      next();
    }
  });
  //for parsing application/json
  app.use(bodyParser.json());
  //for parsing application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }));
  //for parsing text,text/xml
  app.use(bodyParser.text({ type: 'text/*' }));
  //图片上传
  var storage = multer.diskStorage({
    // destino del fichero
    destination: function (req, file, cb) {
      cb(null, './uploads/')
    },
    // renombrar fichero
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });
  var upload = multer({ storage: storage });
  app.post("/post/img", upload.array("uploads[]", 12), function (req, res) {
    var sendToken = [];
    var send = true;
    var sendError;
    for(var i =0; i<req.files.length; i++){
      console.log('./uploads/',req.files[i].filename,66);
      var fileName = req.files[i].filename;
      var uploadInfo = new qiniuToken(req.files[i].filename);
      var newImg = new Img(
        fileName,
        'http://omly572p2.bkt.clouddn.com/'+fileName+'-img1',
        "jpg",
        "first"
      );
      console.log(newImg);
      newImg.save(function(err, img){
        if(err){
          send = false;
          sendError = err;
        }
        else{
          console.log("save DB success!")
          uploadInfo.uptoken(function(token){
            sendToken.push(token)
            console.log(token);
            uploadInfo.uploadFile(token, fileName, './uploads/'+fileName, function(err, ret){
              if(err){
                send = false;
                sendError = err;
                console.log(err,1)
              }
              else{
                sendToken.push(ret);
                console.log(ret,2)
                res.send(200, {link: 'http://omly572p2.bkt.clouddn.com/'+fileName+'-img1'});
              }
            })
          })
        }
      })
    } 
    if(send){
      
    }else{
      res.send(500, sendError)
    }
  });
  app.get('/', function(req, res){
    res.render('index',{ title: 'Express' });
  })
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
      res.send(200, "登出成功！" )
    } catch(err){
      res.send(500, "出错了，原因如下：" + err )
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
      res.send(500, "两次输入的密码不一致！" );
      return
    }
    var md5 = crypto.createHash('md5'),
        psd = md5.update(req.body.psd).digest('hex');
        var newUser = new User({
          name: name,
          password: psd,
          email: req.body.email
        });
        console.log(newUser);
        //检查用户名是否已存在
        User.get(name,function(err, user){
          if(err){
            res.send(500, "出错了，原因如下：" + err );
            return;
          }
          if(user){
            res.send(500,  "用户已存在!" );
            return;
          }
          newUser.save(function(err, user){
            if(err){
              res.send(500, "出错了，原因如下：" + err );
              return;
            }
            else{
              res.send(200, "注册成功!" );
            }
          })
        })
  })
  //用户登录 √
  app.post('/post/login', function(req, res){
    //res.header("Access-Control-Allow-Origin", "*");
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.psd).digest('hex');
    //查询用户信息
    User.get(req.body.name,function(err, user){
      if(err){
        res.send(500, "出错了，原因如下：" + err );
      }
      else if(!user){
        res.send(500, "用户不存在！" );
      }else if(user.password != password){
        res.send(500, "密码错误!" );
      }else{
        //用户名密码都匹配后，将用户信息存入 session
        //req.session.user = user;
        var userInfo = {
          name: user.name,
          password: user.password
        }
        var token = jwt.sign(userInfo, secret, { expiresIn: 60*60 })//, 
        res.send(200, token);
      }
    })
  })
  //保存用户新增的文章
  app.post('/post/product', function(req, res){
    var product = new Product(req.body);
    product.save(function(err){
      if (err) {
        res.send(500, "出错了，原因如下：" + err );
      }else{
        res.send(200, "保存成功！" );
      }
    })
  })
}