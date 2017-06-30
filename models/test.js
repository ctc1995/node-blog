var http=require('http');  
//get 请求外网  
http.get('http://translate.google.cn/translate_a/single?client=gtx&dt=t&sl=zh-TW&tl=en&q=遲到次數',function(req,res){  
    var html='';  
    req.on('data',function(data){  
        console.log(html+=data)  
    });  
    req.on('end',function(){  
        console.log(html);  
    });  
});  
