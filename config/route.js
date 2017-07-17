var User=require('../routes/controller/user.js');
var Message=require('../routes/controller/message.js');
var Admin=require('../routes/controller/admin.js');
module.exports=function(app){
  //注册
  // app.get('/user/login',User.showSignin);
  // app.post('/user/new/login',User.signin);

   // app.get('/admin/login',Admin.showSignin);
  app.get('/look',Admin.showAdmin);
  //app.get('/admin/login',Admin.showAdmin);
    // 登陆
  app.post('/admin/new/login',Admin.signin);

  // app.get('/user/logup',User.showSignup);
  // app.post('/user/new/logup',User.signup);

  // app.get('/',User.showUserIndex);

  //取所有人最新留言
  app.post('/admin/allLeaveMsg',Message.showAllLeaveMsg);
  //取一个人所有的留言
  app.post('/admin/leaveMsg',Message.showOneLeaveMsg);
  //留言对话存进数据库
  app.post('/addMessage',Message._save);
  //客服发起会话 存入chatting数组中
  app.post('/admin/updateChatting',Admin.updateChatting);
  //取客服的会话和离线数组
  app.get('/admin/:name',Admin.showChating);
  //客服发起会话后,留言状态从0变到1
  app.post('/admin/msgUp',Message.updateMsgStatus);
  //用户和客服所发的所有消息
  app.post('/getMsg',Message.showFromToMsg);
  //上传图片
  app.post('/upload',Message.formidableFormParse);
  //提交工单
  app.post('/workorder',Message.wordorderPost);
  //会话页面得到一个用户的聊天记录
  app.post('/admin/userMsg',Message.showUserMsg);
  // app.post('/admin/updateLabel',Admin.updateUserLabel);
  // app.post('/p/handlerMessage',Message.update,Message.showLeaveMsg);

  // //

  // app.get('/unhandlerMsg/:userid',User.showAdminIndex);

  // app.get('/list',Message.showAllLeaveMsg);
  

}