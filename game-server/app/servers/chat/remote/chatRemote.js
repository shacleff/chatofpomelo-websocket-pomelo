var room = require("./../../../game/room.js");
var room_mgr = require("./../../../game/room_mgr.js");

var ChatRemote = function (app) {
    this.app = app;
    this.channelService = app.get('channelService');
};

/**
 * 功能:玩家加入聊天服务器
 */
ChatRemote.prototype.add = function (uid, sid, rid, flag, cb) {
    // 房间不存在,则添加房间
    if(!room_mgr.is_exist_room_by_rid(rid)){
        var channel = this.channelService.getChannel(rid, flag);
        var r = new room(this.channelService, channel, rid);
        room_mgr.add_room(rid, r);
    }

    var cur_room =  room_mgr.get_room_by_rid(rid);

    // 在房间内广播消息
    cur_room.broadcast_msg('onAdd', {
        user: uid.split('*')[0]
    });


    // 先广播,在让自己加入
    cur_room.add_player_by_uid_sid(uid, sid);

    cb(this.get(rid, flag));
};

/**
 * 功能:得到当前房间的人列表
 */
ChatRemote.prototype.get = function (rid, flag) { // 通过房间id得到房间内的所有人
    var users = [];
    var cur_room = room_mgr.get_room_by_rid(rid);
    if(cur_room){
        var player_list = cur_room.get_player_list();
        player_list.forEach(function (val, i, arr) {
            users.push(val.username);
        });
    }
    return users;
};

/**
 * 功能:从服务器上踢掉这个人
 */
ChatRemote.prototype.kick = function (uid, sid, rid, cb) {
    var cur_room = room_mgr.get_room_by_rid(rid);
    if(cur_room){
        var player = cur_room.get_player_by_uid(uid);
        cur_room.remove_player_by_uid_sid(uid, sid);
        cur_room.broadcast_msg({
            route: 'onLeave',
            user: player.username
        });
    }

    cb();
};

module.exports = function (app) {
    return new ChatRemote(app);
};