module.exports = function(app) {
	return new ChatRemote(app);
};

var ChatRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

/**
 * 功能：将指定uid的人加入到指定服务器id和channel通道中
 * Add user into chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 *
 */
ChatRemote.prototype.add = function(uid, sid, name, flag, cb) {
	var channel = this.channelService.getChannel(name, flag);
	var username = uid.split('*')[0];
	var param = {
		route: 'onAdd',
		user: username
	};
	channel.pushMessage(param);

	//将用户uid对应的这个人，加到对应名字的channel中
	if( !! channel) {
		channel.add(uid, sid);
	}

	cb(this.get(name, flag));
};

/**
 * 功能：通过通道名字，得到所有用户的数组
 * Get user from chat channel.
 *
 * @param {Object} opts parameters for request  
 * @param {String} name channel name            通道名字
 * @param {boolean} flag channel parameter      通道参数
 * @return {Array} users uids in channel        所有用户uid列表
 *
 */
ChatRemote.prototype.get = function(name, flag) {
	var users = [];
	var channel = this.channelService.getChannel(name, flag);
	if( !! channel) {
		users = channel.getMembers();
	}
	for(var i = 0; i < users.length; i++) {

		//用户名 + ‘*’ + rid，所以这里得到用户名
		users[i] = users[i].split('*')[0];
	}
	return users;
};

/**
 * 功能：把人从指定名字对应的channel中踢出去
 * Kick user out chat channel.
 *
 * @param {String} uid unique id for user    唯一用户id
 * @param {String} sid server id             唯一服务器id
 * @param {String} name channel name         通道名字
 *
 */
ChatRemote.prototype.kick = function(uid, sid, name, cb) {
	
	var channel = this.channelService.getChannel(name, false);

	// leave channel
	if( !! channel) {
		channel.leave(uid, sid);
	}

	//
	var username = uid.split('*')[0];

	//
	var param = {
		route: 'onLeave',
		user: username
	};

	//
	channel.pushMessage(param);

	//
	cb();
};
