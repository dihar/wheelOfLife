var gulp = require('gulp');
var browserSync 	= require('browser-sync').create();
var reload 	= browserSync.reload;

gulp.task('serve' ,function () {
    browserSync.init({
        server: {
            baseDir: "./"
        },
        open: false
    });
});

gulp.task('watch',function(){
    gulp.watch("./**/*.{html, js}", reload);
});

gulp.task('default', ['serve','watch']);