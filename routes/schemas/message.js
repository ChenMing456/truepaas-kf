var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var MessageSchema=new mongoose.Schema({
    fromid:String,
    toid:String,
    msg:String,
    roomid:String,
    msgStatus:Number,
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
/*
msgStatus:0 未读留言
1 正在处理的留言
2 已处理的留言
*/
MessageSchema.pre('save',function(next){
	var user=this;
	if(this.isNew){
		this.meta.createAt=this.meta.updateAt=Date.now();
	}
	else{
		this.meta.updateAt=Date.now();
	}
	next();
})
MessageSchema.statics={
	fetch:function(cb){
		return this
	       .find({})
	       .sort('meta.updateAt')
	       .exec(cb)
	},
	findById:function(fromid,cb){
		return this
		   .findOne({fromid:fromid})
		   .sort('meta.updateAt')
		   .exec(cb)

	},
	findBy:function(opt,cb){
		return this
		       .find(opt)
		       .sort({'meta.updateAt':-1})
		       .exec(cb)
	},
    findByUser:function(opt,cb){
		return this
		       .find(opt)
		       .sort('meta.updateAt')
		       .exec(cb)
	}
}
module.exports=MessageSchema;