/**
 * Gulp and gulp modules
 * Edit this file accordingly for your workflow.
 * Commonly you'll need to update src and dest paths
 */

/**
 * Modules
 */
 var gulp = require('gulp'),
     //css
     postcss = require('gulp-postcss'),
     nano = require('gulp-cssnano'),

     //JS
     browserify = require('browserify'),
     uglify = require('gulp-uglify'),

     //html
     handlebars = require('gulp-compile-handlebars'),
     minify = require('gulp-htmlmin'),

     //util
     rename = require('gulp-rename'),
     plumber = require('gulp-plumber'),
     notify = require('gulp-notify'),
     streamify = require('gulp-streamify'),
     util = require('gulp-util'),
     source = require('vinyl-source-stream'),
     browserSync = require('browser-sync').create(),
     merge = require('merge-stream'),
     del = require('del'),
     events = require('events'),
     fs = require('fs'),
     dotenv = require('dotenv').config({silent: true}); //Load .env - shut up if there's no .env we don't require it

/**
 * try to require something - fail silently if nothings found
 * @method requireExists
 */
function requireExists( modulePath ){ // force require
    try {
        return require( modulePath );
    }
    catch (e) {
        //we don't really need to do anything here
    }
}

function stackTrace(err) {
    var stack = '';

    if(typeof err !== 'object' || !err.hasOwnProperty('stack'))
        return stack;

    stack = '\nStacktrace:';
    stack = '====================';
    stack = err.stack;

    return stack;
}


/**
 * Project variables - should be edited using external gulpconfig.js file
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

//env overrides gulpconfig
config.project.dev.hostname = process.env.BROWSERSYNC_PROXY || config.project.dev.hostname;

/**
 * copy taks handler
 * loops through all copy ops and merges them into a single stream for output
 */
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

/**
 * copy task - actually runs the copy op.
 * @method copyTask
 */
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
            debug: !util.env.production
        })
        .bundle() // Add transformation tasks to the pipeline here.
        .on('error', function(err){
            console.log(err);

            notify({
                title: "Gulp Browserify",
                sound: "Basso"
            }).write(err);

            this.emit('end');
        })
        .pipe(source(config.js.entrypoint))
        .pipe( !!util.env.production ? streamify(uglify()) : util.noop() )
        .pipe(gulp.dest(config.js.dest))
        .pipe(browserSync.stream());

});

/**
 * styles/postcss
 */
gulp.task('styles', ['postcss']);
gulp.task('postcss', function() {
    // process cs
    return gulp.src(config.css.src + config.css.entrypoint)
        .pipe(plumber({
            errorHandler: notify.onError({
                title: "Gulp Styles",
                message: "Error: <%= error.message %>",
                sound: "Basso"
            })
        }))
        .pipe(postcss([
            require("postcss-import")(),
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
        .pipe( !!util.env.production ? streamify(nano({
            safe: true,
            autoprefixer: {
                browsers: config.autoprefix
            }
        })) : util.noop() )
        .pipe(gulp.dest(config.css.dest))
        .pipe(browserSync.stream());

});

gulp.task('handlebars', ['templates']);
gulp.task('templates', ['data'], function () {

    var src = config.handlebars.src;

    return gulp.src(src)
        .pipe(plumber({
            errorHandler: notify.onError({
                title: "Gulp Templates",
                message: "Error: <%= error.message %>",
                sound: "Basso"
            })
        }))
        .pipe(handlebars(config.templateData,
            config.handlebars || {}
        ))
        .pipe(rename(function (path) {
            path.extname = (path.extname === '' ) ? '' : '.html'
        }))
        .pipe( !!util.env.production ? minify({
            collapseWhitespace: true,
            removeComments: true
        }) : util.noop() )
        .pipe(gulp.dest(config.handlebars.dest))
        .pipe(browserSync.stream());
});

gulp.task('data', function(){

    //error event emitter
    var emitter = new events.EventEmitter();
    emitter.on('error', function(msg, e){
        notify({
            title: "Gulp Browserify",
            sound: "Basso"
        }).write(msg + ".\n" + stackTrace(e));
    });

    //ensure config.data is set
    if(!config.hasOwnProperty('data') || config.data === '')
        return false;

    try{
        //ensure the file exists
        fs.accessSync(config.data, fs.F_OK);

        //set the config.templateData variable to the contents for
        config.templateData = JSON.parse(
            fs.readFileSync(config.data)
        );

    } catch (e) {
        //emit a new error event
        emitter.emit('error', 'Data file could not be read at: ' + config.data, e);

        //set the templatedata to an empty object
        config.templateData = {};
    }

    //get package info to expose a few things to our templates
    //!!DONT over expose - these can go public.
    var info = require('./package.json');
    config.templateData = Object.assign({}, config.templateData, {
        "production": !!util.env.production,
        "version": info.version
    }, (!!util.env.production ? {} : require('dotenv').config({silent: true}) ) );

    return config.templateData;
});

/**
 * Watch
 */
gulp.task('watch', ['default'], function() {

    //initialize browsersync
    browserSync.init({
        proxy: config.project.dev.hostname,
    });

    //watch for stylesheet changes
    gulp.watch(config.css.src + '**/*.css', ['styles']);

    //watch for js changes
    gulp.watch(config.js.src + '**/*.js', ['js']);

    //watch for file changes if they are set
    gulp.watch( config.files.src, ['templates'] );

    //watch for changes on our data file
    gulp.watch( config.data, ['templates'] );

});

/**
 * clean
 */

 gulp.task('clean', function() {
   return del.sync('httpdocs');
 });

/**
 * Default/Build Task
 */
gulp.task('default', ['clean', 'styles', 'js', 'copy', 'templates']);
gulp.task('build', ['default']);
