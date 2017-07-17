var Message=require('../models/message');
var fs=require('fs');
var path=require('path');
var formidable = require('formidable');
//工单
exports.wordorderPost = function(req,res){
    // console.log(req.)
    console.log('work_order_title:'+req.body.work_order_title);
    console.log('work_order_type_id:'+req.body.work_order_type_id);
    console.log('work_order_template_id:'+req.body.work_order_template_id);
    console.log('content:'+req.body.content);
    console.log('images:'+JSON.stringify(req.files.images));
    console.log('creator_name:'+req.body.creator_name);
    console.log('creator_phone:'+req.body.creator_phone); 
    
    var posterData=req.files.images;
    var filePath=posterData.path;
    var originalFilename=posterData.originalFilename;
    console.log('originalFilename：'+originalFilename+'  filePath  '+filePath);
    if(filePath){
        fs.readFile(filePath,function(err,data){
            var timestamp=Date.now();
            //var type=posterData.type.split('/')[1];
            var poster=timestamp+'.'+'jpg';
            var newPath=path.join(__dirname,'../../','/www/upload/workorder/'+poster);

            fs.writeFile(newPath,data,function(err){
                if(err){
                    console.log(err);
                }
                    req.poster=poster;
                    console.log('poster：'+poster);
                    res.send('/upload/'+poster);
                    // next();
            })
        })
    } 

    // res.send('');
}
//存入消息

exports.formidableFormParse = function(req,res){
    console.log('parseaaa:'+JSON.stringify(req.files.photoLogo));
    var posterData=req.files.photoLogo;
    var filePath=posterData.path;
    var originalFilename=posterData.originalFilename;
    console.log('req.files：'+req.files);
    if(originalFilename){
        fs.readFile(filePath,function(err,data){
            var timestamp=Date.now();
            //var type=posterData.type.split('/')[1];
            var poster=timestamp+'.'+'jpg';
            var newPath=path.join(__dirname,'../../','/www/upload/'+poster);

            fs.writeFile(newPath,data,function(err){
                if(err){
                    console.log(err);
                }
                    req.poster=poster;
                    res.send('/upload/'+poster);
                    // next();
            })
        })
    } 
}
exports.showImg=function(req,res){
    //console.log('files:'+req.files+'  '+req.files.name);
    res.send(req.body);
}
exports._save=function (req,res){
    console.log('ajax的请求被捕捉到:'+req.body.data);
    var temp=req.body.data;
    console.log('temp.fromid：'+temp.fromid);
    var Msg=new Message({
    	fromid:temp.fromid,
    	toid:temp.toid,
    	msg:temp.msg,
    	roomid:temp.roomid,
        msgStatus:temp.msgStatus
    })
    Msg.save(function(err,msg){
        console.log('消息存入数据库成功'+msg);
        res.send(msg);
    })

}
//留言已处理更新状态
exports.updateMsgStatus=function (req,res){
    console.log('update的请求被捕捉到:'+req.body);
    var temp=req.body;
    console.log('temp.fromid：'+temp.fromid);
    console.log('temp.status：'+temp._status);
    var wherestr = {};
    if(temp.fromid){
        wherestr.fromid = temp.fromid;
    }
    if(temp.toid){
        wherestr.toid = temp.toid;
    }
    wherestr.msgStatus = 0;
    var updatestr={msgStatus:temp._status};
    Message.updateMany(wherestr,updatestr,function(err,res){
        if(err){
            console.log(err);
        }
        if(res){
            
        }
    })
    Message.find({fromid:temp.fromid},function(err,msg){
        console.log('更新后的数据:'+msg);
        res.send(msg);
    })
   //res.rMessageender('admin_index',{});
}
//取所有人最新留言
exports.showAllLeaveMsg=function(req,res){
    var tmp0=null;
    var tmp1=null;
    var toid = req.body.toid;
    var fromid = req.body.fromid;
    var _status = req.body._status;
    console.log('_status：'+_status);
    var tmp = [];
    var opt ={};

    if(fromid&&toid){
        console.log('111111111');
        tmp.push({fromid:fromid,toid:toid});
        tmp.push({fromid:toid,toid:fromid});
    }
    if(fromid){
        console.log('222222222');
        tmp.push({fromid:fromid,toid:''});
        opt['$or'] = tmp;
    }
    if(_status){
        console.log('3333333333');
        opt.msgStatus = _status;
    }
    else if(_status == 0){
        console.log('4444444444');
        opt.msgStatus = _status;
    }
    
    //opt.msgStatus = 1;
    console.log('showAllLeaveMsg：'+JSON.stringify(opt));
    //opt ={};
    Message.find(opt,function(err,array){
        //console.log('array:'+array);
        var msg=[];
        var tmp0=[],users=[];
        if(array.length>1){
            array.forEach(function(value,index,arr){
                
                // if(tmp[index].fromid==index){
                  tmp0.push(value.fromid);
                // }
            })
            //console.log(array);
            tmp0.forEach(function(value,index,arr){
                if(tmp0.indexOf(value)==index){
                  users.push(value);
                  msg.push(array[index]);
                }
            })
        }
        else{
            msg = array;
        }
        //console.log(msg);
        // console.log(users);
        res.send(msg);
        // res.render('admin_index',{users});
    })

}
//取一个用户的留言和会话
exports.showUserMsg=function(req,res){
    var toid = req.body.toid;
    var fromid = req.body.fromid;
    var _status = req.body._status;
    
    var tmp = [];
    var opt ={};
    if(fromid){
        tmp.push({fromid:fromid,toid:''});
    }
    if(fromid&&toid){
        tmp.push({fromid:fromid,toid:toid});
        tmp.push({fromid:toid,toid:fromid});
    }
    opt['$or'] = tmp;
    if(_status){
        console.log('3333333333');
        opt.msgStatus = _status;
    }
    else if(_status == 0){
        console.log('4444444444');
        opt.msgStatus = _status;
    }
    console.log('showUserMsg'+JSON.stringify(opt));
    Message.find(opt,function(err,array){
        //console.log('array:'+array);
        res.send(array);
        // res.render('admin_index',{users});
    })

}
//取一个人的所有留言
exports.showOneLeaveMsg=function(req,res){

    var fromid = req.body.fromid;
    var toid = req.body.toid;
    var _status = req.body._status;
    console.log('取一个人的所有留言:'+fromid+' '+toid);

    var tmp = [];
    var opt ={};
    if(fromid&&toid){
        tmp.push({fromid:fromid,toid:toid});
        tmp.push({fromid:toid,toid:fromid});
    }
    if(fromid){
        tmp.push({fromid:fromid});
        opt['$or'] = tmp;
    }
    if(_status){
        console.log('3333333333');
        opt.msgStatus = _status;
    }
    else if(_status == 0){
        console.log('4444444444');
        opt.msgStatus = _status;
    }
    console.log('showOneLeaveMsg'+JSON.stringify(opt));
    Message.find(opt,function(err,array){
        res.send(array);
        // res.render('admin_index',{users});
    })

}
exports.showFromToMsg=function(req,res){
    console.log("showFromToMsg:"+req.body.tmp);
    var tmp = req.body.tmp;
    var opt = {
        msgStatus:1,
        '$or':[{fromid:tmp},{toid:tmp}]
    }
    Message.findByUser(opt,function(err,msg){
        // res.render('admin_index',{msg});
        // console.log("或查询结果---------------:"+msg);
        // console.log("或查询结果:"+msg.length);
        res.send(msg);
    })

}
// exports.showAllLeaveMsg=function(req,res){
//     var opt = {
//         msgStatus:0
//     }
//     Message.findBy(opt,function(err,array){
//         res.render('msg_list',{array});
//     })

// }
