var User=require('../models/user');
exports.showUserIndex=function (req,res){
    res.render('user_index',{});
}
exports.showAdminIndex=function (req,res){
    
}
exports.signin=function(req,res){
	var username=req.body.username;
    var password=req.body.password;
    var role=req.body.role;
    console.log(role);

    User.findById(username,function(err,users){
        if(err){
            console.log(err);
        }
        console.log(users);
        if(users){
            return res.redirect('/signup');
        }
        else{
            var user=new User({
            	username:username,
            	password:password,
            	role:role
            });
            user.save(function(err,user){
                if(err){
                    console.log(err);
                }
                //res.redirect('/');
            })
        }
    })
    
    //console.log(_user);
}
exports.showSignin=function(req,res){
    res.render('login',{
    });
}
//sign in 登录
exports.signup=function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    // var role=req.body.role;
    
    User.findById(username,function(err,user){
        if(err){
            console.log(err);
        }
        if(!user){
            return res.redirect('/signup');
        }
        user.comparePassword(password,function(err,isMatch){
            if(err){
                console.log(err);
            }
            if(isMatch){
                console.log('password is matched');
                //req.session.user=user;
                //return res.redirect('/');
            }
            else{
                //return res.redirect('/user/login');
                console.log('password is not matched');
            }
        })
    })
}
exports.showSignup=function(req,res){
    res.render('logup',{
    });
}
exports.updateUserLabel=function(req,res){
    var username=req.body.username;
    var lable=req.body._label;

    User.findById(username,function(err,user){
        user.lable = lable;
        user.save(function(err,user){
            if(err){
                console.log(err);
            }
            console.log(user);
        })
    })
}
//userlist
exports.list=function(req,res){

    User.fetch(function(err,users){
        if(err){
            console.log(err);
        }
        res.render('userlist',{
            title:'imooc 用户列表页',
            users:users
        });
    })
}

