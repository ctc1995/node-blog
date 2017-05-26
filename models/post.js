var db = require('./mongodb')

//定义格式
function Post(name, title, post){
    this.name = name;
    this.title = title;
    this.post = post;
}
module.exports = Post;

//保存文章
Post.prototype.save = function(callback){
    var date = new Date();
    //存储各种时间格式,方便以后扩展
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + "-" + (date.getMonth()+1),
        day: date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(),
        minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    };
    //要存入数据库的文档
    var post = {
        name: this.name,
        title: this.title,
        post: this.post
    };
    var postModel = new db.Posts(post);
    postModel.save(function(err){
        if(err) return callback(err);//错误，返回 err 信息
        else{callback(null)};//成功！
    })
};
//读取文章及其相关信息
Post.get = function(name, callback){
    var query = {};
    if(name){
        query.name = name;
    }
    db.Posts.find(query).sort({time:-1}).find(null, function(err, docs){
        if (err) {
            return callback(err);//失败！返回 err
        }
        else{callback(null, docs)};//成功！以数组形式返回查询的结果
    })
}