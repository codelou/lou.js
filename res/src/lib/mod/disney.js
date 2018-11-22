/**

*/

!function(){

var host = 'http://mapi.fine3q.com/get/', api = {
  user: host + 'web/weixin_ajax/get_user_info.json' //获取用户信息
  ,draw: host + 'web/activity_api/create_draw_code.json' //生成抽奖码
  ,info: host + 'web/activity_api/get_info_for_disney_activity.json' //获取我的抽奖信息
  ,checkshare: host + 'web/activity_api/joined_disney_activity.json' //检查用户是否参与
};

var url = duoui.unparam(), disney = {
  //报名
  enroll: function(othis){
    var mobile = $('#mobile').val();
    if(/^1\d{10}$/g.test(mobile)){
      $('#mobile').blur();
      duoui.vercode({
        mobile: mobile
      }, function(){
        duoui.open('share.html', 1);
      });
    } else {
      layer.msg('手机格式不合法');
    };
  }

  //分享指引
  ,share: function(){
    duoui.share();
  }

  //关注多多钱
  ,followddq: function(){
    layer.open({
      type: 1
      ,className: 'follow-gzh'
      ,shade: 'background-color: rgba(0,0,0,.8)'
      ,style: ''
      ,content: '<div follow><h5>长按二维码，关注“多多钱股票”公众号，回复“迪士尼”，点击提示消息中的“立即领取抽奖码”即可！</h5>'
      +'<p><img src="http://cdn.firstlinkapp.com/upload/2016_3/1458807037304_92283.jpg"></p><p>多多钱股票</p></div>'
    });
  }
};

//生成码
var createCode = function(user, source){
  var json = {
    source: 1
  }, formuid = duoui.data('disney-fromuid');

  user = user || {};

  //通过第三方合作公众号来源
  if(source){
    json.source = source;
  } else if(formuid && formuid != user.user_id) { //通过好友分享来源
    json.source = 2;
    json.from_user_id = formuid;
  }

  duoui.ajax(api.draw, {
    draw_code_json: JSON.stringify(json)
  }, function(res){
    duoui.data('disney-fromuid', null, 'remove'); //获取抽奖成功后，删除好友id
    duoui.open('mycode.html', 1);
  });
};

//初始运行
var init = {

  //关注页
  follow: function(user, callback){
    if(url.fromuid && user.user_id != url.fromuid){
      duoui.data('disney-fromuid', url.fromuid);
    }

    //检测是否已经参与
    duoui.ajax(api.checkshare, function(res){
      if(res.flag == true){
        return duoui.open('mycode.html', 1);
      }
      callback && callback();
    });
  }

  //报名页
  ,enter: function(user){

    //第三方合作号来源
    if(url.source){
      return createCode(user, url.source);
    }
    
    //老用户
    if(user.is_new == 0){
      return this.follow(user, function(){
         duoui.open('share.html', 1);
      });
    };

    this.follow(user);
  }

  //分享页
  ,share: function(user){
    this.follow(user);
  }

  //我的抽奖码页
  ,mycode: function(user){
    duoui.ajax(api.checkshare, function(res){
      if(res.flag == false){
        return duoui.open('follow.html', 1);
      }
      var index = layer.load();
      duoui.ajax(api.info, function(res){
        laytpl(duoTpl.innerHTML).render(res, function(html){
          duoView.innerHTML = html;
          setTimeout(function(){
            layer.close(index);
          }, 200);
        });
      });
    });
  }
};

var run = function(user){

  //初始方法加载
  var method = $('body').attr('lay-init');
  method && init[method](user);

  //分享
  if($('body').attr('allowShare')){
    duoui.weixin(function(){
      
      wx.onMenuShareTimeline({
        title: '3月28上海迪士尼官方售票开启，剁手帮来买票请你们去玩！',
        link: 'http://m.fine3q.com/event/lottery/disney/follow.html?fromuid='+ user.user_id,
        imgUrl: 'http://cdn.firstlinkapp.com/upload/2016_3/1458642758750_13625.png',
        success: function () {
          createCode(user);
        }
      });
      
      //分享给朋友
      wx.onMenuShareAppMessage({
        title : '3月28上海迪士尼官方售票开启，剁手帮来买票请你们去玩！',
        desc : url.desc?decodeURIComponent(url.desc):'如果长大是一场冒险，那一定要有信得过的伙伴在身边。备受世界瞩目的上海迪士尼乐园6月16号正式开园。3月28号0点官方售票就正式开启了呢！',
        link : 'http://m.fine3q.com/event/lottery/disney/follow.html?fromuid='+ user.user_id,
        imgUrl: 'http://cdn.firstlinkapp.com/upload/2016_3/1458642758750_13625.png', // 分享图标
        type : '',
        dataUrl : '',
        success : function() {
          createCode(user);
        },
        cancel : function() {
        }
      });

    });
  }
};

//微信登入
duoui.login(function(user){
  run(user);
});

//全站touch事件监听
duoui.touch('body', '*[lay-touch]', function(){
  var othis = $(this), method = othis.attr('lay-touch');
  disney[method].call(this, othis);
});


}();