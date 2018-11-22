/**
 rents_ui  By 胜军
 */

;
! function() {

  var Class = function() {
    this.v = '1.0';
  };

  //避免tochmove触发touchend
  Class.prototype.touch = function(obj, child, fn) {
    var move, type = typeof child === 'function',
      end = function(e) {
        var othis = $(this);
        if (othis.data('lock')) {
          return;
        }
        move || fn.call(this, e);
        move = false;
        othis.data('lock', 'true');
        setTimeout(function() {
          othis.data('lock', "");
          othis.removeAttr('data-lock');
        }, othis.data('locktime') || 0);
      };

    if (type) {
      fn = child;
    }

    obj = typeof obj === 'string' ? $(obj) : obj;

    if (!/Android|iPhone|SymbianOS|Windows Phone|iPad|iPod/.test(navigator.userAgent)) {
      if (type) {
        obj.on('click', end);
      } else {
        obj.on('click', child, end);
      }
      return;
    }

    if (type) {
      obj.on('touchmove', function() {
        move = true;
      }).on('touchend', end);
    } else {
      obj.on('touchmove', child, function() {
        move = true;
      }).on('touchend', child, end);
    }

  };

  //URL反系列化
  Class.prototype.unparam = function(search) {
    search = ((search || '').toString() || location.search).replace(/^[\s\S]*?\?/, '')
      .replace(/=/g, '":"').replace(/&/g, '","');
    try {
      return search === '' ? {} : JSON.parse('{"' + search + '"}');
    } catch (e) {
      return {};
    }
  };

  //将普通对象按某个key排序
  Class.prototype.sort = function(data, key, asc) {
    var obj = JSON.parse(JSON.stringify(data));
    var compare = function(obj1, obj2) {
      var value1 = obj1[key];
      var value2 = obj2[key];
      if (value2 < value1) {
        return -1;
      } else if (value2 > value1) {
        return 1;
      } else {
        return 0;
      }
    };
    obj.sort(compare);
    if (asc) obj.reverse();
    return obj;
  };

  //将字符转换为日期对象
  Class.prototype.date = function(time) {
    time = (time || '').replace(/T/g, ' ').replace(/-/g, '/');
    return new Date(time);
  };

  //返回当前时间的多久前
  Class.prototype.time = function(time, brief) {
    var stamp = new Date().getTime() - time;
    if (stamp > 1000 * 60 * 60 * 24 * 30) {
      stamp = new Date(time).toLocaleString();
      brief && (stamp = stamp.replace(/\s[\S]+$/g, ''));
      return stamp;
    }
    if (stamp >= 1000 * 60 * 60 * 24) {
      return ((stamp / 1000 / 60 / 60 / 24) | 0) + '天前';
    } else if (stamp >= 1000 * 60 * 60) {
      return ((stamp / 1000 / 60 / 60) | 0) + '小时前';
    } else if (stamp >= 1000 * 60 * 5) {
      return ((stamp / 1000 / 60) | 0) + '分钟前';
    } else {
      return '刚刚';
    }
  };

  //cookie 获取cookie:rents_ui.cookie(name),设置cookie:rents_ui.cookie(n,v[,options])
  Class.prototype.cookie = function(e, o, t) {
    t = t || {};
    t.path = t.path || '/';
    t.domain = t.domain || '.fine3q.com';
    e = e || "";
    var n, i, r, a, c, p, s, d, u;
    if ("undefined" == typeof o) {
      if (p = null, document.cookie && "" != document.cookie)
        for (s = document.cookie.split(";"), d = 0; d < s.length; d++)
          if (u = $.trim(s[d]), u.substring(0, e.length + 1) == e + "=") {
            p = decodeURIComponent(u.substring(e.length + 1));
            break
          }
      return p
    }
    t = t || {}, null === o && (o = "", t.expires = -1), t.expires && ("number" == typeof t.expires || t.expires.toUTCString) && ("number" == typeof t.expires ? (i = new Date, i.setTime(i.getTime() + 864e5 * t.expires)) : i = t.expires, n = "; expires=" + i.toUTCString()), r = t.path ? "; path=" + t.path : "", a = t.domain ? "; domain=" + t.domain : "", c = t.secure ? "; secure" : "", document.cookie = [e, "=", encodeURIComponent(o), n, r, a, c].join("")
  };


  Class.prototype.data = function(key, value, remove) {
    var data = {};
    try {
      data = JSON.parse(localStorage.rents_ui);
    } catch (e) {}

    if (value) data[key] = value;
    if (remove) delete data[key];
    localStorage.rents_ui = JSON.stringify(data);
    return key ? data[key] : data;
  };


  //字符转义
  Class.prototype.parse = function(str) {
    return (str || '').replace(/\n/g, '<br>');
  };

  //数位补齐
  Class.prototype.digit = function(num, length) {
    var str = '';
    num = String(num);
    length = length || 2;
    for (var i = num.length; i < length; i++) {
      str += '0';
    }
    return num < Math.pow(10, length) ? str + (num | 0) : num;
  };

  //倒计时
  Class.prototype.countDown = function(endTime, serverTime, callback) {
    var that = this,
      type = typeof serverTime === 'function';
    if (type) callback = serverTime;
    var end = new Date(endTime).getTime();
    var now = new Date((!serverTime || type) ? new Date().getTime() : serverTime).getTime();
    var count = end - now,
      time = [
        Math.floor(count / (1000 * 60 * 60 * 24)) //天
        , Math.floor(count / (1000 * 60 * 60)) % 24 //时
        , Math.floor(count / (1000 * 60)) % 60 //分
        , Math.floor(count / 1000) % 60 //秒
      ];

    var timer = setTimeout(function() {
      that.countDown(endTime, now + 1000, callback);
    }, 1000);

    callback && callback(count > 0 ? time : [0], serverTime, timer);

    if (count <= 0) clearTimeout(timer);

    return time;
  };

  //Ajax
  Class.prototype.ajax = function(url, data, success, options) {
    var that = this,
      type = typeof data === 'function';
    if (type) {
      options = success;
      success = data;
      data = {};
    }

    data._ = new Date().getTime();
    options = options || {};

    return $.ajax({
      type: options.type || 'get',
      dataType: options.dataType || 'jsonp',
      data: data,
      url: url,
      timeout: options.timeout || 20 * 1000,
      contentType: options.contentType || 'application/x-www-form-urlencoded',
      success: function(res) {
        res = res || {};
        if (res.code == 1) {
          success && success(res.data, res);
        } else if (res.code == 46000) {
          //未登录
          that.cookie('dsb_user_info', "");
          that.login()
        } else {
          layer.msg(res.message || '返回数据异常');
          options.error && options.error(res);
        }
      },
      error: function(e) {
        layer.msg('请求异常，请稍后重试');
        options.error && options.error(e);
      }
    });
  };

  //微信jssdk
  Class.prototype.weixin = function(options, callback) {
    var that = this,
      device = rents_ui.device();
    if (typeof options === 'function') {
      callback = options;
    }
    if (!device.weixin) {
      return callback && callback({});
    }
    options = options || {};
    that.ajax(that.api('web/weixin_ajax/get_wx_sign_info.json', options.host), {
      redirect_url: options.redirect || location.href
    }, function(res) {
      wx.config({
        debug: false,
        appId: res.app_id,
        timestamp: res.timestamp,
        nonceStr: res.nonce_str,
        signature: res.signature,
        jsApiList: [
          'onMenuShareTimeline' //分享到朋友圈
          , 'onMenuShareAppMessage' //分享给朋友
          , 'getNetworkType' //获取网络状态
          , 'closeWindow' //关闭当前webview
          , 'scanQRCode' //微信扫一扫
          , 'chooseWXPay' //微信支付
        ]
      });
      wx.ready(function() {
        var share = options.share;
        if (share) {
          wx.onMenuShareTimeline({ //分享到朋友圈
            title: share.title || '',
            link: share.link || location.href,
            imgUrl: share.imgUrl || 'http://cdn.firstlinkapp.com/upload/2016_7/1469862295493_11073.jpg',
            success: function() {
              share.success && share.success('timeline');
            }
          });
          wx.onMenuShareAppMessage({ //分享给朋友
            title: share.title || '',
            desc: share.desc || '',
            link: share.link || location.href,
            imgUrl: share.imgUrl || 'http://cdn.firstlinkapp.com/upload/2016_7/1469862295493_11073.jpg',
            success: function() {
              share.success && share.success('message');
            }
          });
        }
        callback && callback(res);
      });
    });
  };

  //微信分享指引 & Native 分享
  Class.prototype.share = function(share) {
    var device = rents_ui.device();
    if (device.weixin) {
      layer.open({
        type: 1,
        anim: false,
        shade: 'background-color:rgba(0,0,0,.8)',
        className: 'detail-here',
        style: 'position: fixed; top: 0; right:25px; background:none;',
        content: '<div class="duo-weixinHere"></div>'
      });
    } else {
      layer.msg('请在微信或App环境中分享');
    }
  };

  //如果检查到origin参数，则每次跳转都需带该参数
  Class.prototype.open = function(href, go) {
    var that = this,
      url = that.unparam();
    if (url.origin) {
      href = href + (/(&|\?)$/.test(href) ? '' : (/\?/.test(href) ? '&' : '?')) + 'origin=' + url.origin;
    }
    if (!go) return href;
    location.href = href;
  };

  //判断设备
  Class.prototype.device = function() {
    var agent = navigator.userAgent.toLowerCase();

    //将版本字符转化成浮点型
    var parseVersion = function(label) {
      var exp = new RegExp(label + '/([^\\s\\_\\-]+)');
      label = (agent.match(exp) || [])[1];
      return label ? label.replace(/(?!^\d+\.)(\b\d+)./g, '$1') : false
    };

    var result = {
      os: (function() {
        if (/windows/.test(agent)) {
          return 'windows';
        } else if (/linux/.test(agent)) {
          return 'linux';
        } else if (/|iphone|ipod|ipad|symbianos|ios/.test(agent)) {
          return 'ios';
        }
      }())

      //是否微信
      ,
      weixin: parseVersion('micromessenger')

      //是否剁手帮App
      ,
      firstlinkapp: parseVersion('firstlinkapp')
    };
    result.android = /android/.test(agent);
    result.ios = result.os === 'ios';
    return result;
  };

  //拼接CDN静态资源参数
  Class.prototype.formatImg = function(url, parame) {
    if (url && typeof url === "string") {
      return url.indexOf('cdn.firstlinkapp.com') !== -1 ? (url + parame) : url;
    } else {
      return null
    }
  };

  //判断环境
  Class.prototype.host = function() {
    var formal = /\b(m|mapi|api)\.fine3q\.com\b/.test(location.host);
    var dev = /\/dev\//.test(location.pathname);
    return formal ? (dev ? 'dev' : 'online') : 'dev';
  };

  // 重构 prototype.api()
  // * 去掉了走 nodeJS 代理的逻辑
  Class.prototype.api = function(url, host) {
    // #判断是线上还是测试环境
    var env = 'dev';
    // 先通过域名和路径信息判断
    var env_prod = /\b((m|mapi|api)\.fine3q\.com)|duoms\.duoshoubang\.cn\b/.test(location.host);
    var env_dev = /\/dev\//.test(location.pathname);
    if (env_prod) {
      env = env_dev ? 'dev' : 'prod';
    } else {
      // 如果不是 m|mapi|api.fine3q.com 或者 duoms.duoshoubang.cn, 一律默认按测试环境算
      env = 'dev';
    }
    // 如果传了 host 参数, 以 host 参数的环境为准
    // host 参数兼容新老两种形式(mapi, fetest | prod, dev);
    if (host === 'mapi' || host === 'prod') {
      env = 'prod';
    } else if (host === 'fetest' || host === 'dev') {
      env = 'dev';
    }

    // * 修复 url 地址前缀 "/link-site";
    // * 为防止以后有地址不是 link-site 目录下的,
    // * 这里根据 老 api 函数的逻辑, 仅自动补全 #不以 "/" 开头的 url 参数#
    if (url.indexOf('/') !== 0) {
      url = '/link-site/' + url;
    }
    // 开始处理不同环境下的请求地址
    var ret = '//dev.fine3q.com';
    if (env === 'prod') {
      ret = 'https://api.fine3q.com';
    }

    ret += url;

    return ret;
  };

  // 重新包装 login 方法, 适配各种合作伙伴渠道
  Class.prototype.login = function(callback, args) {
    this._login(callback, args);
  };
  
  //登入
  Class.prototype._login = function(callback, options) {
    options = options || {};

    var that = this;
    var unionid = that.cookie('unionid');
    var isstr = typeof options === 'string';
    var host = isstr ? options : options.host;
    var device = rents_ui.device();
    var userinfo = rents_ui.cookie('dsb_user_info') || rents_ui.cookie('DUO_USER_INFO');

    userinfo = userinfo ? userinfo.replace(/^"|\\|"$/g, '') : '{}';
    userinfo = JSON.parse(userinfo);

    //微信环境
    var weixinLogin = function() {
      if (userinfo.user_id) {
        return callback && callback(userinfo);
      }
      function auth() {
        var redirectURI = encodeURIComponent("https://api.fine3q.com/link-site/web/weixin/set_wx_user_info_to_cookie.do?redirect_url=" + encodeURIComponent(location.href));
        location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx29b4f4d1f6839e5a&redirect_uri=" + redirectURI + "&response_type=code&scope=snsapi_base&state=1#wechat_redirect";
      }

      if (!unionid) {
        auth();
        return;
      }
      that.ajax(that.api('web/weixin_ajax/get_user_info.json', host), {
        unionid: unionid
      }, function(user) {
        if (user.is_new == 0 && !userinfo.user_id) {
          return auth();
        }
        if (user.is_new == 1 && !options.noreg) {
          return rents_ui.vercode({
            title: '新用户绑定手机号',
            source: options.source,
            fu_id: options.fu_id
          }, function() {
            location.reload();
          });
        }
        callback && callback(user, userinfo);
      });
    };

    //浏览器环境
    var otherLogin = function() {
      if (userinfo.user_id) {
        return callback && callback(userinfo);
      }
      location.href = '//m.fine3q.com/' + (host === 'fetest' ? 'dev/' : (/\/dev\//.test(location.pathname) ? 'dev/' : '')) + 'user/login.html?redirect=' + encodeURIComponent(location.href);
    };

    //各环境判断
    if (rents_ui.device().weixin) {
      weixinLogin();
    } else {
      otherLogin();
    }
    return userinfo;
  };

  // webim
  Class.prototype.webim = function(options) {

    var config = {
      //租户id 
      tenantId: '1814',   
      //环信移动客服域，固定值，请按照示例配置
      domain: '//kefu.easemob.com',
      //agentName: 'shizhang@duoshoubang.cn',               
      //自己服务器上im.html文件的路径
      path: '//m.fine3q.com/webim',       
      //访客插件static的路径
      staticPath: '//static.fine3q.com/res/webim/static'
    };

    
    var userInfo = decodeURIComponent(this.cookie("dsb_user_info")||this.cookie("DUO_USER_INFO"))
    userInfo = userInfo && JSON.parse(userInfo)

    if(userInfo){
      config.visitor = {
        userNickname:userInfo.nk, 
        trueName:userInfo.u_id
      }
    }

    if(options){
      config.extMsg = {
        "imageName": "mallImage3.png",
        //custom代表自定义消息，无需修改
        "type": "custom",
        "msgtype": {
          "track":{
            "title": options.title || "剁手帮移动客服",
            "price": options.price,
            "desc": options.desc || "剁手帮致力于全球商品代购服务",
            "img_url": options.img_url|| "//cdn.firstlinkapp.com/static/img/logo_fillet.png",
            "item_url": options.item_url|| location.href
          }
        }
      }
    }
    easemobim && easemobim.bind && easemobim.bind(config)
  };


  if (window.layer) {
    //提示
    layer.msg = function(content, options, end) {
      var type = typeof options === 'function';
      if (type) end = options;

      return layer.open($.extend({
        time: 2,
        anim: false,
        content: content,
        shade: false,
        shadeClose: false,
        style: 'max-width: 300px; box-shadow: none; text-align:center; border:none; font-size:14px; background-color: rgba(0,0,0,.7); color:#fff; word-wrap: break-word; white-space: pre-wrap;',
        end: end
      }, type ? {} : options));
    };

    //loading
    layer.load = function() {
      return layer.open({
        type: 2,
        shadeClose: false,
        className: 'duo-loading',
        anim: false
      });
    };
  }
  var rents_ui = new Class();

  'function' === typeof define ? define(function() {
    return rents_ui;
  }) : 'undefined' !== typeof exports ? module.exports = rents_ui : window.rents_ui = rents_ui;

}();