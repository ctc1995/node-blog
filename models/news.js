var db = require('./mongodb')

function News(news){
    this.title = news.title;
    this.content = news.content;
    this.prodName = news.prodName;
    this.imgUrl = news.imgUrl;
}
module.exports = News;

News.get = function(name, callback){
    if(name){
        db.News.findOne({"name": name},
            function(err, news){
                if(err){
                    return callback(err);
                }
                return callback(null, news);
            } 
        )
    }
    else{
        db.News.find(null, function(err, news){
            if(err){return callback(err)}
            return callback(null, news);
        })
    }
}

News.prototype.save = function(callback){
    //待存入数据库的数据
    var news = {
        title: this.title,
        content: this.content,
        prodName: this.prodName,
        imgUrl: this.imgUrl
    }
    var newsModel = new db.News(news);
    newsModel.save(function(err, news){
        if(err){
            console.log(err);
            return callback(err);//返回err信息
        }
        callback(null, news)//成功,err为null,并返回存储后的商品文档
    })
}

News.prototype.update = function(id, newData, callback){
    db.News.update({"_id" : id}, newData, function(err, news){
        if(err){
            return callback(err);
        }
        callback(null, news)
    })
}
News.prototype.delete = function(name, callback){
    db.News.remove({"name" : name}, function(err, news){
        if(err){
            return callback(err);
        }
        callback(null, news)
    })
}
