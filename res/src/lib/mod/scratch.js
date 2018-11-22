
/**
 红包以及裂变 
*/

!function(){
  var url = duoui.unparam();

  var userinfo = duoui.cookie('dsb_user_info') || duoui.cookie('DUO_USER_INFO');
  if((duoui.unparam().follow == '0') && !userinfo) {
    location.href = '//m.fine3q.com/' + (/\/dev\//.test(location.pathname) ? 'dev/' : '') + 'user/login.html?redirect=' + encodeURIComponent(location.href);
    return;
  }

  var device = duoui.device(), api = {
    book: duoui.api('web/red_envelope_ajax/book_red_envelope_new.json') //预定红包
    ,find: duoui.api('web/red_envelope_ajax/find_red_envelopes_new.json') //查找红包拥有者和领取列表
    ,get: duoui.api('web/red_envelope_ajax/transform_red_envelope_new.json') //领取红包
    ,share: duoui.api('web/red_envelope_ajax/get_red_envelope_for_share.json') //产生裂变红包
    ,detail: duoui.api('web/red_envelope_ajax/get_red_envelope.json') //获取红包详情
    ,setShare: duoui.api('web/red_envelope_ajax/set_user_share_flag.json') //设置用户分享标记为已分享
  };
  var shareLayer; //分享引导弹出层

  // 开发测试用  线上可删除
  console.log("dev-dev-dev")
  if(url.env=="dev"){
      api = {
        aaaa: ""
        // ,book: '/demo/web/red_envelope_ajax/book_red_envelope_new.json' //预定红包
        // ,find: '/demo/web/red_envelope_ajax/find_red_envelopes_new.json' //查找红包拥有者和领取列表
        // ,get: '/demo/web/red_envelope_ajax/transform_red_envelope_new.json' //领取红包
        // ,share: '/demo/web/red_envelope_ajax/get_red_envelope_for_share.json' //产生裂变红包
        ,detail: '/demo/web/red_envelope_ajax/get_red_envelope.json' //获取红包详情
        //,setShare: duoui.api('web/red_envelope_ajax/set_user_share_flag.json') //设置用户分享标记为已分享
      };
  }


  var scratch = $('#scratch'), coupon = $('.duo-scratch-coupon');

  layer.ok = function(content,endCB){
    return layer.open({
      content: '<p style="color: #f33d7d; font-size: 16px;"><img style="position: relative; top: -2px; width: 22px; margin-right: 10px;" src="//cdn.firstlinkapp.com/upload/2016_7/1468463272845_24239.png">'+ content +'</p>',
      shade: false,
      style: 'top: -150px; border: none; background-color: rgba(255,255,255,.9); color: #666;',
      time: 2,
      end: endCB
    });
  };

  layer.share = function(text){
    shareLayer = layer.open({
      content: '<div class="duo-scratch-share"><img src="//cdn.firstlinkapp.com/upload/2016_7/1468374807331_68686.png"><p>马上分享到朋友圈<br>'+ (text||'让朋友一起来领取红包吧') +'</p></div>'+ (device.ios?'<div class="share-ios"><img src="//cdn.firstlinkapp.com/upload/2016_9/1473413669347_88973.png" /></div>':'')
      ,style: 'position: absolute; top: 0; right: 0; max-width: 100%; background: none;'
      ,anim: false
      ,shade: 'background-color:rgba(0,0,0,.8)'
    });
  };

  duoui.login(function(users){
    var book = false;

    //生成刮刮卡
    duoui.scratch({
      width: 250
      ,height: 130
      ,canvas: scratch
      ,imgSrc: 'data:image/png;base64,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'
      ,success: function(){
        coupon.show();
      }
    });

    //渲染红包信息和领取列表
    var userTpl = [
      '<img src="{{d.user.head_pic}}">'
      ,'<p>来自{{d.user.nickname}}的红包</p>'
    ].join(''), listTpl = [
    '{{# d.list.forEach(function(item){ }}'
      ,'<li>'
        ,'<img src="{{ item.receive_user_head_pic }}">'
        ,'<span>{{ item.receive_user_nickname }}</span>'
        ,'<cite>领取了{{ (item.amount/100)|0 }}元</cite>'
      ,'</li>'
    ,'{{# }); }}'].join('');

    var avatar = $('.duo-scratch-avatar'), list = $('.duo-scratch-list'), share_flag = 0;

    duoui.ajax(api.find, {
      red_envelope_json: JSON.stringify({
        share_user_id: url.share_user_id
        ,order_id: url.order_id
      })
    }, function(res){
      var isget;
      var userHtml = laytpl(userTpl).render(res);
      var listHtml = laytpl(listTpl).render(res);
      avatar.html(userHtml);
      list.html(listHtml);
    });

    //获取红包详情
    duoui.ajax(api.detail, {
      red_envelope_json: JSON.stringify({
        order_id: url.order_id
        ,share_user_id: url.share_user_id
      })
    }, function(res){
      scratch.show();
      share_flag = res.share_flag;
      
      if(res.receive_flag == 1){ //已领取
        var bookTpl = [
          '<li class="duo-scratch-none" count>'
            ,'<h2>你已领取'+ (res.amount/100|0) +'元代金券</h2>'
            ,'<p><button id="use">马上去使用</button></p>'
          ,'</li>'
        ].join('');
        coupon.html(bookTpl);
        scratch.hide();
      } else { //未领取
        if(res.book_flag == 0){ //不能预定
          var bookTpl = [
            '<li class="duo-scratch-none">'
              ,'<h2>来晚了！代金券已被领完</h2>'
              ,'<p desc>(关注公众号，可获得更多优惠信息哦～)</p>'
              ,'<p><button id="follow">关注剁手帮公众号</button></p>'
            ,'</li>'
          ].join('');
          coupon.html(bookTpl);
          scratch.hide();
        } else if(res.book_flag == 2 && res.receive_count==1 && res.share_flag==0 ){
          //二次预定未分享
          /*var bookTpl = [
            '<li class="duo-scratch-none">'
              ,'<h2>获得1个可分享红包</h2>'
              ,'<p desc>(分享给好友，让他们来领取你的红包吧)</p>'
              ,'<p><button id="share">点击分享给好友</button></p>'
            ,'</li>'
          ].join('');*/
          var bookTpl = [
            '<li class="duo-scratch-none">'
              ,'<h2>先分享到朋友圈</h2>'
              ,'<p desc>就可以成功领取这个红包</p>'
              ,'<p><button id="share">点击分享</button></p>'
            ,'</li>'
          ].join('');
          coupon.html(bookTpl);
          scratch.hide();
          // 分享
          share(function(){
            var bookTpl = [
              '<li class="duo-scratch-none" get>'
                ,'<h2>￥<cite id="amount">'+ (res.amount/100|0) +'</cite></h2>'
                ,'<p name>国际运费抵扣券</p>'
                ,'<p><button class="getCoupon" data-id="'+ res.id +'">点击领取</button></p>'
              ,'</li>'
            ].join('');
            coupon.html(bookTpl);
          });
          return;
        }else if(res.book_flag == 2){ //已预定，直接领取
          var bookTpl = [
            '<li class="duo-scratch-none" get>'
              ,'<h2>￥<cite id="amount">'+ (res.amount/100|0) +'</cite></h2>'
              ,'<p name>国际运费抵扣券</p>'
              ,'<p><button class="getCoupon" data-id="'+ res.id +'">点击领取</button></p>'
            ,'</li>'
          ].join('');
          coupon.html(bookTpl);
          scratch.hide();
        }

      }

      //初始化分享信息
      if(users.is_new != 1){
        share();
      }
    });
    
    //产生裂变红包
    var share = function(callback){
      duoui.ajax(api.share, {
        red_envelope_json: JSON.stringify({
          order_id: url.order_id
          ,share_user_id: url.share_user_id
        })
      }, function(res){
        duoui.weixin({
          share: {
            title: res.share_title
            ,imgUrl: res.share_url.indexOf('https://m.fine3q.com/home/index.html') !== -1 
              ? 'http://cdn.firstlinkapp.com/upload/2016_7/1469862295493_11073.jpg' 
            : 'http://cdn.firstlinkapp.com/upload/2016_7/1468219973064_65024.png'
            ,link: res.share_url
            ,success: function(){
              share_flag = true
              layer.close(shareLayer)
              layer.ok('分享成功');
              duoui.ajax(api.setShare, {});
              callback && callback()
            }
          }
        });
      });
    };

    //预定红包
    scratch.one('touchstart', function(){
      $.ajax({
        url: api.book
        ,dataType: 'jsonp'
        ,data: {
          red_envelope_json: JSON.stringify({
            share_user_id: url.share_user_id
            ,order_id: url.order_id
          })
        }
        ,success: function(res){
          if(res.code == 1){
            var data = res.data || {}, red = data.red_envelope || {};

            //如果是第一次领，或者第二次领且已经分享、或者第二次领且是自己的红包，则可以直接领取
            if(red.receive_count == 0 || (red.receive_count < 2 && (share_flag == '1' || users.user_id == url.share_user_id)) ){
              var bookTpl = [
                '<li class="duo-scratch-none" get>'
                  ,'<h2>￥<cite id="amount">'+ (red.amount/100|0) +'</cite></h2>'
                  ,'<p name>国际运费抵扣券</p>'
                  ,'<p><button class="getCoupon" data-id="'+ red.id +'" data-count="'+ red.receive_count +'">点击领取</button></p>'
                ,'</li>'
              ].join('');
              coupon.html(bookTpl);
            } else if(red.receive_count == 1){
              var bookTpl = [
                '<li class="duo-scratch-none">'
                  ,'<h2>获得1个可分享红包</h2>'
                  ,'<p desc>(分享给好友，让他们来领取你的红包吧)</p>'
                  ,'<p><button id="share">点击分享给好友</button></p>'
                ,'</li>'
              ].join('');
              coupon.html(bookTpl);

              share(function(){
                var bookTpl = [
                  '<li class="duo-scratch-none" get>'
                    ,'<h2>￥<cite id="amount">'+ (red.amount/100|0) +'</cite></h2>'
                    ,'<p name>国际运费抵扣券</p>'
                    ,'<p><button class="getCoupon" data-id="'+ red.id +'">点击领取</button></p>'
                  ,'</li>'
                ].join('');
                coupon.html(bookTpl);
              });
              
            } else {
              var bookTpl = [
                '<li class="duo-scratch-none" count>'
                  ,'<h2>今天的刮奖次数已用完</h2>'
                  ,'<p><button class="openApp">去APP剁手赢红包</button></p>'
                ,'</li>'
              ].join('');
              coupon.html(bookTpl);
            }
          } else if(res.code == 42000){
            var bookTpl = [
              '<li class="duo-scratch-none">'
                ,'<h2>没有刮到任何东东喔</h2>'
                ,'<p desc>(关注公众号，可获得更多优惠信息哦～)</p>'
                ,'<p><button id="follow">关注剁手帮公众号</button></p>'
              ,'</li>'
            ].join('');
            coupon.html(bookTpl);
            layer.msg(res.message);
          } else {
            layer.msg(res.message || '返回数据异常');
          }
        }
        ,error: function(){
          layer.msg('网络异常');
        }
      });
    });

    //领取红包
    duoui.touch(coupon, '.getCoupon', function(){
      var id = $(this).data('id');
      var count = $(this).data('count');
      if(users.is_new == 1){
        return duoui.vercode({}, function(){
          location.href = location.href + '&_=' + new Date().getTime();
        })
      }
      duoui.ajax(api.get, {
        red_envelope_json: JSON.stringify({
          share_user_id: url.share_user_id
          ,id: id
          ,order_id: url.order_id
        })
      }, function(res){
        var bookTpl = [
          '<li class="duo-scratch-none" count>'
            ,'<h2>你已领取'+ $('#amount').html() +'元代金券</h2>'
            ,'<p><button id="use">马上去使用</button></p>'
          ,'</li>'
        ].join('');
        coupon.html(bookTpl);

        layer.ok('代金券领取成功',function(){
          //如果是自己的红包，不引导分享
          if(users.user_id != url.share_user_id && !share_flag){
            share();
            layer.share(share_flag == '1' ? '和朋友们一起领取吧' : '');
          }
        });

      });
    });

    //马上去使用
    duoui.touch(coupon, '#use', function(){
      location.href = 'https://m.fine3q.com/home/index.html';
    });

    //点击分享
    duoui.touch(coupon, '#share', function(){
      //duoui.share();
      layer.share(share_flag == '1' ? '和朋友们一起领取吧' : '')
    });

    //打开应用宝
    duoui.touch(coupon, '.openApp', function(){
      location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.firstlink.duo';
    });

    //关注公众号
    duoui.touch(coupon, '#follow', function(){
      location.href = 'follow.html';
    });

  }, {
    noreg: true
  });


  //活动规则
  duoui.touch('#rule', function(){
    layer.open({
      content: '<div style="text-align: center">活动规则</p><p style="text-align: left; padding-top: 10px;">1.在剁手帮APP下单就有机会获得订单红包，多买多送，分享到微信朋友圈可以和小伙伴们一起领取； </p><p style="text-align: left; padding-top: 10px;">2.在领取你好友的订单红包后，同时会获得一次生成新的分享红包的机会，可以分享给其他好友领取；</p><p style="text-align: left; padding-top: 10px;">3.在微信朋友圈领取来自于好友的红包，一天最多可领两个，相同来源的红包仅可领取一次；（订单红包，和该订单红包所生成的所有分享红包视为相同来源的红包）</p><p style="text-align: left; padding-top: 10px;">4.领取的红包会以代金券的形式发放到账户，您可以在剁手帮下单时直接抵扣国际运费，有效期3天；</p><p style="text-align: left; padding-top: 10px;">5.本活动最终解释权归剁手帮所有。</p></div>'
      ,btn: ['关闭']
      ,style: 'width: 280px;'
    });
  });

  //下载bar
  /*
  duoui.downApp({

  });
  */


}();