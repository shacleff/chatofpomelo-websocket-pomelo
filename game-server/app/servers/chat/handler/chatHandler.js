var chatRemote = require('../remote/chatRemote');
/**
 * 模块功能：聊天服务器实现
 */

/**
 * 先导出具有相应功能的对象
 * 然后给这个对象定义操作的方法 
 * @param {*} app 
 */
module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

//继承Handler，然后下面开始扩展功能
var handler = Handler.prototype;

/**
 * session对应的这个人发了一条消息
 * 具体是给指定人发送消息还是广播给所有人， 待定...
 * 
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.send = function(msg, session, next) {

	//???
	var rid = session.get('rid');

	//发消息的人的名字
	var username = session.uid.split('*')[0];
	
	//获取通道服务
	var channelService = this.app.get('channelService');

	//
	var param = {
		msg: msg.content,    //发送的具体消息内容
		from: username,      //谁发的
		target: msg.target   //发给谁的
	};


	channel = channelService.getChannel(rid, false);

	/**
	 * 广播给channel通道里面的所有用户发送消息
	 * the target is all users
	 */
	if(msg.target == '*') {

		//向所有channel中的用户广播消息
		channel.pushMessage('onChat', param);


	}
	/**
	 * 给指定的一个用户发送一条消息
	 * the target is specific user
	 */
	else {

		//
		var tuid = msg.target + '*' + rid;

		//
		var tsid = channel.getMember(tuid)['sid'];

		/**
		 * 通过uid想指定用户发送消息
		 * 'onChat' 消息名字
		 * param 消息具体内容
		 * [{uid: tuid, sid: tsid}] 给的那个用户发送消息时，这个用户的标识  
		 */
		channelService.pushMessageByUids('onChat', param, [{
			uid: tuid,
			sid: tsid
		}]);
	}

	//交给下一个中间件处理
	next(null, {
		route: msg.route  //这个rotute是客户端发送这个消息时何时加上的？？？
	});
};