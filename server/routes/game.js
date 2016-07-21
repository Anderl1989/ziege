var log = require('../log');
var fs = require("fs");

var game = new function(){

	var db;
	var mongojs;
	
	var DEFAULT_GAME_COUNT = 12;
	var DEFAULT_GAME_ORDER = 'rating';
	
	var addGameInfo = function(author, gameName, onSuccess, onError){
		db.gameInfo.save(
			{
				author: author,
				isPublic: "false",
				creationDate: new Date().getTime(),
				modifiedDate: new Date().getTime(),
				name: gameName,
				removed: "false",
				img: "",
				tilesets: {},
			},
			function(err, saved) {
				if(err || !saved ){
					onError(err)
				} else {
					onSuccess(saved);
				}
			}
		);
	};
	
	var addGameEntityLayer = function(gameId, onSuccess, onError){
		db.gameEntityLayer.save(
			{
				gameId: gameId,
				entities: [],
			},
			function(err, saved) {
				if(err || !saved ){
					onError(err)
				} else {
					onSuccess(saved);
				}
			}
		);
	};
	
	var addGameBoxLayer = function(gameId, layer, onSuccess, onError){
		db.gameBoxLayer.save(
			{
				gameId: gameId,
				layer: layer,
				boxes: {},
			},
			function(err, saved) {
				if(err || !saved ){
					onError(err)
				} else {
					onSuccess(saved);
				}
			}
		);
	};
	
	var addGameOptions = function(gameId, onSuccess, onError){
		db.gameOptions.save(
			{
				gameId: gameId,
				options: {},
			},
			function(err, saved) {
				if(err || !saved ){
					onError(err)
				} else {
					onSuccess(saved);
				}
			}
		);
	};
	
	var updateGameEntityLayer = function(gameId, entities, onSuccess, onError){
		db.gameEntityLayer.update(
			{
				gameId: mongojs.ObjectId(gameId),
			},
			{ 
				$set: { 
					entities: entities||[],
				}
			},
			{upsert: false, multi: false},
			function(err, saved) {
				log(arguments);
				if(err || !saved ){
					log("err");
					onError(err)
				} else {
					log("saved");
					onSuccess(saved);
				}
			}
		);
	};
	
	var updateGameBoxLayer = function(gameId, layer, boxes, onSuccess, onError){
		db.gameBoxLayer.update(
			{
				gameId: mongojs.ObjectId(gameId),
				layer: layer-0,
			},
			{ 
				$set: { 
					boxes: boxes||{},
				}
			},
			{upsert: false, multi: false},
			function(err, saved) {
				if(err || !saved ){
					onError(err)
				} else {
					onSuccess(saved);
				}
			}
		);
	};
	
	var updateGameOptions = function(gameId, options, onSuccess, onError){
		db.gameOptions.update(
			{
				gameId: mongojs.ObjectId(gameId),
			},
			{ 
				$set: { 
					options: options||{},
				}
			},
			{upsert: false, multi: false},
			function(err, saved) {
				if(err || !saved ){
					onError(err)
				} else {
					onSuccess(saved);
				}
			}
		);
	};
	
	var updateScreenshots = function(){
		db.gameInfo.find().forEach(function(err, gameInfo) {
			if (!gameInfo) return;
			if(typeof gameInfo.img != "undefined" && gameInfo.img.indexOf("png;base64") != -1){
				console.log("updating screenshot of game with id:" +  gameInfo._id);
				
				var url = "userContent/screenshots/" + gameInfo._id + ".png"
				var base64Data = gameInfo.img.replace(/^data:image\/png;base64,/, "");

				if(!fs.existsSync("../webapp/userContent/")){
					fs.mkdirSync("../webapp/userContent/")
				}
				if(!fs.existsSync("../webapp/userContent/screenshots/")){
					fs.mkdirSync("../webapp/userContent/screenshots/")
				}
				fs.writeFile("../webapp/" + url, base64Data, 'base64', function(err) {
					if(err) console.log(err);
				});
				
				db.gameInfo.update(
					{
						_id: gameInfo._id
					},
					{ 
						$set: { img: url, }
					},
					{upsert: false, multi: false},
					function(err, saved) {
						if(err || !saved ){
							console.log("updating screenshot failed:", err);
						} else {
							console.log("updating screenshot success");
						}
					}
				);
				
			}
		});
	}
	
	var updateGameInfo = function(gameId, gameInfo, onSuccess, onError){
		
		var set = {};
		
		if(typeof gameInfo.name != "undefined") set.name = gameInfo.name;
		if(typeof gameInfo.modifiedDate != "undefined") set.modifiedDate = gameInfo.modifiedDate;
		if(typeof gameInfo.isPublic != "undefined") set.isPublic = gameInfo.isPublic;
		if(typeof gameInfo.removed != "undefined") set.removed = gameInfo.removed;
		if(typeof gameInfo.tilesets != "undefined") set.tilesets = gameInfo.tilesets;
		if(typeof gameInfo.img != "undefined"){
			
			var url = "userContent/screenshots/" + mongojs.ObjectId(gameId) + ".png"
			
			var base64Data = gameInfo.img.replace(/^data:image\/png;base64,/, "");

			if(!fs.existsSync("../webapp/userContent/")){
				fs.mkdirSync("../webapp/userContent/")
			}
			if(!fs.existsSync("../webapp/userContent/screenshots/")){
				fs.mkdirSync("../webapp/userContent/screenshots/")
			}
			fs.writeFile("../webapp/" + url, base64Data, 'base64', function(err) {
				if(err) console.log(err);
			});
		
			set.img = url;
		}
		
		
		db.gameInfo.update(
			{
				_id: mongojs.ObjectId(gameId)
			},
			{ 
				$set: set
			},
			{upsert: false, multi: false},
			function(err, saved) {
				if(err || !saved ){
					onError(err)
				} else {
					onSuccess(saved);
				}
			}
		);
	};
	
	var addGame = function(author, gameName, onSuccess, onError){
		addGameInfo(author, gameName, function(gameInfo){
			log(gameInfo);
			addGameEntityLayer(gameInfo._id, function(){
				addGameBoxLayer(gameInfo._id, 0, function(){
					addGameBoxLayer(gameInfo._id, 1, function(){
						addGameBoxLayer(gameInfo._id, 2, function(){
							addGameOptions(gameInfo._id, function(){
								onSuccess(gameInfo._id);
							}, onError);
						}, onError);
					}, onError);
				}, onError);
			}, onError);
		}, onError);
	};
	
	var getGameInfoByAuthor = function(gameCount, page, author, isPublic, onSuccess, onError){
		if(typeof isPublic == "undefined") isPublic = "false";
		
		db.gameInfo.count({author: author, removed: "false", isPublic: isPublic}, function(err, amount){
			if(err || typeof amount != "number"){
				onError(err);
			} else {
				var retVal = {
					total: amount,
					count: gameCount,
					page: page,
					games: null,
				};
				
				db.gameInfo.find({author: author, removed: "false", isPublic: isPublic}).sort({'name':1}/*).limit(gameCount).skip(gameCount*page*/, function(err, gameInfos) {
					if(err || !gameInfos){
						onError(err);
					} else {
						retVal.games = gameInfos;
						onSuccess(retVal);
					}
				});
				
			}
		});
		
		
		
	};
	
	var getPublicGameInfo = function(gameCount, page, orderBy, onSuccess, onError){
		db.gameInfo.count({removed: "false", isPublic: "true"}, function(err, amount){
			if(err || typeof amount != "number"){
				onError(err);
			} else {
				var retVal = {
					total: amount,
					count: gameCount,
					page: page,
					games: null,
				};
				
				var sort = {};
				switch(orderBy) {
					case 'author':
						sort = { 'author': 1, 'name': 1 };
						break;
					case 'name':
						sort = { 'name': 1 };
						break;
					case 'creationDate':
						sort = { 'creationDate': -1 };
						break;
					case 'modifiedDate':
						sort = { 'modifiedDate': -1 };
						break;
					case 'rating':
					default:
						sort = { 'rating.valid': -1, 'rating.total': -1 };
						break;
				}
				
				db.gameInfo.find({removed: "false", isPublic: "true"}).sort(sort).limit(gameCount).skip(gameCount*page, function(err, gameInfos) {
					if(err || !gameInfos){
						onError(err);
					} else {
						console.log(JSON.stringify(gameInfos,null,"\t"));
						retVal.games = gameInfos;
						onSuccess(retVal);
					}
				});
				
			}
		});
	};
	
	var getGameInfoWithTileset = function(onSuccess, onError){
		db.gameInfo.find({tilesetShared: "true"}, function(err, gameInfos) {
			if(err || !gameInfos){
				onError(err);
			} else {
				onSuccess(gameInfos);
			}
		});
	};
	
	var getAllGameInfo = function(gameCount, page, onSuccess, onError){
		db.gameInfo.count({}, function(err, amount){
			if(err || typeof amount != "number"){
				onError(err);
			} else {
				var retVal = {
					total: amount,
					count: gameCount,
					page: page,
					games: null,
				};
				
				db.gameInfo.find().sort({'name':1}/*).limit(gameCount).skip(gameCount*page*/, function(err, gameInfos) {
					if(err || !gameInfos){
						onError(err);
					} else {
						retVal.games = gameInfos;
						onSuccess(retVal);
					}
				});
				
			}
		});
		
	};
	
	var getGameInfoById = function(gameId, onSuccess, onError){
		db.gameInfo.findOne({_id: mongojs.ObjectId(gameId)}, function(err, gameInfo) {
			if(err || !gameInfo){
				onError(err);
			} else {
				onSuccess(gameInfo);
			}
		});
	};
	
	var getGameEntityLayer = function(gameId, onSuccess, onError){
		db.gameEntityLayer.findOne({gameId: mongojs.ObjectId(gameId)}, function(err, gameEntityLayer) {
			if(err || !gameEntityLayer){
				onError(err);
			} else {
				onSuccess(gameEntityLayer);
			}
		});
	};
	
	
	var getGameBoxLayer = function(gameId, layer, onSuccess, onError){
		db.gameBoxLayer.findOne({gameId: mongojs.ObjectId(gameId), layer: layer-0}, function(err, gameBoxLayer) {
			if(err || !gameBoxLayer){
				onError(err);
			} else {
				onSuccess(gameBoxLayer);
			}
		});
	};
	
	var getGameOptions = function(gameId, onSuccess, onError){
		db.gameOptions.findOne({gameId: mongojs.ObjectId(gameId)}, function(err, gameOptions) {
			if(err || !gameOptions){
				onError(err);
			} else {
				onSuccess(gameOptions);
			}
		});
	};
		
	this.init = function(database, mongo){
		db = database;
		mongojs = mongo;
		return this;
	};
	
	this.addGame = function(req, res){
		var gameName = req.body.name || "Neues Spiel von " + req.session.user.name;
		addGame(req.session.user.name, gameName, function(id){
			res.send(201, id);
		}, function(err){
			log(err);
			res.send(500, { message: 'An unknown error occurred!' });
		});
	};
	
	this.getOwnGames = function(req, res){
		var gameCount = req.query.count || DEFAULT_GAME_COUNT;
		var page = req.query.page || 0;
		
		getGameInfoByAuthor(gameCount, page, req.session.user.name, req.query.isPublic, function(gameInfos){
			res.send(200, gameInfos);
		}, function(err){
			log(err);
			res.send(500, { message: 'An unknown error occurred!' });
		});
	};
	
	this.getPublicGames = function(req, res){
		var gameCount = req.query.count || DEFAULT_GAME_COUNT;
		var orderBy = req.query.orderBy || DEFAULT_GAME_ORDER;
		var page = req.query.page || 0;
		
		getPublicGameInfo(gameCount, page, orderBy, function(gameInfos){
			res.send(200, gameInfos);
		}, function(err){
			log(err);
			res.send(500, { message: 'An unknown error occurred!' });
		});
	};
	
	this.getGameInfoWithTileset = function(req, res){
		getGameInfoWithTileset(function(gameInfos){
			res.send(200, gameInfos);
		}, function(err){
			log(err);
			res.send(500, { message: 'An unknown error occurred!' });
		});
	};
	
	this.getAllGames = function(req, res){
		var gameCount = req.query.count || DEFAULT_GAME_COUNT;
		var page = req.query.page || 0;
		
		getAllGameInfo(gameCount, page, function(gameInfos){
			res.send(200, gameInfos);
		}, function(err){
			log(err);
			res.send(500, { message: 'An unknown error occurred!' });
		});
	};
	
	this.getGameInfo = function(req, res){
		if(!req.query.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			getGameInfoById(req.query.gameId, function(gameInfo){
				res.send(200, gameInfo);
			}, function(err){
				log(err);
				res.send(404, { message: 'No game with this id was found!' });
			});
		}
	};
	
	/*this.getGameInfoForEdit = function(req, res){
		if(!req.query.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			getGameInfoById(req.query.gameId, function(gameInfo){
				if(gameInfo.author == req.session.user.name){
					res.send(200, gameInfo);
				} else {
					res.send(403, { message: 'The user is not the author of this game!' });
				}
			}, function(err){
				log(err);
				res.send(404, { message: 'No game with this id was found!' });
			});
		}
	};*/
	
	this.getGameEntityLayer = function(req, res){
		if(!req.query.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			getGameEntityLayer(req.query.gameId, function(gameEntityLayer){
				res.send(200, gameEntityLayer);
			}, function(err){
				log(err);
				res.send(404, { message: 'No game with this id was found!' });
			});
		}
	};
	
	this.getGameBoxLayer = function(req, res){
		if(!req.query.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else if(!req.query.layer){
			res.send(400, { error: 'No layer specified!' });
		} else {
			getGameBoxLayer(req.query.gameId, req.query.layer, function(gameBoxLayer){
				res.send(200, gameBoxLayer);
			}, function(err){
				log(err);
				res.send(404, { message: 'Layer not found!' });
			});
		}
	};
		
	this.getGameOptions = function(req, res){
		if(!req.query.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			getGameOptions(req.query.gameId, function(gameOptions){
				res.send(200, gameOptions);
			}, function(err){
				log(err);
				res.send(404, { message: 'No game with this id was found!' });
			});
		}
	};
		
	this.updateGameEntityLayer = function(req, res){
		if(!req.body.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			updateGameEntityLayer(req.body.gameId, req.body.entities, function(){
				res.send(200);
			}, function(err){
				log(err);
				res.send(404, { message: 'No game with this id was found!' });
			});
		}
	};
	
	this.updateGameBoxLayer = function(req, res){
		if(!req.body.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else if(req.body.layer != 0 && !req.body.layer){
			res.send(400, { error: 'No layer specified!' });
		} else {
			updateGameBoxLayer(req.body.gameId, req.body.layer, req.body.boxes, function(){
				res.send(200);
			}, function(err){
				log(err);
				res.send(404, { message: 'Layer not found!' });
			});
		}
	};
		
	this.updateGameOptions = function(req, res){
		if(!req.body.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			updateGameOptions(req.body.gameId, req.body.options, function(){
				res.send(200);
			}, function(err){
				log(err);
				res.send(404, { message: 'No game with this id was found!' });
			});
		}
	};
	
	this.updateGameInfo = function(req, res){
		if(!req.body.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			updateGameInfo(req.body.gameId, req.body.gameInfo, function(){
				res.send(200);
			}, function(err){
				log(err);
				res.send(404, { message: 'No game with this id was found!' });
			});
		}
	};
	
	this.isGameAuthor = function(req, res, next){
		var gameId = req.query.gameId || req.body.gameId;
		if(!gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			getGameInfoById(gameId, function(gameInfo){
				if(gameInfo.author == req.session.user.name || req.session.user.admin){
					next();
				} else {
					res.send(403, { message: 'The user is not the author of this game!' });
				}
			}, function(err){
				log(err);
				res.send(404, { message: 'No game with this id was found!' });
			});
		}
	};
	
	this.updateScreenshots = updateScreenshots;
};

module.exports = game;