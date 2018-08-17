var crc = require('crc');

/**
 * 功能：简单的负载均衡，
 * 根据玩家uid利用crc算法，随机为用户分配一个connector
 * 
 * @param {*} uid 
 * @param {*} connectors 
 */
module.exports.dispatch = function(uid, connectors) {
	var index = Math.abs(crc.crc32(uid)) % connectors.length;

	/**
	 * uid:1 crc.crc32(uid):2082672713    
	 * 
	 * uid:haha crc.crc32(uid):22155654
	 * 
	 * uid:jianan crc.crc32(uid):1682900906 index：2
	 * 
	 * 
	 * 可以知道：用户的uid如果是固定的那么就crc.crc32(uid)计算出来的值就是固定的，但是connectors数组里面服务器是不固定的.
	 * 
	 * 所以每次启动后，用户重新登录的话，分配的connector服务器都是不固定的
	 * 
	 * 当然了，同样可以看出来，同一个账号，每次分配的ChatServer也是不固定的
	 */
	
	// console.info("-----给用户分配具体的connector服务器 uid:" + uid 
	// 					+ " crc.crc32(uid):" + Math.abs(crc.crc32(uid)) 
	// 					+ " index：" + index 
	// 					+ " connectors[index].id:" + connectors[index].id);

	return connectors[index];
};

/*
crc32算法用法：

//1.文件
crc32(fs.readFileSync('README.md', 'utf8')).toString(16);
// "127ad531"

//2.字符串
const { crc32 } = require('crc');
crc32('hello').toString(16);
// "3610a686"
*/