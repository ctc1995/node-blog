var jwt = require('jsonwebtoken'),
    secret = require('../setting').tokenSecret

function checkAuthor(req, res, next){
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if(typeof bearerHeader !== 'undefined'){
        // var bearer = bearerHeader.split(" ");
        // bearerToken = bearer[1];
        // req.token = bearerToken;
        jwt.verify(bearerHeader, secret,function(err, decoded){
            if(err){
                res.send({status:'Forbidden',message:"Token已过期或者非法"});
                return
            }
            next()
        })
    }
    else{
        res.send({status:'Forbidden',message:"未发现有效Token!"});
    }
}
module.exports = checkAuthor