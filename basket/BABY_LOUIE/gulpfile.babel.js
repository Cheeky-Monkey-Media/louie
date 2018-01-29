'use strict';

import plugins                from 'gulp-load-plugins';
import yargs                  from 'yargs';
import browser                from 'browser-sync';
import gulp                   from 'gulp';
import rimraf                 from 'rimraf';
import yaml                   from 'js-yaml';
import fs                     from 'fs';
import webpackStream          from 'webpack-stream';
import webpack2               from 'webpack';
import named                  from 'vinyl-named';
import path                   from 'path';
import sassGlob               from 'gulp-sass-glob';

// Better image compression.
import imageminJpegRecompress from 'imagemin-jpeg-recompress';
import imageminPngquant       from 'imagemin-pngquant';

// Load all Gulp plugins into one variable
>>>>>>> Added sass glob, moved some scss to utilites folder
const $ = plugins();

// Check for --production flag.
const PRODUCTION = !!(yargs.argv.production);

// Load settings from config.yml.
const { COMPATIBILITY, PORT, PATHS } = loadConfig();

function loadConfig() {
  let ymlFile = fs.readFileSync('config.yml', 'utf8');
  return yaml.load(ymlFile);
}

// Build the "dist" folder by running all of the below tasks.
gulp.task('build',
 gulp.series(clean, gulp.parallel(sass, javascript, images, sprites), lint));

// Build the "dist" folder by running all of the below tasks.
// `dev` has no clean command. You might see cruft as you develop.
// Nothing compiled gets committed.
gulp.task('dev',
 gulp.series(gulp.parallel(sass, javascript, images, sprites), lint));

// Build the site, run the server, and watch for file changes.
// Both these commands do the same thing, but we add `watch` just in case.
gulp.task('default',
  gulp.series('dev', watch));
gulp.task('watch',
  gulp.series('dev', watch));

// Clean it out.
gulp.task('clean',
  gulp.series(clean));

// Delete the "dist" folder.
// This happens every time a build starts.
function clean(done) {
  rimraf(PATHS.cssDir, done);
  rimraf(PATHS.jsDir, done);
  rimraf(PATHS.imgDir, done);
  rimraf(PATHS.spriteDir, done);
}

// Compile Sass into CSS.
// In production, the CSS is compressed.
function sass() {
  return gulp.src(PATHS.src + '/scss/**/*.scss')
    .pipe($.sourcemaps.init())
    .pipe(sassGlob())
    .pipe($.sass({
      includePaths: PATHS.sass
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: COMPATIBILITY
    }))
    // Comment in the pipe below to run UnCSS in production.
    //.pipe($.if(PRODUCTION, $.uncss(UNCSS_OPTIONS)))
    .pipe($.if(PRODUCTION, $.cleanCss({ compatibility: 'ie9' })))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write('.')))
    .pipe(gulp.dest(PATHS.cssDir));
    // .pipe(browser.reload({ stream: true }));
}

// Lint the JS
function lint() {
  // ESLint ignores files with "node_modules" paths.
  // So, it's best to have gulp ignore the directory as well.
  // Also, Be sure to return the stream from the task;
  // Otherwise, the task may end before the stream has finished.
  return gulp.src([PATHS.src + '/js/**/*.js','!node_modules/**'])
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
    .pipe($.eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe($.eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    .pipe($.eslint.failAfterError());
}

let webpackConfig = {
  resolve: {
    modules: [
      path.resolve(__dirname, 'node_modules')
    ]
  },
  module: {
    rules: [
      {
        test: /.js$/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      }
    ]
  }
}

// Combine JavaScript into one file.
// In production, the file is minified.
function javascript() {
  return gulp.src(PATHS.entries)
    .pipe(named())
    .pipe($.sourcemaps.init())
    .pipe(webpackStream(webpackConfig, webpack2))
    .pipe($.if(PRODUCTION, $.uglify()
      .on('error', e => { console.log(e); })
    ))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.jsDir));
}

// Copy images to the "dist" folder.
// In production, the images are compressed.
function images() {
  return gulp.src(PATHS.src + '/images/**/*.{png,jpeg,jpg,svg,png}')
    .pipe($.if(PRODUCTION, $.imagemin([
      $.imagemin.gifsicle(),
      $.imagemin.jpegtran(),
      $.imagemin.optipng(),
      $.imagemin.svgo(),
      imageminJpegRecompress(),
      imageminPngquant(),
    ])))
    .pipe(gulp.dest(PATHS.imgDir));
}

// Sprite configuration.
var spriteConfig = {
  mode: {
    sprite: {
      mode: 'css',
      // Change below to remove cache-busting feature.
      bust: false,
      render: {
        scss: {
          template: './src/sprite-templates/sprite-template.scss',
          dest: '_sprite.scss'
        }
      },
      example: true
    },
    datauri: {
      mode: 'css',
      // Change below to remove cache-busting feature.
      bust: false,
      render: {
        scss: {
          template: './src/sprite-templates/datauri-template.scss',
          dest: '_datauri.scss'
        }
      },
      variables: {
        datauri : function() {
          return function(svg, render) {
            return encodeURI(render(svg));
          }
        }
      },
      example: true
    },
    symbol: {
      inline: true,
      prefix: 'icon-%s',
      example: true
    }
  }
};

// Create sprite files.
function sprites() {
  return gulp.src(PATHS.src + '/sprites/**/*')
    .pipe($.svgSprite(spriteConfig))
    .pipe(gulp.dest(PATHS.spriteDir));
}

// Start a server with BrowserSync to preview the site in.
// function server(done) {
//   browser.init({
//     server: PATHS.dist, port: PORT
//   });
//   done();
// }

// Reload the browser with BrowserSync.
// function reload(done) {
//   browser.reload();
//   done();
// }

// Watch for changes to static assets, sprites, Sass, and JavaScript.
function watch() {
  gulp.watch(PATHS.src + '/**/*.scss').on('all', sass);
  gulp.watch(PATHS.src + '/**/*.js', gulp.series(javascript, lint));
  gulp.watch(PATHS.src + '/images/**/*').on('all', images);
  gulp.watch(PATHS.src + '/sprites/**/*').on('all', sprites);
}
