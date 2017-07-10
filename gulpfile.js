var gulp = require('gulp');
var env = require('gulp-env');
var nodemon = require('gulp-nodemon');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();

var options = {
	path: 'app.js'
};

var serverFiles = [
	'./app.js',
	'./gulpfile.js',
	'./route/*.js',
	'./model/*.js',
	'./config/*.js'
];

gulp.task('sass', function () {
	return gulp.src('./sass/**/*.scss')
	.pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
	.pipe(gulp.dest('./css'));
});

gulp.task('sass:watch', function () {
	gulp.watch('./sass/**/*.scss', ['sass']);
});

gulp.task('nodemon', function() {
	var configFile = null;
	var environmentType = process.env.NODE_ENV || 'development';

	//let's set NODE_ENV, just in case its undefined
	process.env.NODE_ENV = environmentType;
	//defaults to development unless explicitly stated
	switch(environmentType)
	{
		case 'development':
		configFile = './config/environments/development.json'
		break;
		case 'test':
		configFile = './config/environments/test.json'
		break;
		case 'production':
		configFile = './config/environments/production.json'
		break;
	}

	env({
		file: configFile,
		vars: {
			//this overrides configFile file
			// 'PORT': 3003
		}
	});

	nodemon({
		script: 'server.js',
		ext: 'js html'
		// other config ...
	}).on('restart', function () {
		console.info('Restarting..... 😁');
	}).on('start', () => {
		console.info('Loading ' + environmentType + ' environment');
	}).on('quit', () => {
		// nodemon.emit('bye!');
	});
});

gulp.task( 'default', ['serve'], function() {
	//add stuff here
});

//==============================================================================
// IRVING IS USING BROWSERSYNC
//==============================================================================
gulp.task('sassBS', function() {
    return gulp.src('./sass/**/*.scss')
        .pipe(sass.sync({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(gulp.dest('./css'))
        .pipe(browserSync.stream());
});

gulp.task('nodemonBS', function(cb) {
	// Flag to start nodemon just once
	var called = false;

	var configFile = null;
	var environmentType = process.env.NODE_ENV || 'development';

	//let's set NODE_ENV, just in case its undefined
	process.env.NODE_ENV = environmentType;
	//defaults to development unless explicitly stated
	switch(environmentType)
	{
		case 'development':
		configFile = './config/environments/development.json'
		break;
		case 'test':
		configFile = './config/environments/test.json'
		break;
		case 'production':
		configFile = './config/environments/production.json'
		break;
	}

	env({
		file: configFile,
		vars: {
			//this overrides configFile file
			// 'PORT': 3003
		}
	});

	nodemon({
		script: 'server.js',
		ext: 'js html'
		// other config ...
	}).on('restart', function () {
		console.info('Restarting..... 😁');
		browserSync.reload({
			stream: false
		});
	}).on('start', () => {
		if (!called) {
			cb();
		}
		called = true;
		console.info('Loading ' + environmentType + ' environment');
	}).on('quit', () => {
		// nodemon.emit('bye!');
	});
});

gulp.task('serve', ['sassBS', 'nodemonBS'], function() {

	browserSync.init({
		proxy: "localhost:3002", // local node app address
		port: 5002, // use *different* port than above
		notify: true,
		reloadDelay: 1500,
		ui: {
			port: 3022
		}
	});

	gulp.watch("./sass/**/*.scss", ['sassBS']);
	gulp.watch("./html/**/*.html").on('change', browserSync.reload);
});

gulp.task('serveBS', ['serve'], function() {

});
