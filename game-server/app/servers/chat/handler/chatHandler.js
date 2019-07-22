module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

var handler = Handler.prototype;

handler.send = function (msg, session, next) {
    var rid = session.get('rid'); // 房间rid
    var username = session.uid.split('*')[0]; // 谁发送的消息
    var channelService = this.app.get('channelService');

    var param = {
        from: username,     //谁发的
        target: msg.target, //发给谁
        msg: msg.content    //聊天消息内容
    };

    channel = channelService.getChannel(rid, false);

    if (msg.target == '*') {
        channel.pushMessage('onChat', param);
    } else {
        var tuid = msg.target + '*' + rid;
        var tsid = channel.getMember(tuid)['sid'];

        channelService.pushMessageByUids('onChat', param, [{
            uid: tuid,
            sid: tsid
        }]);
    }

    next(null, {
        route: msg.route
    });
};