const gulp = require("gulp");
const { src, dest, parallel, series, watch } = require("gulp");
const browserSync = require("browser-sync").create();
const concat = require("gulp-concat");
const media = require("gulp-group-css-media-queries");
const uglify = require("gulp-uglify-es").default;
const autoprefixer = require("gulp-autoprefixer");
const cleancss = require("gulp-clean-css");
const imagemin = require("gulp-imagemin");
const clean = require("gulp-clean");

function browsersync() {
  browserSync.init({
    server: { baseDir: "app/" },
    notify: false,
    online: true,
  });
}

function scripts() {
  return src("app/js/**/*.js")
    .pipe(concat("app.min.js"))
    .pipe(uglify())
    .pipe(dest("dist/js/"))
    .pipe(browserSync.stream());
}

function styles() {
  return src("app/css/**/*.css")
    .pipe(concat("style.min.css"))
    .pipe(media())
    .pipe(
      autoprefixer({ overrideBrowserslist: ["last 10 versions"], grid: true })
    )
    .pipe(
      cleancss({
        level: { 1: { specialComments: 0 } },
      })
    )
    .pipe(dest("dist/css/"))
    .pipe(browserSync.stream());
}

function images() {
  return src("app/images/src/**/*")
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 80, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest("dist/images/src/"))
    .pipe(browserSync.stream());
}

function buildcopy() {
  return src(
    ["app/fonts/*", "app/libs/**/*", "app/**/*.html", "app/images/favicon/*"],
    {
      base: "app",
    }
  ).pipe(dest("dist"));
}

function cleandist() {
  return src("dist", { allowEmpty: true }).pipe(clean());
}

function startwatch() {
  watch(["app/**/*.js", "!app/**/*.min.js"], scripts);

  watch("app/**/*.css", styles);

  watch("app/**/*.html").on("change", browserSync.reload);

  watch("app/images/**/*", images);
}

exports.browsersync = browsersync;

exports.scripts = scripts;

exports.styles = styles;

exports.images = images;

exports.build = series(cleandist, buildcopy, styles, scripts, images);

exports.default = parallel(styles, scripts, browsersync, startwatch);
