module.exports = function(object){
	var cache = [];
	console.log(JSON.stringify(object, function(key, value) {
		if (typeof value === 'object' && value !== null) {
			if (cache.indexOf(value) !== -1) return;
			cache.push(value);
		}
		return value;
	}, "\t"));
};