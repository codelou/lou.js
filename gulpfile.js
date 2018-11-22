var gulp = require('gulp');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify-css');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var pkg = require('./package.json');
var connect = require('gulp-connect');

// 清理编译目录
gulp.task('clean', function() {
  var st = gulp.src('./res/build/*', {read: false});
  st.pipe(clean());

  return st;
})

// 构建 HMTL 文件
gulp.task('html', ['clean'], function() {
  var st = gulp.src('./views/src/**/*.html');
  st.pipe(
    gulp.dest('./views/build/')
  );

  return st;
})

// 拷贝图片
gulp.task('copy-img', ['html'], function() {
  var st = gulp.src('./res/src/images/**/*');
  st.pipe(
    gulp.dest('./res/build/images')
  );
  
  return st;
})

// 压缩 lib 库 css 资源
gulp.task('min-css:lib', ['copy-img'], function() {
  var st = gulp.src('./res/src/lib/**/*.css');
  st.pipe(
    minify()
  ).pipe(
    gulp.dest('./res/build/lib')
  );

  return st;
})

// 压缩其它 css 资源
gulp.task('min-css', ['min-css:lib'], function() {
  var st = gulp.src('./res/src/css/**/*.css');
  st.pipe(
    minify()
  ).pipe(
    gulp.dest('./res/build/css')
  );

  return st;
})

// 压缩 js 资源
gulp.task('min-js', ['min-css'], function() {
  var st = gulp.src('./res/src/lib/**/*.js');
  st.pipe(
    uglify()
  ).pipe(
    gulp.dest('./res/build/lib')
  );

  return st;
})

// 合并 js 资源

gulp.task('pkg-js', ['min-js'], function() {
  // 公共库
  var duoui_libs = [
    './res/src/lib/laytpl.js',
    './res/src/lib/layer/layer.js',
    './res/src/lib/zepto.js',
    './res/src/lib/weixin1.0.js',
    './res/src/lib/duoui.js'  
  ];
  
  var st = gulp.src(duoui_libs);
  st.pipe(
    concat('duoui-'+ pkg.version +'.js')
  ).pipe(
    uglify()
  ).pipe(
    gulp.dest('./res/build/lib/all/')
  ).pipe(
    concat('duoui.js')
  ).pipe(
    gulp.dest('./res/build/lib/all/')
  );

  return st;
})

//构建服务
gulp.task('server', function() {
    connect.server({
        livereload: true,
        port: 8889
    });
});

// 默认任务
gulp.task('default', ['pkg-js', 'server'], function() {

})


