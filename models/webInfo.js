var db = require('./mongodb')

function WebInfo(webInfo){
    this.youhui = webInfo.youhui
    this.address = webInfo.address
    this.name = webInfo.name
    this.phone = webInfo.phone
    this.logo = 'http://image.phunkienthanh.shop/'+webInfo.logo+'-img1';
    this.lunbo = webInfo.lunbo
}
module.exports = WebInfo;

WebInfo.get = function(name, callback){
    if(name){
        db.WebInfo.findOne({"name": name},
            function(err, webInfo){
                if(err){
                    return callback(err);//返回err信息
                }
                callback(null, webInfo);//成功,err为null,并返回查询的用商品信息
            })
    }else{
        db.WebInfo.find(null, 
            function(err, webInfos){
                if(err){
                    console.err(err);
                    return callback(err);//返回err信息
                }
                callback(null, webInfos);//成功,err为null,并返回查询的商品信息
            }
        )
    }
}

WebInfo.prototype.save = function(callback){
    //待存入数据库的数据
    var webInfo = {
        youhui : this.youhui,
        address : this.address,
        name : this.name,
        phone : this.phone,
        logo : this.logo,
        lunbo : this.lunbo
    }
    var webInfoModel = new db.WebInfo(webInfo);
    webInfoModel.save(function(err, webInfo){
        if(err){
            console.err(err);
            return callback(err);//返回err信息
        }
        callback(null, webInfo)//成功,err为null,并返回存储后的商品文档
    })
}

WebInfo.prototype.update = function(id, newData, callback){
    db.WebInfo.update({"id" : id}, newData, function(err, webInfo){
        if(err){
            return callback(err);
        }
        callback(null, webInfo)
    })
}
WebInfo.prototype.delete = function(name, callback){
    db.WebInfo.remove({"name" : name}, function(err, webInfo){
        if(err){
            return callback(err);
        }
        callback(null, webInfo)
    })
}