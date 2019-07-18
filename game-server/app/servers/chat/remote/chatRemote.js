module.exports = function(app) {
	return new ChatRemote(app);
};

var ChatRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

ChatRemote.prototype.add = function(uid, sid, rid, flag, cb) { // 玩家加入了服务器
	var channel = this.channelService.getChannel(rid, flag); //rid
	var username = uid.split('*')[0]; // uid--> ‘名字 * rid ’ 3部分组成的字符串

	var param = {
		route: 'onAdd', // 客户端使用，可以收到信息
		user: username
	};

	channel.pushMessage(param); // 广播通知其它玩家, 新进入玩家的信息

	if( !! channel) {
		channel.add(uid, sid); // channel中加入一个人
	}

	cb(this.get(rid, flag));
};

ChatRemote.prototype.get = function(rid, flag) { // 通过房间id得到房间内的所有人
	var users = [];
	var channel = this.channelService.getChannel(rid, flag);
	if( !! channel) {
		users = channel.getMembers();
	}

	for(var i = 0; i < users.length; i++) {
		users[i] = users[i].split('*')[0]; // 用户名 + ‘*’ + rid，所以这里得到用户名
	}
	return users;
};

// 从服务器上踢掉这个人
ChatRemote.prototype.kick = function(uid, sid, rid, cb) {
	var channel = this.channelService.getChannel(rid, false);
	if( !! channel) {
		channel.leave(uid, sid);
	}

	var username = uid.split('*')[0];

	var param = {
		route: 'onLeave',
		user: username
	};

	channel.pushMessage(param);
	cb();
};
