var log = require("./../../../../3rd/log");

module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

var handler = Handler.prototype;

/**
 * 注意connector是多个的，看看怎么区分
 */
handler.enter = function (msg, session, next) {
    var self = this;
    var rid = msg.rid; // 房间id
    var uid = msg.username + '*' + rid; // 用户名字 + '*' + rid 组成用户的唯一标示uid
    var sessionService = self.app.get('sessionService');
    if (!!sessionService.getByUid(uid)) { // 这个next得作用必然是：将当前状态返回给客户端，告诉他出现了500错误
        next(null, {
            code: 500,
            error: true
        });
        return;
    }

    session.bind(uid); //会话绑定uid作为唯一标示
    session.set('rid', rid); //房间id
    session.push('rid', function (err) {
        if (err) {
            console.error('set rid for session service failed! error is : %j', err.stack);
        }
    });

    session.on('closed', onUserLeave.bind(null, self.app));

    /**
     *  uid= jn*1 serverId= connector-server-3 rid= 1
     */
    log.info("uid=", uid, "serverId=", self.app.get('serverId'), "rid=", rid);
    self.app.rpc.chat.chatRemote.add(session, uid, self.app.get('serverId'), rid, true, function (users) {
        next(null, {
            users: users  // 返回给客户端当前多少玩家
        });
    });
};

var onUserLeave = function (app, session) {
    if (!session || !session.uid) {
        return;
    }
    app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
};