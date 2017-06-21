    var qiniu = require("qiniu");
    //需要填写你的 Access Key 和 Secret Key
    qiniu.conf.ACCESS_KEY = 'gu5lglCQuLznfV5GfjP6wozMBaT3EDsH8RV9NuPI';
    qiniu.conf.SECRET_KEY = 'fLZ63PHYLqp8BFRzoUIMtYrb7CcBlboGN3qIojAf';
    //要上传的空间
    var bucket = 'blog';

    function Upload(key){
        this.key = key;
    }
    module.exports = Upload;
    Upload.prototype.uptoken = function(callback){
        var key = this.key
        var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key);
        return callback(putPolicy.token())
    }
    Upload.prototype.uploadFile = function(token, key, loaclFile, callback){
        var extra = new qiniu.io.PutExtra();
        qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
            if(!err) {
                // 上传成功， 处理返回值
                console.log(ret.hash, ret.key, ret.persistentId);   
                return callback(ret.hash, ret.key, ret.persistentId)   
            } else {
                // 上传失败， 处理返回代码
                console.log(err);
                return callback(err);
            }
        });
    }
    // //上传到七牛后保存的文件名
    // key = 'my-nodejs-logo.png';
    // //构建上传策略函数
    // function uptoken(key) {
    //   var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key);
    //   return putPolicy.token();
    // }
    // //生成上传 Token
    // token = uptoken(key);
    // //要上传文件的本地路径
    // filePath = './ruby-logo.png'
    //构造上传函数
    // function uploadFile(uptoken, key, localFile) {
    //   var extra = new qiniu.io.PutExtra();
    //     qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
    //       if(!err) {
    //         // 上传成功， 处理返回值
    //         console.log(ret.hash, ret.key, ret.persistentId);       
    //       } else {
    //         // 上传失败， 处理返回代码
    //         console.log(err);
    //       }
    //   });
    // }
    // //调用uploadFile上传
    // uploadFile(token, key, filePath);