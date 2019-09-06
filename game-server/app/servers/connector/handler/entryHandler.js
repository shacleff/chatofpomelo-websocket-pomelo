var log = require("./../../../../3rd/log");

module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

var handler = Handler.prototype;

handler.enter = function (msg, session, next) {
    var self = this;
    var rid = msg.rid; // 房间id,字符串
    var uid = msg.username + '*' + rid; // 用户名字 + '*' + rid 组成用户的唯一标示uid
    var sessionService = self.app.get('sessionService');

    // 根据uid判断已经在房间
    if (!!sessionService.getByUid(uid)) {
        next(null, {
            code: 500,
            error: true
        });
        return;
    }

    /**
     * 最核心的
     *   (1)只有一次bind,表示唯一玩家
     */
    session.bind(uid);

    /**
     * 最核心的:
     *   (1)rid是set进来的, push后，后端服务器才可以set到;
     *   (2)rid所在的房间，同一个房间的玩家，可以在不同connector服务器上;
     *   (3)同一个rid的,则在同一个聊天服务器上;
     */
    session.set('rid', rid);
    session.push('rid', function (err) {
        if (err) {
            console.error('set rid for session service failed! error is : %j', err.stack);
        }
    });

    session.on('closed', onUserLeave.bind(null, self.app));

    self.app.rpc.chat.chatRemote.add(session, uid, self.app.get('serverId'), rid, true, function (users) {
        next(null, {
            users: users
        });
    });
};

var onUserLeave = function (app, session) {
    if (!session || !session.uid) {
        return;
    }
    app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
};