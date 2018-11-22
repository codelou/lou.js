/**
  幸运转盘
*/

!function(){

$('#duoLoading').show();

var url = duoui.unparam(), cache = {}, api = {
  count: duoui.api('web/activity_api/find_gifts_and_lottery_count.json') //查询剩余抽奖次数
  ,draw: duoui.api('web/activity_api/to_lottery_draw.json') //获取我的抽奖信息
  ,share: duoui.api('web/activity_api/have_share.json') //分享增加一次
};

var shareNone = 'http://cdn.firstlinkapp.com/upload/2016_6/1466152382573_32326.png';
var count = $('#wheel-count'), shareElem = $('.wheel-share'), events = {
  share: function(){
    share.id = cache.id||cache.user_id;
    share.link = 'http://m.fine3q.com/event/lottery/wheel.html?formuid='+ share.id;
    duoui.share(share);
  } 
  ,chou: function(othis){
    var reset = function(time){
      setTimeout(function(){
        othis.removeClass('wheel-xiexie')
        .removeClass('wheel-gongxi');
      }, time|0);
    };

    if(events.chou.disabed) return;

    reset();

    //模拟抽奖
    if(url.test){
      layer.msg('你正在进行的是模拟抽奖');
      events.chou.disabed = true;
      return duoui.wheel(Math.random()*6|0, {
        end: function(index){
          layer.msg(index);
          events.chou.disabed = false;
        }
      });
    }

    //正式抽奖
    if(count.html() == '0'){
      return layer.msg('您今日的抽奖机会已用完');
    }

    duoui.ajax(api.draw, {
      winning_record_json: JSON.stringify({
        activity_id: 3
      })
    }, function(res){
      var gift = res.gift || {};
      duoui.wheel(gift.gift_id, {
        end: function(){
          if(res.flag == 1){
            othis.removeClass('wheel-xiexie').addClass('wheel-gongxi');
            layer.alert('恭喜您<br>获得一张'+ gift.name, function(){
              if(res.count > 0){
                reset(1000);
              }
            });
          } else {
            othis.removeClass('wheel-gongxi').addClass('wheel-xiexie');
            layer.alert('好可惜<br>下次再来试试手气喔', function(){
              if(res.count > 0){
                reset(1000); 
              }
            });
          }
          events.chou.disabed = false;
        }
      });
      count.html(res.count|0);  
    }, {
      error: function(){
        events.chou.disabed = false;
      }
    });

    events.chou.disabed = true;

  }
};

//分享配置
var share = {
  title: '再买就去剁手帮，我正在剁手帮玩转盘，剁手券都到我碗里来！'
  ,desc: url.desc?decodeURIComponent(url.desc):'想做一个任性的土豪，开心时，发优惠券，不开心，发个小点的优惠券'
  ,imgUrl: 'http://cdn.firstlinkapp.com/upload/2016_3/1459336313647_88919.jpg'
  ,imageUrl: 'http://cdn.firstlinkapp.com/upload/2016_3/1459336313647_88919.jpg'
  ,success: function(){
    //分享增加一次
    duoui.ajax(api.share, function(res){
      count.html(res.count|0);
      layer.closeAll();
      if(res.count == 0){
        //layer.msg('明天来分享才能再增加一次喔');
      }
    });
  }
};

var run = function(user){
  share.link = 'http://m.fine3q.com/event/lottery/wheel.html?formuid='+ user.user_id
  duoui.weixin({
    share: share
  });

  //查询剩余抽奖次数
  duoui.ajax(api.count, {
    gift_json: JSON.stringify({
      activity_id: 3
    })
  }, function(res){
    var nums = res.count|0;
    count.html(nums);
  });

  if(url.origin != 1){
    duoui.downApp({
      className: 'wheel-down'
    });
    $('#duoLoading>div').eq(0).css('margin-top', '20px');
  }
};

layer.alert = function(content, end){
  if($('#wheelAlert')[0]) return;
  var index = layer.open({
    type: 1
    ,style: 'width: 250px; height: 140px; background:url(http://cdn.firstlinkapp.com/upload/2016_3/1459303822260_74481.png) no-repeat; background-size: 100% 100%;'
    ,shade: 'background-color:rgba(0,0,0,.8)'
    ,content: '<div id="wheelAlert" style="text-align: center; padding: 15px 0;  height: 90px; line-height: 24px; margin: 10px; background-color: #fff; border-radius: 20px; color: #420100;">'+ content +'<p><button style="margin-top: 10px; border: none; padding: 0 20px; height: 32px; line-height: 32px; border-radius: 3px; background-color: #E4B468; color: #5A120D;" class="wheelBtn">朕知道了</button></p></div>'
    ,success: function(elem){
      duoui.touch($(elem).find('.wheelBtn'), function(){
        layer.close(index);
      });
    }
    ,end: end
  });
  return index;
};

//登入
duoui.login(function(user){
  run(cache = user);
});

//全站touch事件监听
duoui.touch('body', '*[lay-touch]', function(){
  var othis = $(this), method = othis.attr('lay-touch');
  events[method].call(this, othis);
});

}();