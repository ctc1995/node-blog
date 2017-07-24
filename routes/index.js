var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var multer = require('multer');

var crypto = require('crypto'),
    User = require('../models/users'),
    Product = require('../models/product'),
    Img = require('../models/img'),
    Type = require('../models/type')
    News = require('../models/news')
    WebInfo = require('../models/webInfo')
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
  app.all('/put/*', function(req, res, next){
    res.header('Access-Control-Allow-Methods', 'PUT, OPTIONS');
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
        'http://image.phukienthanh.shop/'+fileName+'-img1',
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
                res.send(200, {link: 'http://image.phukienthanh.shop/'+fileName+'-img1'});
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
  //保存用户新增的商品
  app.post('/post/product', function(req, res){
    var product = new Product(req.body),
        prodName = req.body.name;
    Product.get(prodName,function(err, productItem){
      if(productItem){
        var newData = req.body;
          newData['__v'] = productItem['__v']
        product.update(prodName, newData, function(err, product){
            if(err){
              res.send(500, "出错了，原因如下：" + err );
            }
            else{
              res.send(product);
            }
        })
      }
      else{
        product.save(function(err, productItem){
          if (err) {
            res.send(500, "出错了，原因如下：" + err );
          }else{
            res.send(200, productItem);
          }
        })
      }
    })
  })
  app.get('/get/product', function(req, res){
    var prodName = null;
    if(req.query.name !=null){
      prodName = req.query.name
    }
    Product.get(prodName, function(err, products){
      if(err){
        products = [];
        res.send(500, "出错了，原因如下：" + err );
        return
      }
      res.send(products);
    })
  })
  app.delete('/del/product', function(req, res){
    var product = new Product(req.body);
    var prodName = req.query.name;
    Product.get(prodName, function(err, products){
      if(products){
        product.delete(prodName, function(err){
          if(err){
            res.send(500, "出错了，原因如下：" + err )
          }
          res.send("删除成功!")
        })
      }
      else{
        res.send("商品不存在")
      }
    })
  })
  app.get('/get/type', function(req, res){
    var typeName = null;
    if(req.query.name){
      typeName = req.query.name;
    }
    Type.get(typeName, function(err, types){
      if(err){
        res.send(500, err);
      }
      res.send(types)
    })
  })
  app.post('/post/type', function(req, res){
    var newType = new Type(req.body);
    newType.save(function(err, type){
      if(err){
        res.send(500, "出错了，原因如下：" + err );
        return;
      }
      else{
        res.send(200, "新建分类成功!" );
      }
    })
  })
  app.put('/put/type', function(req, res){
    var type = new Type(req.body),
        typeId = req.body['_id'];
        newData = req.body;
    type.update(typeId, newData, function(err, type){
      if(err){
        res.send(err);
      }
      res.send(type)
    })
  })
  app.delete('/del/type', function(req, res){
    var type = new Type(req.body);
    var typeName = req.query.name;
    Type.get(typeName, function(err, types){
      if(types){
        type.delete(typeName, function(err){
          if(err){
            res.send(500, "出错了，原因如下：" + err )
          }
          res.send("删除成功!")
        })
      }
      else{
        res.send("类别不存在")
      }
    })
  })
  app.post('/post/news', function(req, res){
    var newNews = new News(req.body)
    newNews.save(function(err, news){
      if(err){
        res.send(err);
      }else{
        res.send(news);
      }
    })
  })
  app.get('/get/news', function(req, res){
    var newName = null;
    if(req.query.name){
      newName = req.query.name;
    }
    News.get(newName, function(err, news){
      if(err){
        res.send(err);
      }else{
        res.send(news);
      }
    })
  })
  app.delete('/del/news', function(req, res){
    var news = new News({}),
        newsTitle = req.query.title;
      news.delete(newsTitle, function(err, news){
        if(err){
          res.send(err);
        }else{
          res.send("删除成功!");
        }
      })
  })
  app.put('/put/news', function(req, res){
    var news = new News(req.body),
        newsId = req.body['_id'];
        newData = req.body;
    news.update(newsId, newData, function(err, news){
      if(err){
        res.send(err);
      }
      res.send(news)
    })
  })
  app.post('/post/webInfo', function(req, res){
    var newWebInfo = new WebInfo(req.body)
    newWebInfo.save(function(err, webInfo){
      if(err){
        res.send(err);
      }else{
        res.send(webInfo);
      }
    })
  })
  app.get('/get/webInfo', function(req, res){
    var newName = null;
    if(req.query.name){
      newName = req.query.name;
    }
    WebInfo.get(newName, function(err, webInfo){
      if(err){
        res.send(err);
      }else{
        res.send(webInfo);
      }
    })
  })
  app.delete('/del/webInfo', function(req, res){
    var webInfo = new WebInfo({}),
        webInfoTitle = req.query.title;
      webInfo.delete(webInfoTitle, function(err, webInfo){
        if(err){
          res.send(err);
        }else{
          res.send("删除成功!");
        }
      })
  })
  app.put('/put/webInfo', function(req, res){
    var webInfo = new WebInfo(req.body),
        webInfoId = req.body['_id'];
        newData = req.body;
    webInfo.update(webInfoId, newData, function(err, webInfo){
      if(err){
        res.send(err);
      }
      res.send(webInfo)
    })
  })
}