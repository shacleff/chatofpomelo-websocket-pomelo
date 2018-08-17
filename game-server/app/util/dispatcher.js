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