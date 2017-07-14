var mongoose = require('mongoose');

var setting = require('../setting');
//用户模型
var UserModel;
//文章模型
var ProductsModel;
//连接数据库
var address = 'mongodb://'+setting.host+'/'+setting.db;
mongoose.connect(address);

//定义users-用户文档格式
var users = mongoose.Schema({
    name: String,
    password: String,
    email: String
})
//声明一个User模型,使用它和数据库交互
UserModel = mongoose.model('users', users);

//定义post-文章文档格式
var products = mongoose.Schema({
    name: String,
    flag: Array,
    producImgUrl: String,
    price: Number,
    type: String,
    jianjie: String,
    descr: String
});
//声明一个Products模型,使用它和数据库交互
ProductsModel =  mongoose.model('products', products);

var imgs = mongoose.Schema({
    name: String,
    url: String,
    type: String,
    flag: String
})
//声明一个Imgs模型,使用它和数据库交互
ImgsModel = mongoose.model('imgs', imgs);

var webinfo = mongoose.Schema({
    youhui: String,
    address: String,
    name: String,
    phone: new mongoose.Schema({
        number: Number,
        man: String,
    }),
})
WebInfoModel = mongoose.model('webinfo', webinfo)

module.exports = {
    "Users": UserModel,
    "Products": ProductsModel, 
    "Imgs": ImgsModel,
    "WebInfo": WebInfoModel
}