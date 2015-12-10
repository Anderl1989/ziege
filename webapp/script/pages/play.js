$(function(){
	var backToMenu = function(){
		window.location = "myGames.html";
	};

	var GameInfo = {};
	
	var play = false;
	
	window.R = new H5R();
	window.drawR = new H5R();
	
	LNG.ready(function(){
		
		var header = $.createTemplateURL("tpl/elements/header.tpl.html");
		var loading = $.createTemplateURL("tpl/elements/loading.tpl.html");
		$("#container").setTemplateURL("tpl/play.tpl.html", {header: header, loading: loading});
		$("#container").processTemplate();
		
		var altLayout = TOOLS.getUrlParam("altLayout");
		
		showLoading();
		
		var gameId = TOOLS.getUrlParam("gameId");
		if(!gameId){
			backToMenu();
		} else {
			showLoading();
			REST.getGameInfo(gameId, function(gi){
				console.log(gi);
				GameInfo = gi;
				
				if(GameInfo.removed == "true"){
					backToMenu();
					return;
				}
				
				if(GameInfo.isPublic == "false" && TOOLS.Storage.get("user") != GameInfo.author){
					backToMenu();
					return;
				}
			
				var al = new AsyncLoader();
				
				var addPublicTilesetToAl = function(i){
					al.addMethod(REST.getPublicTileset, [i], function(tileset){
						console.log(tileset, i);
						
						if(!TS[i]) TS[i] = {};
						if(!TS[i].box) TS[i].box = {};
						if(!TS[i].entity) TS[i].entity = {};
						if(!TS[i].backgroundImage) TS[i].backgroundImage = {};
						
						TS[i].name = GameInfo.tilesets[i];
						
						for(var j in tileset.box){
							TS[i].box[tileset.box[j]._id] = tileset.box[j].box;
						}
						for(var j in tileset.entity){
							TS[i].entity[tileset.entity[j]._id] = tileset.entity[j].entity;
						}
						for(var j in tileset.backgroundImage){
							TS[i].backgroundImage[tileset.backgroundImage[j]._id] = tileset.backgroundImage[j].backgroundImage;
						}
					}, handleLoadError);
					
				};

				
				if(GameInfo.tilesets && GameInfo.tilesets instanceof Object){
					for(var i in GameInfo.tilesets){
						addPublicTilesetToAl(i);
					}
				}
				
				al.addMethod(REST.getTileset, [gameId], function(tileset){
					console.log(tileset);
					
					for(var i in tileset.box){
						TS.game.box[tileset.box[i]._id] = tileset.box[i].box;
					}
					for(var i in tileset.entity){
						TS.game.entity[tileset.entity[i]._id] = tileset.entity[i].entity;
					}
					for(var i in tileset.backgroundImage){
						TS.game.backgroundImage[tileset.backgroundImage[i]._id] = tileset.backgroundImage[i].backgroundImage;
					}
				}, handleLoadError);
				
				al.addMethod(REST.getGameEntityLayer, [gameId], function(gameEntityLayer){
					console.log(gameEntityLayer);
					SG.game.entity = gameEntityLayer.entities;
				}, handleLoadError);
				
				al.addMethod(REST.getGameBoxLayer, [gameId, 0], function(gameBoxLayer0){
					console.log(gameBoxLayer0);
					SG.game.bg = gameBoxLayer0.boxes;
				}, handleLoadError);
				
				al.addMethod(REST.getGameBoxLayer, [gameId, 1], function(gameBoxLayer1){
					console.log(gameBoxLayer1);
					SG.game.level = gameBoxLayer1.boxes;
				}, handleLoadError);
				
				al.addMethod(REST.getGameBoxLayer, [gameId, 2], function(gameBoxLayer2){
					console.log(gameBoxLayer2);
					SG.game.fg = gameBoxLayer2.boxes;
				}, handleLoadError);
				
				al.addMethod(REST.getGameOptions, [gameId], function(gameOptions){
					if(gameOptions && gameOptions.options){
						if(gameOptions.options.bgImg && gameOptions.options.bgImg.img){
							SG.bgImg.img = gameOptions.options.bgImg.img;
						}
						if(gameOptions.options.levelSize){
							SG.game._levelSize = gameOptions.options.levelSize;
						}
					}
				}, handleLoadError);
				
				al.execute(function(){
					init();
					hideLoading();
				}, function(){
					backToMenu();
				});
				
			
			}, handleLoadError);
			
			/*REST.getTileset(gameId, function(tileset){
				console.log(tileset);
				
				for(var i in tileset.box){
					TS.game.box[tileset.box[i]._id] = tileset.box[i].box;
				}
				for(var i in tileset.entity){
					TS.game.entity[tileset.entity[i]._id] = tileset.entity[i].entity;
				}
				for(var i in tileset.backgroundImage){
					TS.game.backgroundImage[tileset.backgroundImage[i]._id] = tileset.backgroundImage[i].backgroundImage;
				}
				
				REST.getGameInfo(gameId, function(gi){
					console.log(gi);
					GameInfo = gi;
					
					if(GameInfo.removed == "true"){
						backToMenu();
						return;
					}
					
					if(GameInfo.isPublic == "false" && TOOLS.Storage.get("user") != GameInfo.author){
						backToMenu();
						return;
					}
					
					REST.getGameEntityLayer(gameId, function(gameEntityLayer){
						console.log(gameEntityLayer);
						SG.game.entity = gameEntityLayer.entities;
						
						REST.getGameBoxLayer(gameId, 0, function(gameBoxLayer0){
							console.log(gameBoxLayer0);
							SG.game.bg = gameBoxLayer0.boxes;
							
							REST.getGameBoxLayer(gameId, 1, function(gameBoxLayer1){
								console.log(gameBoxLayer1);
								SG.game.level = gameBoxLayer1.boxes;
																	
								REST.getGameBoxLayer(gameId, 2, function(gameBoxLayer2){
									console.log(gameBoxLayer2);
									SG.game.fg = gameBoxLayer2.boxes;
									
									REST.getGameOptions(gameId, function(gameOptions){
										console.log(gameOptions);
										
										if(gameOptions && gameOptions.options){
											if(gameOptions.options.bgImg && gameOptions.options.bgImg.img){
												SG.bgImg.img = gameOptions.options.bgImg.img;
											}
											if(gameOptions.options.levelSize){
												SG.game._levelSize = gameOptions.options.levelSize;
											}
										}
											
										init();
										
									}, handleLoadError);
								}, handleLoadError);
							}, handleLoadError);
						}, handleLoadError);
					}, handleLoadError);
				}, handleLoadError);
			
			}, handleLoadError);*/
		}
		
	});
	
	
	var handleLoadError = function(err){
		console.error(err);
		hideLoading();
		//TODO: handle errors
		switch(err.status){
			case 400:
				// TODO:
				break;
			case 403:
				// TODO:
				break;
			case 404:
				// TODO:
				break;
		}
		//backToMenu();
	};
	
	var init = function(){
		hideLoading();
		
		R.addStage(new H5R.Stage("stage_bgImg")).setScenegraphPart("bgImg");
		R.addStage(new H5R.Stage("stage_bg")).setScenegraphPart("game.bg").setCamera(camera);
		R.addStage(new H5R.Stage("stage_level")).setScenegraphPart("game.level").setCamera(camera);
		R.addStage(new H5R.Stage("stage_entity")).setScenegraphPart("game.entity").setCamera(camera);
		R.addStage(new H5R.Stage("stage_fg")).setScenegraphPart("game.fg").setCamera(camera);
		
		R.setScenegraph(SG);
		R.setTileset(TS, function(){
			R.drawFrame();
		});
		R.stop();
		
		$("#playButton").click(function(){
			play = !play;
			if(play){
				startGame();
			} else {
				stopGame();
			}
			
		});
		
		SG.game._overlayId = "#endGameOverlay";
		
		SG.game._onStop = function(message, score, time){
			
			/*if(typeof message != "undefined" &&
				typeof score != "undefined" &&
				typeof time != "undefined"){
					alert(message + " Score: " + score + " Zeit: " + (time/1000) + " Sekunden");
					// TODO better message
			}*/
			
			
			$("#leftInfoText").html("");
			$("#rightInfoText").html("");
		
			stopGame();
		};
		
		SG.game._onUpdate = function(score, time){
			
			$("#leftInfoText").html("Score: " + score);
			
			var seconds = ~~(time/1000);
			var minutes = ~~(seconds/60);
			var seconds = seconds%60;
			var hours = ~~(minutes/60);
			var minutes = minutes%60;
			
			var time = "Zeit: ";
			
			if(hours != 0){
				time += hours + ":";
				if(minutes < 10) time += "0";
				time += minutes + ":";
				if(seconds < 10) time += "0";
				time += seconds;
			} else if(minutes != 0){
				time += minutes + ":";
				if(seconds < 10) time += "0";
				time += seconds;
			} else {
				time += seconds;
			}
			
			$("#rightInfoText").html(time);
			
		};
		
	};
	
	var startGame = function(){
		SG.game.play = true;
		play = true;
		
		R.start();
		
		$("#playButton").fadeOut();
	};
	
	var stopGame = function(){
	
		SG.game.play = false;
		play = false;
		
		R.stop();
		
		$("#playButton").fadeIn();
	};
	
});