let express = require('express');
let fortune = require('./lib/fortune');
let app = express();

// 设置handlebars 视图引擎
let handlebars = require('express-handlebars')
    .create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

// static 中间件
app.use(express.static(__dirname + '/public'));

// 测试,需要在所有路由之前
app.use(function (req, res, next) {
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
});

// 设置路由
app.get('/', function (req, res) {
    res.render('home');
});

app.get('/about', function (req, res) {
    res.render('about', {fortune: fortune.getFortune(), pageTestScript: '/qa/tests-about.js'});
});

app.get('/tours/hood-river', function (req, res) {
    res.render('tours/hood-river');
});

app.get('/tours/request-group-rate', function (req, res) {
    res.render('tours/request-group-rate');
});

app.get('/headers', function (req, res) {
    res.set('Content-type', 'text/plain');
    let s = '';
    for (let name in req.headers) s += `${name}: ${req.headers[name]}`
    res.send(s);

});

// 定制404页面
app.use(function (req, res) {
    res.status(400);
    res.render('404');
});

// 定制500页面啊
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + "; press Ctrl-C to terminate.")
});
