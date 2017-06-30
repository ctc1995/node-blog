var mongoose = require('mongoose');

var setting = require('../setting');
//用户模型
var UserModel;
//文章模型
var PostsModel;
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
var posts = mongoose.Schema({
    name: String,
    time: new mongoose.Schema({
        date: Date,
        year: Number,
        month: String,
        day: String,
        minute: String
    }),
    title: String,
    post: String
});
//声明一个Posts模型,使用它和数据库交互
PostsModel =  mongoose.model('posts', posts);

var imgs = mongoose.Schema({
    name: String,
    url: String,
    type: String,
    flag: String
})
//声明一个Imgs模型,使用它和数据库交互
ImgsModel = mongoose.model('imgs', imgs);

module.exports = {
    "Users": UserModel,
    "Posts": PostsModel, 
    "Imgs": ImgsModel,
}