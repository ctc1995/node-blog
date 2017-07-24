var db = require('./mongodb');

function Product(product){
    this.name = product.name;
    this.flag = product.flag;
    this.imgUrl = 'http://omly572p2.bkt.clouddn.com/'+product.imgUrl+'-img1';
    this.price = product.price;
    this.type = product.type;
    this.jianjie = product.jianjie;
    this.descr = product.descr;
}
module.exports = Product

Product.get = function(name, callback){
    if(name){
        db.Products.findOne({"name": name},
            function(err, product){
                if(err){
                    return callback(err);//返回err信息
                }
                callback(null, product);//成功,err为null,并返回查询的用商品信息
            })
    }else{
        db.Products.find(null, 
            function(err, products){
                if(err){
                    console.err(err);
                    return callback(err);//返回err信息
                }
                callback(null, products);//成功,err为null,并返回查询的商品信息
            }
        )
    }
}

Product.prototype.save = function(callback){
    //待存入数据库的数据
    var product = {
        name : this.name,
        flag : this.flag,
        imgUrl : this.imgUrl,
        price : this.price,
        type : this.type,
        jianjie : this.jianjie,
        descr : this.descr
    }
    var productModel = new db.Products(product);
    productModel.save(function(err, product){
        if(err){
            console.err(err);
            return callback(err);//返回err信息
        }
        callback(null, product)//成功,err为null,并返回存储后的商品文档
    })
}

Product.prototype.update = function(id, newData, callback){
    db.Products.update({"id" : name}, newData, function(err, product){
        if(err){
            return callback(err);
        }
        callback(null, product)
    })
}
Product.prototype.delete = function(name, callback){
    db.Products.remove({"name" : name}, function(err, product){
        if(err){
            return callback(err);
        }
        callback(null, product)
    })
}
