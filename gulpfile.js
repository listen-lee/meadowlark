// 导入工具包 require('node_modules里对应模块')
const gulp = require('gulp'),// 本地安装gulp所用到的地方
    less = require('gulp-less'),
    eslint = require('eslint');
// 定义一个testLess任务（自定义任务名称）
/*gulp.task('testLess', (done) => {
    gulp.src('public/less/index.less')// 该任务针对的文件
        .pipe(less()) // 该任务调用的模块
        .pipe(gulp.dest('public/css')); // 将会在src/css 下生产index.css
    done();
});*/
gulp.task('testLess', async () => {
    await gulp.src('public/less/**.less')// 该任务针对的文件
        .pipe(less()) // 该任务调用的模块
        .pipe(gulp.dest('public/css')); // 将会在src/css 下生产index.css
});
// gulp.task('default', ['testLess']); //定义默认任务 elseTask为其他任务，该示例没有定义elseTask任务