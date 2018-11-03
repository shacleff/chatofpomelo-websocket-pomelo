var chatRemote = require('../remote/chatRemote');
/**
 * 模块功能：聊天服务器实现
 * 在handler中的是由客户端调用使用的
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
 * session对应的这个人发了一条消息.
 * 客户端去调用这个send方法
 * 具体是给指定人发送消息还是广播给所有人， 待定...
 * 
 * Send messages to users
 *
 * @param {Object} msg       客户端发送的消息对象
 * @param {Object} session   服务器端和当前用户会话
 * @param  {Function} next   将客户端请求发送消息的结果返回给客户端
 *
 */
handler.send = function(msg, session, next) {

	// 房间id。 也就是玩家以一个channel作为一个房间
	var rid = session.get('rid');

	//发消息的人的名字
	var username = session.uid.split('*')[0];
	
	/**
	 * 获取通道服务.
	 * 接下来根据用户所在的rid，得到聊天服务器使用
	 */
	var channelService = this.app.get('channelService');

	//
	var param = {
		from: username,      //谁发的
		target: msg.target,  //发给谁
		msg: msg.content     //聊天消息内容
	};

	//通过用户的房间id也就是rid，获取所在的chat服务器
	// console.info("-----通过rid:" + rid + " 找到channel");
	channel = channelService.getChannel(rid, false);

	/**
	 * 广播给channel通道里面的所有用户发送消息
	 * the target is all users
	 */
	if(msg.target == '*') {

		// console.info("-----通过channel 向所有channel中的用户广播消息 param:" + JSON.stringify(param));

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

		// console.log("-----通过channelService 向单个用户发送聊天消息, param:" + JSON.stringify(param));


		// 服务器通过channel向指定的玩家发送消息
		channelService.pushMessageByUids('onChat', param, [{
			uid: tuid,
			sid: tsid
		}]);
	}

	//交给下一个中间件处理
	// console.info("-----chatHandler send发送完消息，转交给下一个中间件l msg.route:" + msg.route);
	/**
	 * 为什么必须用这个next进行传递给下一个中间件???,按道理，我都发完消息了，不需要再传递下路由了吧,
	 * 发现这里注释掉其实也行
	 */
	next(null, {
		// route: msg.route  //这个rotute是客户端发送这个消息时何时加上的？？？
	});
};