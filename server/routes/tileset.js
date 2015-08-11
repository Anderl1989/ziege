var log = require('../log');

var tileset = new function(){

	var db;
	var mongojs;
	
	var addTilesetEntity = function(gameId, entity, onSuccess, onError){
		db.tilesetEntity.save(
			{
				gameId: gameId,
				entity: entity,
				isPublic: "false",
				removed: "false",
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
	
	var addTilesetBox = function(gameId, box, onSuccess, onError){
		db.tilesetBox.save(
			{
				gameId: gameId,
				box: box,
				isPublic: "false",
				removed: "false",
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
	
	var addTilesetBackgroundImage = function(gameId, backgroundImage, onSuccess, onError){
		db.tilesetBackgroundImage.save(
			{
				gameId: gameId,
				backgroundImage: backgroundImage,
				isPublic: "false",
				removed: "false",
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
	
	var getTilesetBoxes = function(gameId, onSuccess, onError){
		db.tilesetBox.find({gameId:gameId, removed: "false"}, function(err, gameBoxes) {
			if(err || !gameBoxes){
				onError(err);
			} else {
				onSuccess(gameBoxes);
			}
		});
	};
	
	var getTilesetEntities = function(gameId, onSuccess, onError){
		db.tilesetEntity.find({gameId: gameId, removed: "false"}, function(err, gameEntities) {
			if(err || !gameEntities){
				onError(err);
			} else {
				onSuccess(gameEntities);
			}
		});
	};
	
	var getTilesetBackgroundImages = function(gameId, onSuccess, onError){
		db.tilesetBackgroundImage.find({gameId: gameId, removed: "false"}, function(err, tilesetBackgroundImage) {
			if(err || !tilesetBackgroundImage){
				onError(err);
			} else {
				onSuccess(tilesetBackgroundImage);
			}
		});
	};
	
	var getPublicTilesetBoxes = function(gameId, onSuccess, onError){
		db.tilesetBox.find({gameId:gameId, removed: "false", isPublic: "true"}, function(err, gameBoxes) {
			if(err || !gameBoxes){
				onError(err);
			} else {
				onSuccess(gameBoxes);
			}
		});
	};
	
	var getPublicTilesetEntities = function(gameId, onSuccess, onError){
		db.tilesetEntity.find({gameId: gameId, removed: "false", isPublic: "true"}, function(err, gameEntities) {
			if(err || !gameEntities){
				onError(err);
			} else {
				onSuccess(gameEntities);
			}
		});
	};
	
	var getPublicTilesetBackgroundImages = function(gameId, onSuccess, onError){
		db.tilesetBackgroundImage.find({gameId: gameId, removed: "false", isPublic: "true"}, function(err, tilesetBackgroundImage) {
			if(err || !tilesetBackgroundImage){
				onError(err);
			} else {
				onSuccess(tilesetBackgroundImage);
			}
		});
	};
	
	var updateTilesetBox = function(id, gameId, boxObject, onSuccess, onError){
		var set = {};
		
		if(typeof boxObject.box != "undefined") set.box = boxObject.box;
		if(typeof boxObject.isPublic != "undefined" && boxObject.isPublic == "true") set.isPublic = boxObject.isPublic;
		
		db.tilesetBox.update(
			{
				_id: mongojs.ObjectId(id),
				removed:"false",
				gameId: gameId,
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
	
	var shareTileset = function(gameId, tilesetName, onSuccess, onError){
		var set = {};
		set.tilesetName = tilesetName;
		set.tilesetShared = "true";
		
		var setTs = {};
		setTs.isPublic = "true";
		
		db.tilesetBox.update(
			{
				gameId: gameId,
			},
			{ 
				$set: setTs
			},
			{upsert: false, multi: true},
			function(err, saved) {
				
				db.tilesetEntity.update(
					{
						gameId: gameId,
					},
					{ 
						$set: setTs
					},
					{upsert: false, multi: true},
					function(err, saved) {
						
						db.tilesetBackgroundImage.update(
							{
								gameId: gameId,
							},
							{ 
								$set: setTs
							},
							{upsert: false, multi: true},
							function(err, saved) {
								
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

							}
						);

					}
				);
					
			}
		);
		
	};
	
	var removeTilesetBox = function(id, gameId, onSuccess, onError){
		db.tilesetBox.update(
			{
				_id: mongojs.ObjectId(id),
				isPublic:"false",
				gameId: gameId,
			},
			{ 
				$set: { removed: "true" },
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
	
	var updateTilesetEntity = function(id, gameId, entityObject, onSuccess, onError){
		var set = {};
		
		if(typeof entityObject.entity != "undefined") set.entity = entityObject.entity;
		if(typeof entityObject.isPublic != "undefined" && entityObject.isPublic == "true") set.isPublic = entityObject.isPublic;
		
		db.tilesetEntity.update(
			{
				_id: mongojs.ObjectId(id),
				removed:"false",
				gameId: gameId,
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
	}
	
	var removeTilesetEntity = function(id, gameId, onSuccess, onError){
		db.tilesetEntity.update(
			{
				_id: mongojs.ObjectId(id),
				isPublic:"false",
				gameId: gameId,
			},
			{ 
				$set: { removed: "true" },
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
	
	var updateTilesetBackgroundImage = function(id, gameId, backgroundImageObject, onSuccess, onError){
		var set = {};
		
		if(typeof backgroundImageObject.backgroundImage != "undefined") set.backgroundImage = backgroundImageObject.backgroundImage;
		if(typeof backgroundImageObject.isPublic != "undefined" && backgroundImageObject.isPublic == "true") set.isPublic = backgroundImageObject.isPublic;
		
		db.tilesetBackgroundImage.update(
			{
				_id: mongojs.ObjectId(id),
				removed:"false",
				gameId: gameId,
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
	}
	
	var removeTilesetBackgroundImage = function(id, gameId, onSuccess, onError){
		db.tilesetBackgroundImage.update(
			{
				_id: mongojs.ObjectId(id),
				isPublic:"false",
				gameId: gameId,
			},
			{ 
				$set: { removed: "true" },
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
	
	this.updateTilesets = function(){
		db.tilesetBox.update(
			{isPublic:{$exists:false,},},{$set:{isPublic:"false",}},{upsert:false,multi:true},
			function(err, saved) {}
		);
		db.tilesetBox.update(
			{removed:{$exists:false,},},{$set:{removed:"false",}},{upsert:false,multi:true},
			function(err, saved) {}
		);
		
		db.tilesetEntity.update(
			{isPublic:{$exists:false,},},{$set:{isPublic:"false",}},{upsert:false,multi:true},
			function(err, saved) {}
		);
		db.tilesetEntity.update(
			{removed:{$exists:false,},},{$set:{removed:"false",}},{upsert:false,multi:true},
			function(err, saved) {}
		);
		
		db.tilesetBackgroundImage.update(
			{isPublic:{$exists:false,},},{$set:{isPublic:"false",}},{upsert:false,multi:true},
			function(err, saved) {}
		);
		db.tilesetBackgroundImage.update(
			{removed:{$exists:false,},},{$set:{removed:"false",}},{upsert:false,multi:true},
			function(err, saved) {}
		);
	};
		
	this.init = function(database, mongo){
		db = database;
		mongojs = mongo;
		return this;
	};
	
	this.addTilesetEntity = function(req, res){
		if(!req.body.entity){
			res.send(400, { error: 'No entity specified!' });
		} else if(!req.body.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			addTilesetEntity(req.body.gameId, req.body.entity, function(entity){
				res.send(201, entity);
			}, function(err){
				log(err);
				res.send(500, { message: 'An unknown error occurred!' });
			});
		}
	};
	
	this.updateTilesetEntity = function(req, res){
		if(!req.body.entityObject){
			res.send(400, { error: 'No entity object specified!' });
		} else if(!req.body.id){
			res.send(400, { error: 'No entity id specified!' });
		} else if(!req.body.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			updateTilesetEntity(req.body.id, req.body.gameId, req.body.entityObject, function(entity){
				res.send(200, entity);
			}, function(err){
				log(err);
				res.send(500, { message: 'An unknown error occurred!' });
			});
		}
	};
	
	this.removeTilesetEntity = function(req, res){
		if(!req.body.id){
			res.send(400, { error: 'No entity id specified!' });
		} else if(!req.body.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			removeTilesetEntity(req.body.id, req.body.gameId, function(){
				res.send(200);
			}, function(err){
				log(err);
				res.send(500, { message: 'An unknown error occurred!' });
			});
		}
	};
	
	this.addTilesetBox = function(req, res){
		if(!req.body.box){
			res.send(400, { error: 'No box specified!' });
		} else if(!req.body.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			addTilesetBox(req.body.gameId, req.body.box, function(box){
				res.send(201, box);
			}, function(err){
				log(err);
				res.send(500, { message: 'An unknown error occurred!' });
			});
		}
	};
	
	this.updateTilesetBox = function(req, res){
		if(!req.body.boxObject){
			res.send(400, { error: 'No box object specified!' });
		} else if(!req.body.id){
			res.send(400, { error: 'No box id specified!' });
		} else if(!req.body.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			updateTilesetBox(req.body.id, req.body.gameId, req.body.boxObject, function(box){
				res.send(200, box);
			}, function(err){
				log(err);
				res.send(500, { message: 'An unknown error occurred!' });
			});
		}
	};
	
	this.shareTileset = function(req, res){
		if(!req.body.tilesetName){
			res.send(400, { error: 'No tileset name specified!' });
		} else if(!req.body.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			shareTileset(req.body.gameId, req.body.tilesetName, function(){
				res.send(200);
			}, function(err){
				log(err);
				res.send(500, { message: 'An unknown error occurred!' });
			});
		}
	};
	
	this.removeTilesetBox = function(req, res){
		if(!req.body.id){
			res.send(400, { error: 'No box id specified!' });
		} else if(!req.body.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			removeTilesetBox(req.body.id, req.body.gameId, function(){
				res.send(200);
			}, function(err){
				log(err);
				res.send(500, { message: 'An unknown error occurred!' });
			});
		}
	};
	
	this.addTilesetBackgroundImage = function(req, res){
		if(!req.body.backgroundImage){
			res.send(400, { error: 'No background image specified!' });
		} else if(!req.body.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			addTilesetBackgroundImage(req.body.gameId, req.body.backgroundImage, function(backgroundImage){
				res.send(201, backgroundImage);
			}, function(err){
				log(err);
				res.send(500, { message: 'An unknown error occurred!' });
			});
		}
	};
	
	this.updateTilesetBackgroundImage = function(req, res){
		if(!req.body.backgroundImageObject){
			res.send(400, { error: 'No background image object specified!' });
		} else if(!req.body.id){
			res.send(400, { error: 'No background image id specified!' });
		} else if(!req.body.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			addTilesetBackgroundImage(req.body.id, req.body.gameId, req.body.backgroundImageObject, function(backgroundImage){
				res.send(200, backgroundImage);
			}, function(err){
				log(err);
				res.send(500, { message: 'An unknown error occurred!' });
			});
		}
	};
	
	this.removeTilesetBackgroundImage = function(req, res){
		if(!req.body.id){
			res.send(400, { error: 'No background image id specified!' });
		} else if(!req.body.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			removeTilesetBackgroundImage(req.body.id, req.body.gameId, function(){
				res.send(200);
			}, function(err){
				log(err);
				res.send(500, { message: 'An unknown error occurred!' });
			});
		}
	};
	
	this.getTileset = function(req, res){
		if(!req.query.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			getTilesetBoxes(req.query.gameId, function(boxes){
				getTilesetEntities(req.query.gameId, function(entities){
					getTilesetBackgroundImages(req.query.gameId, function(bgImages){
						res.send(200, {box: boxes, entity: entities, backgroundImage: bgImages});
					}, function(err){
						log(err);
						res.send(500, { message: 'An unknown error occurred (BG Img)!' });
					});
				}, function(err){
					log(err);
					res.send(500, { message: 'An unknown error occurred (Entity)!' });
				});
			}, function(err){
				log(err);
				res.send(500, { message: 'An unknown error occurred (Box)!' });
			});
		}
	};
	
	this.getPublicTileset = function(req, res){
		if(!req.query.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			getPublicTilesetBoxes(req.query.gameId, function(boxes){
				getPublicTilesetEntities(req.query.gameId, function(entities){
					getPublicTilesetBackgroundImages(req.query.gameId, function(bgImages){
						res.send(200, {box: boxes, entity: entities, backgroundImage: bgImages});
					}, function(err){
						log(err);
						res.send(500, { message: 'An unknown error occurred (BG Img)!' });
					});
				}, function(err){
					log(err);
					res.send(500, { message: 'An unknown error occurred (Entity)!' });
				});
			}, function(err){
				log(err);
				res.send(500, { message: 'An unknown error occurred (Box)!' });
			});
		}
	};
};

module.exports = tileset;