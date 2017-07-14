var db = require('./mongodb');

function Product(produc){
    this.name = produc.name;
    this.flag = produc.flag;
    this.imgUrl = produc.imgUrl;
    this.price = produc.price;
    this.type = produc.type;
    this.jianjie = produc.jianjie;
    this.descr = produc.descr;
}
module.exports = Product

Product.prototype.save = function(callback){
    //待存入数据库的数据
    var produc = {
        name : this.name,
        flag : this.flag,
        imgUrl : this.imgUrl,
        price : this.price,
        type : this.type,
        jianjie : this.jianjie,
        descr : this.descr
    }
    var productModel = new db.Products(produc);
    productModel.save(function(err, callback){
        if(err){
            console.err(err);
            return callback(err);//返回err信息
        }
        callback (null, product)//成功,err为null,并返回存储后的商品文档
    })
}

Product.get = function(name, callback){
    if(name){
        console.log(name)
        db.Products.findOne({"name": name},
            function(err, product){
                console.log(product)
                if(err){
                    console.err(err);
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