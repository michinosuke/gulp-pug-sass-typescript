/* eslint-disable no-console */
/*
Usage
`apple.com`というサブディレクトリで作業する場合
gulp --base apple.com
ルートディレクトリで作業する場合
gulp
*/

const gulp = require('gulp');
const notify = require('gulp-notify');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const pug = require('gulp-pug');
const minimist = require('minimist');
const plumber = require('gulp-plumber');
const cached = require('gulp-cached');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const rimraf = require('rimraf');

const base = process.argv.length === 4
  ? `/${minimist(process.argv.slice(2)).base}`
  : '';

const path = {
  pug: {
    input: {
      dir: `src${base}/pug`,
      index: `src${base}/pug/index.pug`,
      all: `src${base}/pug/*.pug`,
    },
    output: {
      dir: `docs${base}`,
    },
  },
  sass: {
    input: {
      dir: `src${base}/sass`,
      index: `src${base}/sass/index.scss`,
      all: `src${base}/sass/*.scss`,
    },
    output: {
      dir: `docs${base}`,
    },
  },
  ts: {
    input: {
      dir: `src${base}/typescript`,
      index: `src${base}/typescript/index.ts`,
      all: `src${base}/typescript/*.ts`,
    },
    output: {
      dir: `docs${base}`,
    },
    babel: {
      dir: `src${base}/typescript/babel`,
      index: `src${base}/typescript/babel/index.js`,
      all: `src${base}/typescript/babel/*`,
    },
  },
};

gulp.task('browser-sync', () => {
  browserSync.init({
    port: 3000,
    files: [`.${base}/**/*.*`],
    browser: 'google chrome',
    server: {
      baseDir: `docs${base}`,
      index: 'index.html',
    },
    reloadDelay: 1000,
    reloadOnRestart: true,
    startPath: 'index.html',
  });
});

gulp.task('reload', (done) => {
  browserSync.reload();
  done();
});

gulp.task('pug', () => gulp.src(path.pug.input.index)
  .pipe(plumber())
  .pipe(cached('pug'))
  .pipe(pug())
  .pipe(gulp.dest(path.pug.output.dir))
  .pipe(notify({
    title: 'Pug compiled.',
    message: new Date(),
    sound: 'Pop',
    icon: './notify-icon/icon_pug.png',
  })));

gulp.task('sass', () => gulp.src(path.sass.input.index)
  .pipe(cached('sass'))
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer())
  .pipe(gulp.dest(path.sass.output.dir))
  .pipe(notify({
    title: 'Sass compiled.',
    message: new Date(),
    sound: 'Pop',
    icon: './notify-icon/icon_sass.png',
  })));

gulp.task('rm-babel', (cb) => {
  rimraf(path.ts.babel.all, cb)
})

gulp.task('babel', () => gulp.src(path.ts.input.all)
  .pipe(babel({
    presets: [
      '@babel/preset-env',
      '@babel/preset-typescript',
    ],
  }))
  .pipe(uglify())
  .pipe(gulp.dest(path.ts.babel.dir)));

gulp.task('bundle', () => browserify(path.ts.babel.index)
  .bundle()
  .on('error', (err) => {
    console.log(err.message);
    console.log(err.stack);
  })
  .pipe(source('bundle.min.js'))
  .pipe(gulp.dest(path.ts.output.dir))
  .pipe(notify({
    title: 'Babel compiled.',
    message: new Date(),
    sound: 'Pop',
    icon: './notify-icon/icon_babel.png',
  })));

gulp.task('default', gulp.parallel('browser-sync', 'pug', 'sass', gulp.series('rm-babel', 'babel', 'bundle'), () => {
  gulp.watch(path.pug.input.all, gulp.series('pug', 'reload'));
  gulp.watch(path.sass.input.all, gulp.series('sass', 'reload'));
  gulp.watch(path.ts.input.all, gulp.series('rm-babel', 'babel', 'bundle', 'reload'));
}));

gulp.task('compile', gulp.parallel('pug', 'sass', gulp.series('rm-babel', 'babel', 'bundle')));
