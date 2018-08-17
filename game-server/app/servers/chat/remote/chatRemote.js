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
ChatRemote.prototype.add = function(uid, sid, rid, flag, cb) {
	console.info("-----ChatRemote.prototype.add");

	//rid
	var channel = this.channelService.getChannel(rid, flag);

	//uid是 ‘名字 * rid ’ 3部分组成的字符串
	var username = uid.split('*')[0];

	//这个onAdd是 和 客户端通信的eventName，也就是基于事件极致通信，而非定义一个msgId通信的那种
	var param = {
		route: 'onAdd',
		user: username
	};

	//广播玩家加入房间
	channel.pushMessage(param);

	//将用户uid对应的这个人，加到对应名字的channel中
	if( !! channel) {
		console.info("-----ChatRemote.prototype.add方法 通过channel 新增一个用户 uid:" + uid + " sid:" + sid + " rid:" + rid + " flag:" + flag);
		channel.add(uid, sid);
	}

	cb(this.get(rid, flag));
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
ChatRemote.prototype.get = function(rid, flag) {
	var users = [];
	var channel = this.channelService.getChannel(rid, flag);
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
ChatRemote.prototype.kick = function(uid, sid, rid, cb) {
	
	

	var channel = this.channelService.getChannel(rid, false);

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

	console.info("-----广播用户被踢 ChatRemote.prototype.kick called, uid:" + uid 
										   							      + " sid:"  + sid
																	      + " rid:" + rid
																	      + " route:" + 'onLeave'
																	      + " username:" + username);									   

	//
	channel.pushMessage(param);

	//
	cb();
};
