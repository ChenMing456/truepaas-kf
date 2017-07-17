var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var bcrypt=require('bcrypt-nodejs');
var SALT_WORK_FACTOR=10;
var AdminSchema=new mongoose.Schema({
    username:String,
    password:String,
    role:String,
    adminStatus:Number,
    chatting:[],
    unchatting:[],
    meta:{
    	createAt:{
    		type:Date,
    		default:Date.now()
    	},
    	updateAt:{
    		type:Date,
    		default:Date.now()
    	}
    }
})
AdminSchema.pre('save',function(next){
	var user=this;
	if(this.isNew){
		this.meta.createAt=this.meta.updateAt=Date.now();
	}
	else{
		this.meta.updateAt=Date.now();
	}
	bcrypt.genSalt(SALT_WORK_FACTOR,function(err,salt){
		if(err) return next(err);
		bcrypt.hash(user.password,null,null,function(err,hash){
			if(err) return next(err);
            user.password=hash;
            next();
		})
	})
})
AdminSchema.methods={
	comparePassword:function(_password,cb){
		bcrypt.compare(_password,this.password,function(err,isMatch){
			if(err){
				return cb(err);
			}
			cb(null,isMatch);
		})
	}
}
AdminSchema.statics={
	fetch:function(cb){
		return this
	       .find({})
	       .sort('meta.updateAt')
	       .exec(cb)
	},
	findById:function(username,cb){
		return this
		   .findOne({username:username})
		   .sort('meta.updateAt')
		   .exec(cb)

	}
}
module.exports=AdminSchema;