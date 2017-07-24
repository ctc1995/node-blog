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

//定义products-产品文档格式
var products = mongoose.Schema({
    name: String,
    flag: Array,
    imgUrl: String,
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
    phone: Array,
})
WebInfoModel = mongoose.model('webinfo', webinfo);

var type = mongoose.Schema({
    name: String,
    descr: String,
    parent: String,
    items: Array,
})
TypeModel = mongoose.model('type', type);

var news = mongoose.Schema({
    title: String,
    content: String,
    prodName: String,
    imgUrl: String
})
NewsModel = mongoose.model('news', news);

module.exports = {
    "Users": UserModel,
    "Products": ProductsModel, 
    "Imgs": ImgsModel,
    "WebInfo": WebInfoModel,
    "Type": TypeModel,
    "News": NewsModel
}