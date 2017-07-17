var Admin=require('../models/admin');
var Message=require('../models/message');
exports.showAdmin = function(req,res){

     // Admin.find({},function(err,users){
     //    console.log('admin__find：'+users);
     // });
    Message.remove({},function(err,result){
      if(err){
        console.log(err);
      }else{
        console.log("删除成功");
      }
      //db.close();
    });
    Message.find({},function(err,result){
      if(err){
        console.log(err);
      }else{
        console.log("result："+result);
      }
      //db.close();
    });

}
// 管理员注册
exports.signup=function(req,res){
	var username=req.body.username;
    var password=req.body.password;
    var role=req.body.role;
    //console.log(role);
    console.log('username'+username);
    Admin.findById(username,function(err,users){
        if(err){
            console.log(err);
        }
        console.log(users);
        if(users){
            return res.redirect('/signup');
        }
        else{
            var admin=new Admin({
            	username:username,
            	password:password,
            	role:role,
                adminStatus:1
            });
            console.log('minjie +++admin：'+admin)
            admin.save(function(err,user){
                if(err){
                    console.log(err);
                }
                console.log('admin+chatting：'+user.chatting)
                //res.redirect('/');
            })
        }
    })
}
// 管理员登录
exports.signin=function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    console.log('username：'+username);
    Admin.findById(username,function(err,admin){
        if(err){
            return res.send(false);
        }
        if(!admin){
            return res.send(false);
        }
        admin.comparePassword(password,function(err,isMatch){
            if(err){
                console.log(err);
            }

            if(isMatch){
                console.log('password is matched');
                req.session.admin= {
                    name:username,
                    role:admin.role
                };
                res.send(true);
            }
            else{
                res.send(false);
                console.log('password is not matched');
            }
        });
    })
}

//修改客服的状态
exports.updateStatus=function(req,res){

    Admin.fetch(function(err,users){
        if(err){
            console.log(err);
        }
        res.render('userlist',{
            title:'imooc 用户列表页',
            users:users
        });
    })
}
//修改客服的会话和离线的数组
exports.updateChatting=function(req,res){
    var username = req.session.admin.name;
    var chatting = req.body.chatting;
    console.log("接收到的:"+chatting);
    var flag = req.body.flag;
    Admin.findById(username,function(err,chat){
        if(err){
            console.log(err);
        }
        console.log('chat：'+chat);
        /*flag=0 chatting 添加
        flag=1  chatting 删除
        flag=2 chatting 清空
        */
        if(flag == 0){
            chat.chatting.push(chatting);
        }
        else if(flag == 1){
            chat.chatting.pop(chatting);
        }
        else if(flag == 2){
            chat.chatting=[];
        }
        // chat.chatting=[];
        //去重操作
        var tmp = [];
        chat.chatting.forEach(function(value,index,arr){
           if(chat.chatting.indexOf(value)==index){
              tmp.push(value);
           }
        });
        console.log("去重操作后的tmp:"+tmp);
        chat.chatting = tmp;
        chat.save(function(err,chatting){
            if(err){
                console.log(err);
            }
            console.log("接收到的chat:"+JSON.stringify(chatting));
        })
    })
}
exports.updateUnChatting=function(req,res){
    Admin.fetch(function(err,users){
        if(err){
            console.log(err);
        }
        res.render('userlist',{
            title:'imooc 用户列表页',
            users:users
        });
    })
}
//show客服正在会话和离线的数组
exports.showChating=function(req,res){
    var username = req.session.admin.name;
    console.log("接收到的:"+username);
    Admin.findById(username,function(err,chat){
        if(err){
            console.log(err);
        }

        res.send(chat);
        console.log("接收到的chat:"+JSON.stringify(chat));
    })
}