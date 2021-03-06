var gulp = require("gulp"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    minifycss = require("gulp-minify-css"),
    rename = require("gulp-rename"),
    clean = require("gulp-clean");

var less = require('gulp-less');
var path = require('path');
var deployPath_dev = "";
var deployPath = deployPath_dev;




// 处理公共库
// ------------------------------------------------------------
gulp.task("minify-js-index", function(cb) {
    
    return gulp.src([
            // "js/jquery.min.js",
            // "js/infoc.min.js",
            "js/script.js"
        ])
        .pipe(concat("script.min.js"))
        .pipe(uglify())
        .pipe(rename("script.min.js"))
        .pipe(gulp.dest(deployPath+'js'));
   
});
gulp.task("minify-css-index", function() {
    return gulp.src([
            "css/style.less"
        ])
        .pipe(less({
          paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(concat("style.min.css"))
        .pipe(minifycss())
        .pipe(gulp.dest(deployPath+'css'));
});


gulp.task("minify-index", ["minify-js-index", "minify-css-index"]);

// 注册任务
gulp.task("default", ["minify-index", "watch"]);



// 监视文件的变化
// ------------------------------------------------------------
gulp.task("watch", function() {
    gulp.watch([
        "js/lang.js",
        "js/script.js",
        "css/style.less"
    ], ["minify-index"]);
});
