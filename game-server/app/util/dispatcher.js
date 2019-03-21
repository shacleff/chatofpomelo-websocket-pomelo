var crc = require('crc');

module.exports.dispatch = function(uid, connectors) {  // crc32分配一个服务器
	var index = Math.abs(crc.crc32(uid)) % connectors.length;
	return connectors[index];
};

