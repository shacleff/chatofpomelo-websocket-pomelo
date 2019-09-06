var room = require("./../../../game/room.js");
var room_mgr = require("./../../../game/room_mgr.js");

var Handler = function (app) {
    this.app = app;
};

var handler = Handler.prototype;

handler.send = function (msg, session, next) {
    var cur_room = room_mgr.get_room_by_rid(session.get('rid'));
    var player = cur_room.get_player_by_uid(session.uid);
    var param = {
        from: player.username,
        target: msg.target,
        msg: msg.content
    }

    if(msg.target == '*'){
        cur_room.broadcast_msg('onChat', param);
    }else{
        var target_uid = msg.target + '*' + player.rid;
        var target_player = cur_room.get_player_by_uid(target_uid);

        var uids = [{
            uid: target_uid,
            sid: target_player.sid
        }];

        cur_room.send_msg_to_player_list('onChat', param, uids)
    }

    next(null, {
        route: msg.route
    });
};

module.exports = function (app) {
    return new Handler(app);
};