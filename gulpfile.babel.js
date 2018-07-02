'use strict';
// 引入 gulp及组件

var gulp = require('gulp'), //基础库
    htmlbeautify = require('gulp-html-beautify'),//HTML美化
    imagemin = require('gulp-imagemin'), //图片压缩
    pngquant = require('imagemin-pngquant'), //图片深度压缩
    spriter = require('gulp-css-spriter'), //图片雪碧图
    minifycss = require('gulp-minify-css'), //css压缩
    cssnano = require('gulp-cssnano'),
    autoprefixer = require('gulp-autoprefixer'), //自动填补css3前缀
    jshint = require('gulp-jshint'), //js检查
    uglify = require('gulp-uglify'), //js压缩
    rename = require('gulp-rename'), //重命名
    concat = require('gulp-concat'), //合并文件
    rimraf = require('rimraf'), //清空文件夹
    connect = require('gulp-connect'), //自动刷新浏览器
    plumber = require('gulp-plumber'), // plumber 给pipe打补丁
    sourcemaps = require('gulp-sourcemaps'), // gulp sourcemaps
    postcss = require('gulp-postcss'),
    watch = require('gulp-watch'), // 使用gulp-watch 监测文件新增与删除
    babel = require('gulp-babel'), // 使用gulp-babel ES6转化工具;
    fileinclude = require('gulp-file-include'),
    bsc = require('browser-sync'),
    changed = require('gulp-changed');//只处理修改过的文件

var htmlSrc = 'src/*.html',
    htmlDst = 'assets/',
    libSrc = 'src/dist/js/lib/**/*',
    libDst = 'assets/dist/js/lib',
    fontSrc = 'src/dist/css/font/**/*',
    fontDst = 'assets/dist/css/font',
    csslibSrc = 'src/dist/csslib/**/*.css',
    cssSrc = 'src/dist/css/**/*.css',
    cssDst = 'assets/dist/css',
    imgSrc = 'src/dist/img/**/*.+(jpeg|jpg|png)',
    imgDst = 'assets/dist/img',
    jsSrc = ['src/dist/js/**/*.js', '!src/dist/js/lib/**/*'],
    jsDst = 'assets/dist/js';



// HTML处理
gulp.task('html', ['css'], function() {
    gulp.src(htmlSrc)
        .pipe(plumber())
        .pipe(fileinclude({
            prefix: '@',
            basepath: '@file'
        }))
      .pipe(changed(htmlDst))
      .pipe(htmlbeautify({
              "indent_size": 4,
              "indent_char": " ",
              "eol": "\n",
              "indent_level": 0,
              "indent_with_tabs": false,
              "preserve_newlines": true,
              "max_preserve_newlines": 10,
              "jslint_happy": false,
              "space_after_anon_function": false,
              "brace_style": "collapse",
              "keep_array_indentation": false,
              "keep_function_indentation": false,
              "space_before_conditional": true,
              "break_chained_methods": false,
              "eval_code": false,
              "unescape_strings": false,
              "wrap_line_length": 0,
              "wrap_attributes": "auto",
              "wrap_attributes_indent_size": 4,
              "end_with_newline": false
          }))
        .pipe(gulp.dest(htmlDst));
});

gulp.task('lib', function() {
    gulp.src(libSrc)
        .pipe(changed(libDst))
        .pipe(gulp.dest(libDst));
});

gulp.task('font', function() {
    gulp.src(fontSrc)
        .pipe(changed(fontDst))
        .pipe(gulp.dest(fontDst));
});

gulp.task('css', function() {
    gulp.src(cssSrc)
        .pipe(changed(cssDst))
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(postcss([
            require('precss'),
        ]))
        .pipe(postcss([
            require('postcss-display-inline-block'),
        ]))
        .pipe(postcss([
            require('autoprefixer'),
        ]))
        .pipe(postcss([
            require('postcss-easysprites')({
                imagePath: '../img',
                spritePath: './assets/dist/img'
            })
        ]))
        .pipe(concat('style.css'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(cssDst))
        .pipe(bsc.reload({
            stream: true
        }));
        // .pipe(bsc.stream({
        //     match: "**/*.css"
        // }));
});


gulp.task('csslib', function() {
    gulp.src(csslibSrc)
        .pipe(changed(cssDst))
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(postcss([
            require('precss'),
        ]))
        .pipe(postcss([
            require('postcss-display-inline-block'),
        ]))
        .pipe(postcss([
            require('autoprefixer'),
        ]))
        .pipe(postcss([
            require('postcss-easysprites')({
                imagePath: '../img',
                spritePath: './assets/dist/img'
            })
        ]))
        .pipe(concat('_common.css'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(cssDst))
        .pipe(bsc.reload({
            stream: true
        }));
        // .pipe(bsc.stream({
        //     match: "**/*.css"
        // }));
});

// 图片处理(未开启)
gulp.task('images', function() {

    gulp.src(imgSrc)
        // .pipe(imagemin({
        //  optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
        //  progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
        //  interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
        //  multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
        //  svgoPlugins: [{
        //      removeViewBox: false
        //  }], //不要移除svg的viewbox属性
        //  use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
        // }))
        .pipe(gulp.dest(imgDst));
});


// js处理
gulp.task('js', function() {
    gulp.src(jsSrc)
        .pipe(plumber())
        .pipe(fileinclude({
            prefix: '@',
            basepath: '@file'
        }))
        .pipe(babel({
            compact: false,
            presets: ['es2015']
        }))
        .pipe(gulp.dest(jsDst));
});

// 清空图片、样式、js
gulp.task('clean', function(cb) {
    rimraf('assets/', cb);
});

// 默认任务 清空图片、样式、js并重建 运行语句 gulp
gulp.task('default', ['clean'], function() {
    gulp.start('lib', 'font', 'images', 'css','csslib', 'html' ,'js');
});

//使用connect启动一个Web服务器
gulp.task('connect', function() {
    // 从这个项目的根目录启动服务器
    var bs = bsc.create();
    bsc.init({
        reloadDelay: 1000,
        server: {
            baseDir: 'assets', //本地服务器目录
            directory: true
        },
        port: 8000
    });
    gulp.watch([htmlSrc,
        libSrc,
        imgSrc,
        jsSrc
    ]).on("change", function() {
        bsc.reload()
    });
});


// 监听任务 运行语句 gulp watch
gulp.task('watch', ['default', 'connect'], function() {
    // 监听css
    gulp.watch(cssSrc, ['css']);
    gulp.watch(csslibSrc, ['csslib']);
    // 监听html
    gulp.watch(htmlSrc, ['html']);
    // 监听images(暂未开启)
    gulp.watch(imgSrc, ['images']);
    // 监听js
    gulp.watch(jsSrc, ['js']);
    // 监听lib
    gulp.watch(libSrc, ['lib']);
});
