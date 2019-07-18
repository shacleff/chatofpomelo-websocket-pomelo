var crc = require('crc');

/**
 * crc32分配一个服务器
 * uid: 用于crc32计算的参数
 * connectors: 一个数组
 */
module.exports.dispatch = function(uid, connectors) {
	var index = Math.abs(crc.crc32(uid)) % connectors.length;
	return connectors[index];
};

