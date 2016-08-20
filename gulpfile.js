/**
 * Gulp and gulp modules
 * Edit this file accordingly for your workflow.
 * Commonly you'll need to update src and dest paths
 */

//Load .env
require('dotenv').config();

function requireExists( modulePath ){ // force require
    try {
        return require( modulePath );
    }
    catch (e) {
        //we don't really need to do anything here
    }
}

/**
 * Add project variables here
 * Include Trailing slashes
 * path is relative to this file.
 * @type {Object}
 */
var config = Object.assign({
    project: {
        dev: {
            hostname: process.env.BROWSERSYNC_PROXY
        }
    },
    js: {
        entrypoint: 'app.js',
        src: 'resources/assets/js/',
        dest: 'httpdocs/assets/js/'
    },
    css: {
        entrypoint: 'app.css',
        src: 'resources/assets/css/',
        dest: 'httpdocs/assets/css/'
    },
    files: {
        src: []
    },
    copy: [
        {
            src: [
                'resources/assets/img/**/*.jpg',
                'resources/assets/img/**/*.jpeg',
                'resources/assets/img/**/*.gif',
                'resources/assets/img/**/*.png',
                'resources/assets/img/**/*.svg'
            ],
            dest: 'httpdocs/assets/img/'
        }
    ],
    autoprefix: [
        'last 2 versions',
        'ie >= 8',
        'ios > 6',
        'safari >= 5',
        'android >= 4'
    ]
}, requireExists('./gulpconfig') || {} );

var gulp = require('gulp'),
    //css
    postcss = require('gulp-postcss'),
    uglify = require('gulp-uglify'),
    nano = require('gulp-cssnano'),

    //JS
    browserify = require('browserify'),

    //util
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    streamify = require('gulp-streamify'),
    source = require('vinyl-source-stream'),
    browserSync = require('browser-sync').create(),
    merge = require('merge-stream');

//copy task
gulp.task('copy', function(){

    //if there are no copy tasks
    if( !config.hasOwnProperty('copy') || config.copy.length <= 0 )
        return;

    //track copy streams
	var streams = [];

	//for through each copy routine and handle each stream
	for( var index in config.copy ){
        streams.push( copyTask( config.copy[index].src, config.copy[index].dest ) );
    }

	//return all copy streams
	return merge(streams);
});

var copyTask = function( src, dest ){
    return gulp.src( src )
        .pipe(plumber({
            errorHandler: notify.onError({
                title: "Gulp Copy",
                message: "Error: <%= error.message %>",
                sound: "Basso"
            })
        }))
        .pipe( gulp.dest( dest ) );
}

/**
 * js/browserify
 */
gulp.task('js', ['browserify']);
gulp.task('browserify', function() {
    return browserify({
            cache: {},
            packageCache: {},
            entries: [config.js.src + config.js.entrypoint],
            debug: true
        })
        .bundle()
        .on('error', function(err){
            console.log(err);

            notify({
                title: "Gulp Browserify",
                sound: "Basso"
            }).write(err);

            this.emit('end');
        })
        .pipe(source(config.js.entrypoint))
        // Add transformation tasks to the pipeline here.
        .pipe(gulp.dest(config.js.dest))
        .pipe(browserSync.stream())
        .pipe(rename(config.js.entrypoint.replace('.js', '.min.js')))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest(config.js.dest));
});

/**
 * styles/postcss
 */
gulp.task('styles', ['postcss']);
gulp.task('postcss', function() {
    // process cs
    return (
        gulp.src(config.css.src + config.css.entrypoint)
        .pipe(plumber({
            errorHandler: notify.onError({
                title: "Gulp Styles",
                message: "Error: <%= error.message %>",
                sound: "Basso"
            })
        }))
        .pipe(postcss([
            require("postcss-import")(),
            require("postcss-url")({
                url: "inline"
            }),
            require("postcss-cssnext")({
                browsers: config.autoprefix
            }),
            require("postcss-browser-reporter")(),
            require("postcss-reporter")(),
        ], {
            from: config.css.src + config.css.entrypoint,
            to: config.css.dest + config.css.entrypoint,
            map: {
                inline: true
            }
        }))
        .pipe(gulp.dest(config.css.dest))
        .pipe(browserSync.stream())
        .pipe(rename(config.css.entrypoint.replace('.css', '.min.css')))
        .pipe(streamify(nano({
            safe: true
        })))
        .pipe(gulp.dest(config.css.dest))
    );

});

/**
 * Watch
 */
gulp.task('watch', ['styles', 'js'], function() {

    //initialize browsersync
    browserSync.init({
        proxy: config.project.dev.hostname,
    });

    //watch for stylesheet changes
    gulp.watch(config.css.src + '**/*.css', ['styles']);

    //watch for js changes
    gulp.watch(config.js.src + '**/*.js', ['js']);

    //watch for file changes if they are set
    gulp.watch( config.files.src, browserSync.reload );

});

/**
 * Default/Build Task
 */
gulp.task('default', ['styles', 'js', 'watch']);
gulp.task('build', ['styles', 'js', 'copy']);
