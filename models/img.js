var db = require('./mongodb')

//定义格式
function Img(name, url, type, flag){
    this.name = name;
    this.url = url;
    this.type = type;
    this.flag = flag;
}
module.exports = Img;

Img.prototype.save = function(callback){
    //存入数据库的img文档
    var img = {
        name: this.name,
        url: this.url,
        type: this.type,
        flag: this.flag
    };
    var imgModel = new db.Imgs(img);
    imgModel.save(function(err){
        if(err) {
            console.log(err);
            return callback(err);
        }//错误，返回 err 信息
        callback(null)//成功！
    })
}
Img.get = function(name, callback){
    if(name){
        db.Imgs.findOne({"name":name}, 
            function(err, img){
                if(err){
                    console.error(err);
                    return callback(err);
                }
                return callback(null, img)//成功,err为null,并返回查询的图片信息
            }
        )
    }
    //如果没有传入图片名称,则查询全部
    else{
        db.Imgs.find(null, 
            function(err, imgs){
                if(err){
                    console.err(err);
                    return callback(err);//返回err信息
                }
                callback(null, imgs);//成功,err为null,并返回查询的图片信息
            }
        )
    }
}