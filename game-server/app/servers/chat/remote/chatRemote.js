module.exports = function (app) {
    return new ChatRemote(app);
};

var ChatRemote = function (app) {
    this.app = app;
    this.channelService = app.get('channelService');
};

/**
 * 功能:玩家加入聊天服务器
 */
ChatRemote.prototype.add = function (uid, sid, rid, flag, cb) {
    // rid: 客户端房间号
    var channel = this.channelService.getChannel(rid, flag);

    /**
     * uid由3部分组成
     *   (1)名字
     *   (2)* 因此可以用这个符号来分割名字和房间号
     *   (3)rid
     */
    var username = uid.split('*')[0];

    var param = {
        route: 'onAdd', // 客户端使用的路由,可以收到信息
        user: username
    };

    channel.pushMessage(param); // 广播通知其它玩家, 新进入玩家的信息

    /**
     * 最最核心的东西: channel中可以加入不同sid,也就是不同connector服务器上的人可以加入到同一个channel
     */
    if (!!channel) {
        channel.add(uid, sid);
    }

    /**
     * 最最核心的东西:
     *   (1)cb可以用于远程调用时,返回给回调函数
     */
    cb(this.get(rid, flag));
};

/**
 * 功能:得到当前房间的人列表
 */
ChatRemote.prototype.get = function (rid, flag) { // 通过房间id得到房间内的所有人
    var users = [];
    var channel = this.channelService.getChannel(rid, flag);
    if (!!channel) {
        users = channel.getMembers();
    }

    for (var i = 0; i < users.length; i++) {
        users[i] = users[i].split('*')[0]; // 用户名 + ‘*’ + rid，所以这里得到用户名
    }
    return users;
};

/**
 * 功能:从服务器上踢掉这个人
 */
ChatRemote.prototype.kick = function (uid, sid, rid, cb) {
    var channel = this.channelService.getChannel(rid, false);
    if (!!channel) {
        channel.leave(uid, sid);
    }

    var username = uid.split('*')[0];

    var param = {
        route: 'onLeave', // 客户端监听的路由
        user: username
    };

    channel.pushMessage(param);
    cb();
};