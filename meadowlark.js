let express = require('express');
let fortune = require('./lib/fortune');
let app = express();
let formidable = require('formidable')
let credentials = require('./credentials');
let mongoose = require('mongoose');
let opts = {
    server: {
        socketOptions: {keepAlive: 1}
    }
};
let server;
let tours = [
    {id: 0, name: 'Hood River', price: 99.99},
    {id: 1, name: 'Oregon Coast', price: 149.95}
];

switch (app.get('env')) {
    case 'development':
        mongoose.connect(credentials.mongo.development.connectionString, opts);
        break;
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString, opts);
        break;
    default:
        throw new Error(`Unknown execution environment: ${app.get('env')}`);
}
/***exception-handler**/
app.use(function (req, res, next) {
    // 为这个请求创建一个域
    let domain = require('domain').create();
    domain.on('error', function (err) {
        console.error('DOMAIN ERROR CAUGHT\n', err.stack);
        try {
            // 在5秒内进行故障保护关机
            setTimeout(function () {
                console.error('Fail safe shutdown.');
                process.exit(1);
            }, 5000);
            // 从集群中断开
            let worker = require('cluster').workers;
            console.log(typeof worker);
            if (worker && Object.keys(worker).length !== 0) worker.disconnect();

            // 停止接收新请求
            server.close();

            try {
                // 尝试使用Express错误路由
                next(err);
            } catch (err) {
                // 若果Express 错误路由失效，尝试返回普通文本响应
                console.error('Express error mechanism failed.\n', err.stack);
                res.statusCode = 500;
                res.setHeader('content-type', 'text/plain');
                res.end('Server error.');
            }
        } catch (err) {
            console.error('Unable to send 500 response.\n', err.stack);
        }
    });
    // 向域中添加请求和响应对象
    domain.add(req);
    domain.add(res);
    //执行该域中剩余的请求链
    domain.run(next);
});
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
    secret: credentials.cookieSecret,
    resave: false,
    saveUninitialized: true
}));

switch (app.get('env')) {
    case 'development':
        // 紧凑的、彩色的开发日志
        app.use(require('morgan')('dev'));
        break;
    case 'production':
        // 模块‘express-logger’支持按日志循环
        app.use(require('express-logger')({
            path: __dirname + '/log/requests.log'
        }));
        break;
}

app.use(function (req, res, next) {
    let cluster = require('cluster');
    if (cluster.isWorker) console.log('Worker %d received request', cluster.worker.id);
    next();
});

// 引入body-parser
// app.use(require('body-parser')());
app.use(require('body-parser').urlencoded({
    extended: true
}));
// 设置handlebars 视图引擎
let handlebars = require('express-handlebars')
    .create({
        defaultLayout: 'main',
        helpers: {
            section: function (name, options) {
                if (!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            }
        }
    });
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
/*************************************
 * test start
 * @returns {{locations: *[]}}
 */
app.use(function (req, res, next) {
    console.log(`processing request for "${req.url}"...`)
    next();
});

app.use(function (req, res, next) {
    console.log('terminating request');
    // res.send('thanks for playing!');
    next();
});
app.use(function (req, res, next) {
    console.log('whoops, i\'ll never get called!');
    next();
});

/*******************test end**************************/

// mocked weather data
function getWeatherData() {
    return {
        locations: [
            {
                name: 'Portland',
                forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                weather: 'Overcast',
                temp: '54.1 F (12.3 C)',
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)',
            },
            {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)',
            },
        ],
    };
}

// middleware to add weather data to context
app.use(function (req, res, next) {
    if (!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weatherContext = getWeatherData();
    next();
});


/*********exception-handler-end*****************/
/**
 * exception-test
 */
app.get('/fail', function (req, res) {
    throw new Error('Nope!');
});

app.get('/epic-fail', function (req, res) {
    process.nextTick(function () {
        throw new Error('Kaboom');
    })
});
/********************************************/
// 设置路由
app.get('/', function (req, res) {
    req.session.userName = 'Anonymous';
    res.render('home');
    console.log(req.session.userName);
});

app.get('/session-test', function (req, res) {
    let userName = req.session.userName;
    if (userName) {
        res.send(`userName: ${userName}`)
    } else {
        res.send('no session info');
    }

});

app.get('/about', function (req, res) {
    res.clearCookie('monster');
    let monster = req.cookies.monster;
    let signedMonster = req.signedCookies.signed_monster;
    if (monster) {
        console.log(`monster: ${monster}`);
    } else {
        res.cookie('monster', 'nom nom');
    }
    if (signedMonster) {
        console.log(`signed_monster: ${signedMonster}`);
    } else {
        res.cookie('signed_monster', 'nom nom', {signed: true});
    }
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

app.get('/api/tours', function (req, res) {
    /*    let toursXml = '<?xml version="1.0"?><tours>' +
            tours.map(function (t) {
                return '<tour price="' + t.price +
                    '" id="' + t.id + '">' + t.name + '</tour>';
            }).join('') + '</tours>';
        let toursText = tours.map(function (t) {
            return t.id + ': ' + t.name + ' (' + t.price + ')';
        }).join('\n');
        */

    let toursXml = '<?xml version="1.0"?><tours>' +
        tours.map(function (p) {
            return '<tour price="' + p.price +
                '" id="' + p.id + '">' + p.name + '</tour>';
        }).join('') + '</tours>';
    let toursText = tours.map(function (p) {
        return p.id + ': ' + p.name + ' (' + p.price + ')';
    }).join('\n');

    res.format({
        'application/json': function () {
            res.json(tours);
        },
        'application/xml': function () {
            res.type('application/xml');
            res.send(toursXml);
        },
        'text/xml': function () {
            res.type('text/xml');
            res.send(toursXml);
        },
        'text/plain': function () {
            res.type('text/plain');
            res.send(toursText);
        }
    });
});

app.put('/api/tour/:id', function (req, res) {
    let p = tours.some(function (p) {
        return p.id == req.params.id;
    });
    console.log(p);
    if (p) {
        if (req.query.name) p.name = req.query.name;
        if (req.query.price) p.price = req.query.price;

        res.json({success: true});
    } else {
        res.json({error: 'No such tour exists.'});
    }
    console.log(tours);
});

// API 用于删除一个产品
app.delete('/api/tour/:id', function (req, res) {
    let i;
    for (i = tours.length - 1; i >= 0; i--)
        if (tours[i].id == req.params.id) break;
    if (i >= 0) {
        tours.splice(i, 1);
        res.json({success: true});
    } else {
        res.json({error: 'No such tour exists.'});
    }
    console.log(tours);
});

//
app.get('/newsletter', function (req, res) {
    // 我们会在后面学到CSRF 目前，只是提供一个虚拟值
    res.render('newsletter', {csrf: 'CSRF token goes here'});
});

app.post('/process', function (req, res) {
    console.log(`Form (from querystring): ${req.query.form}`);
    console.log(`CSRF token (from hidden form field): ${req.body._csrf}`);
    console.log(`Name (from visible form field): ${req.body.name}`);
    console.log(`Email (from visible form field): ${req.body.email}`);
    res.redirect(303, '/thank-you');
});

app.get('/thank-you', function (req, res) {
    res.render('thank-you');
});
app.get('/jquery-test', function (req, res) {
    res.render('jquery-test');
});

app.get('/contest/vacation-photo', function (req, res) {
    let now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(),
        month: now.getMonth()
    })
});

app.post('/contest/vacation-photo/:year/:month', function (req, res) {
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) return res.redirect(303, '/error');
        console.log('received fields: ');
        console.log(fields);
        console.log('received files: ');
        console.log(files);
        res.redirect(303, '/thank-you');
    })
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

function startServer() {
    server = app.listen(app.get('port'), function () {
        console.log(`Express started in ${app.get('env')} on http://localhost: ${app.get('port')};  press Ctrl-C to terminate.`)
    });
}

if (require.main === module) {
    // 应用程序直接运行；启动应用服务器
    startServer();
} else {
    // 应用程序作为一个模块通过“require”引入：导出函数
    // 创建服务器
    module.exports = startServer;
}