var db = require('./mongodb')

function Type(type){
    this.name = type.name,
    this.descr = type.descr,
    this.parent = type.parent,
    this.items = type.items
}
module.exports = Type;

Type.get = function(name, callback){
    if(name){
        db.Type.findOne({'name': name}, function(err, type){
            if(err){
               return callback(err);
            }
            return callback(null, type);
        })
    }
    else{
        db.Type.find(null,function(err, types){
            if(err){
                return callback(err);
            }
            return callback(null, types);
        })
    }
}

Type.prototype.save = function(callback){
    var type = {
        name : this.name,
        descr : this.descr,
        parent : this.parent,
        items : this.items
    }
    var typeModel = new db.Type(type);
    typeModel.save(function(err, type){
        if(err){
           return callback(err);
        }
        return callback(null, type);
    })
}

Type.prototype.update = function(id, newData, callback){
    db.Type.update({'_id': id}, newData, function(err, type){
        if(err){
            return callback(err);
        }
        return callback(null, type)
    })
}

Type.prototype.delete = function(name, callback){
    db.Type.remove({'name': name}, function(err, type){
        if(err){
            return callback(err);
        }
        return callback(null, type)
    })
}