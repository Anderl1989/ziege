var log = require('../log');

var ratings = new function(){

	var db;
	var mongojs;

	var set = function(settingId, value, onSuccess, onError){
		db.settings.update(
			{
				settingId: settingId,
			},
			{ 
				$set: { value: value, },
			},
			{upsert: true, multi: false},
			function(err, saved) {
				if(err || !saved ){
					onError(err);
				} else {
					onSuccess();
				}
			}
		);
	};
	
	var get = function(settingId, onSuccess, onError){
		db.settings.findOne({settingId: settingId}, function(err, setting) {
			if(err || !setting){
				onError("Setting not found");
			} else {
				onSuccess(setting.value);
			}
		});
	};
	
	this.init = function(database, mongo){
		db = database;
		mongojs = mongo;
		
		return this;
	};
	
	this.set = function(req, res){
		if(!req.params.setting){
			res.send(400, { error: 'No setting id specified!' });
		} else if(!req.params.value){
			res.send(400, { error: 'No value specified!' });
		} else {
			set(req.params.setting, req.params.value, function(){
				res.send(200);
			}, function(err){
				log(err);
				res.send(500, { message: 'An unknown error occurred!' });
			});
		}
	};
	
	this.get = function(req, res){
		if(!req.params.setting){
			res.send(400, { error: 'No setting id specified!' });
		} else {
			get(req.params.setting, function(value){
				res.send(200, value);
			}, function(err){
				log(err);
				res.send(404, null);
			});
		}
	};
	
};

module.exports = ratings;