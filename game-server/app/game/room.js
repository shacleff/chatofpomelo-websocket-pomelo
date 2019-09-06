function room(channel_service, channel, rid) {
    this.channel_service = channel_service;
    this.channel = channel;
    this.rid = rid;
    this.player_list = [];
}

/**
 * 通过uid sid把玩家添加到channel中
 *   (1)注意：channel中getMembers得到的是uid的集合
 */
room.prototype.add_player_by_uid_sid = function (uid, sid) {
    // channel加入玩家信息
    this.channel.add(uid, sid);

    // 玩家信息
    this.player_list.push({
        uid: uid,
        sid: sid,
        username: uid.split('*')[0],
        rid: uid.split('*')[1],
        card_list: [1, 2, 3, 4, 5] // 模拟手中牌默认是这个
    });
}

room.prototype.remove_player_by_uid_sid = function (uid, sid) {
    this.channel.leave(uid, sid);

    for (var i = 0; i < this.player_list.length; i++) {
        if (uid == this.player_list[i].uid) {
            this.player_list.splice(i, 1);
            break;
        }
    }
}

room.prototype.get_player_by_uid = function (uid) {
    for (var i = 0; i < this.player_list.length; i++) {
        if (uid == this.player_list[i].uid) {
            return this.player_list[i];
        }
    }
    return null;
}

room.prototype.send_msg_to_player_list = function(route, param, uids){
    this.channel_service.pushMessageByUids(route, param, uids)
}

room.prototype.get_player_list = function () {
    return this.player_list;
}

/**
 * 在房间内广播消息
 */
room.prototype.broadcast_msg = function (route, param) {
    this.channel.pushMessage(route, param);
}

module.exports = room;