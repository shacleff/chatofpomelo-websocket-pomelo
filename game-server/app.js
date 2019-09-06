var pomelo = require('pomelo');
var routeUtil = require('./app/util/routeUtil');
var helloWorld = require('./app/components/HelloWorld');   // 组件
var timeReport = require('./app/modules/timeReport');      // 监控上报

var app = pomelo.createApp();

app.set('name', 'chatofpomelo-websocket');

app.configure('production|development', 'gate', function () {
    app.set('connectorConfig', {
        connector: pomelo.connectors.hybridconnector,
        useProtobuf: true
    });
});

app.configure('production|development', 'connector', function () {
    app.set('connectorConfig', {
        connector: pomelo.connectors.hybridconnector,
        heartbeat: 3,
        useDict: true,
        useProtobuf: true
    });
});

app.configure('production|development', function () {
    app.route('chat', routeUtil.chat); // 不设置路由将使用默认路由
    app.route('time', routeUtil.getCurrentTime);

    app.filter(pomelo.timeout());      // 过滤器
});

// app.configure('production|development', 'chat', function () {
//     var abuseFilter = require('./app/servers/chat/filter/abuseFilter'); // 新增脏话过滤器
//     app.filter(abuseFilter());
// });

/**
 * 功能：route路由压缩
 *   当服务端给客户端发送的消息路由确定的时候，比如onLeave onChat onAdd等消息，这样的路由长度还是过长，
 *    浪费了带宽，为了缩短路由信息，pomelo采用了基于字典的路由信息压缩;
 *
 *   在dictionary.json中配置即可;
 */
app.configure('production|development', 'gate', function () {
    app.set('connectorConfig', {
        connector: pomelo.connectors.hybridconnector,
        useDict: true,
        useProtobuf: true
    });
});

// helloworld组件每5s上报一次
// app.configure('production|development', 'master', function () {
//     app.load(helloWorld, {interval: 5000});
// });

// 上报
// app.registerAdmin(timeReport, {
//     app: app
// });

app.start();

process.on('uncaughtException', function (err) {
    console.error('全局 Caught exception: ' + err.stack);
});