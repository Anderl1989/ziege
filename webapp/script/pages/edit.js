$(function(){
	var backToMenu = function(){
		window.location = "myGames.html";
	};

	var GameInfo = {};
	
	var drawTS = {
		grid: {
			img: "res/grid.png",
		}
	};
		
	var drawSG = {
		grid: {
			_img: "grid",
			_repeatX: 40,
			_repeatY: 30,
		},
		cursor: {
			_hide: true,
			cross: false,
			color: "rgba(255,255,255,0.5)",
			stroke: "rgba(0,0,255,0.5)",
			x: 0,
			y: 0,
			width: 16,
			height: 16,
			_render: function(self, ctx){
				ctx.beginPath();
				ctx.rect(self.x, self.y, self.width, self.height);
				ctx.fillStyle = self.color;
				ctx.fill();
				ctx.lineWidth = 2;
				ctx.strokeStyle = self.stroke;
				ctx.stroke();
				if(self.cross){
					ctx.beginPath();
					ctx.strokeStyle = "rgba(255,0,0,1)";
					ctx.moveTo(self.x + 4, self.y + 4);
					ctx.lineTo(self.x + self.width - 4, self.y + self.height - 4);
					ctx.moveTo(self.x + 4, self.y + self.height - 4);
					ctx.lineTo(self.x + self.width - 4, self.y + 4);
					ctx.stroke();
				}
				
			},
		},
		helper: {
			_render: function(self, ctx){
				if(mode < 2 && !preview){
					renderGridHighlights(ctx, SG.game.bg, "rgb(0,0,255)");
					renderGridHighlights(ctx, SG.game.level, "rgb(0,204,0)");
					renderGridHighlights(ctx, SG.game.fg, "rgb(255,0,0)");
				}else if(mode == 2 && !preview){
					renderEntityGridHighlights(ctx, SG.game.entity);
				}
			},
		},
		minimap: {
			_render: function(self, ctx){
				renderMinimap(self, ctx);
			},
		},
	};
		
	var renderEntityGridHighlights = function(ctx, entities){
		ctx.beginPath();
		ctx.strokeStyle = "rgb(0,204,0)";
		ctx.lineWidth = 2;
		ctx.lineCap = "round";
		
		for(var i in entities){
			var e = entities[i];
			
			if(e._x && e._y && e._imgWidth && e._imgHeight){
				ctx.moveTo(e._x, e._y);
				ctx.lineTo(e._x + e._imgWidth, e._y);
				ctx.lineTo(e._x + e._imgWidth, e._y + e._imgHeight);
				ctx.lineTo(e._x, e._y + e._imgHeight);
				ctx.lineTo(e._x, e._y);
			}
		}
		
		ctx.stroke();
	};
	
	var renderGridHighlights = function(ctx, layer, color){
		ctx.beginPath();
		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		ctx.lineCap = "round";
		
		var offsetX = camera.x/16;
		var offsetY = camera.y/16;
		
		for(var i = 0+offsetX; i < 40+offsetX; i++){
			for(var j = 1+offsetY; j < 30+offsetY; j++){
				var a = layer[i + "x" + (j-1)];
				var b = layer[i + "x" + j];
				if((!a && b)|| (a && !b)){
					ctx.moveTo(i*16, j*16);
					ctx.lineTo((i+1)*16, j*16);
				}
			}
		}
		
		for(var j = 0+offsetY; j < 30+offsetY; j++){
			for(var i = 1+offsetX; i < 40+offsetX; i++){
				var a = layer[(i-1) + "x" + j];
				var b = layer[i + "x" + j];
				if((!a && b)|| (a && !b)){
					ctx.moveTo(i*16, j*16);
					ctx.lineTo(i*16, (j+1)*16);
				}
			}
		}
		
		ctx.stroke();
	};
	
	var sgStates = [];
	var sgStatesPosition = -1;
	
	var mode = 0;
	var layer = 1;
	var isGridShown = true;
	var rectTool = false;
	var drawBox = "";
	var drawEntity = {};
	var mousedown = false;
	var rectX = 0;
	var rectY = 0;
	var isDragging = false;
	var dragObject = {};
	var play = false;
	var preview = false;
	var modified = false;
	var levelMoving = false;
	window.R = new H5R();
	window.drawR = new H5R();
	
	var showGrid = function(show){
		isGridShown = show;
		if(isGridShown){
			$("#gridOff").removeClass("active");
			$("#gridOn").addClass("active");
			drawSG.grid._hide = false;
		} else {
			$("#gridOn").removeClass("active");
			$("#gridOff").addClass("active");
			drawSG.grid._hide = true;
		}
		drawR.drawFrame();
	};
	
	var useRect = function(rect){
		rectTool = rect;
		drawR.drawFrame();
	};
	
	var usePreview = function(prev){
		preview = prev;
		if(preview){
			$("#previewOff").removeClass("active");
			$("#previewOn").addClass("active");
		} else {
			$("#previewOn").removeClass("active");
			$("#previewOff").addClass("active");
		}
		switchLayer(layer);
		drawR.drawFrame();
	};
	
	var switchMode = function(newMode){
		mode = newMode || 0;
		
		$(".toolButton").removeClass("active");
		
		var tilesets = {};
		for(var i in TS){
			if(i == "game") continue;
			tilesets[i] = TS[i];
		}
		
		switch(mode){
			case 0:
				var grid = $.createTemplateURL("tpl/elements/edit_grid.tpl.html");
				var layers = $.createTemplateURL("tpl/elements/edit_layers.tpl.html");
				$("#settingsContainer").setTemplateURL("tpl/elements/edit_paintMode.tpl.html", {layers: layers, grid: grid});
				
				
				$("#settingsContainer").processTemplate({tilesets: tilesets, boxes: TS.game.box, drawBox: drawBox});
				if(rectTool){
					$("#toolButtonPaintRect").addClass("active");
				} else {
					$("#toolButtonPaint").addClass("active");
				}
				drawSG.cursor.cross = false;
				switchLayer(layer);
				showGrid(isGridShown);
				useRect(rectTool);
				usePreview(preview);
				break;
			case 1:
				var grid = $.createTemplateURL("tpl/elements/edit_grid.tpl.html");
				var layers = $.createTemplateURL("tpl/elements/edit_layers.tpl.html");
				$("#settingsContainer").setTemplateURL("tpl/elements/edit_eraseMode.tpl.html", {layers: layers, grid: grid});
				$("#settingsContainer").processTemplate();
				if(rectTool){
					$("#toolButtonEraseRect").addClass("active");
				} else {
					$("#toolButtonErase").addClass("active");
				}
				drawSG.cursor.cross = true;
				switchLayer(layer);
				showGrid(isGridShown);
				useRect(rectTool);
				usePreview(preview);
				break;
			case 2:
				var grid = $.createTemplateURL("tpl/elements/edit_grid.tpl.html");
				$("#settingsContainer").setTemplateURL("tpl/elements/edit_entityMode.tpl.html", {grid: grid});
				$("#settingsContainer").processTemplate({tilesets: tilesets, entities: TS.game.entity, drawEntity: drawEntity});
				$("#toolButtonEntity").addClass("active");
				drawSG.cursor._hide = true;
				switchLayer(layer);
				showGrid(isGridShown);
				usePreview(preview);
				break;
			case 3:
				//$("#settingsContainer").html("");
				var grid = $.createTemplateURL("tpl/elements/edit_grid.tpl.html");
				$("#settingsContainer").setTemplateURL("tpl/elements/edit_settingsMode.tpl.html", {grid: grid});
				$("#settingsContainer").processTemplate({gameName: GameInfo.name, hidePreviewBtn: true,});
				$("#toolButtonSettings").addClass("active");
				drawSG.cursor._hide = true;
				switchLayer(layer);
				showGrid(isGridShown);
				usePreview(preview);
				initPlayfieldSizeHandlers();
				break;
			case 4:
				var grid = $.createTemplateURL("tpl/elements/edit_grid.tpl.html");
				$("#settingsContainer").setTemplateURL("tpl/elements/edit_backgroundMode.tpl.html", {grid: grid});
				$("#settingsContainer").processTemplate({tilesets: tilesets, backgrounds: TS.game.backgroundImage, drawBackground: SG.bgImg.img});
				$("#toolButtonBackground").addClass("active");
				drawSG.cursor._hide = true;
				switchLayer(layer);
				showGrid(isGridShown);
				usePreview(preview);
				break;
		}
		drawR.drawFrame();
	};
	
	var switchLayer = function(newLayer){
		layer = newLayer || 0;
		
		$(".layer").removeClass("active");
			
		
		var color = "";
		
		switch(layer){
			case 0:
				$("#layerBackground").addClass("active");
				$("#stage_bg").css("opacity","1");
				$("#stage_level").css("opacity","0.2");
				$("#stage_fg").css("opacity","0.2");
				color = "rgba(0,0,255,0.5)";
				break;
			case 1:
				$("#layerCenter").addClass("active");
				$("#stage_bg").css("opacity","0.2");
				$("#stage_level").css("opacity","1");
				$("#stage_fg").css("opacity","0.2");
				color = "rgba(0,191,0,0.5)";
				break;
			case 2:
				$("#layerForeground").addClass("active");
				$("#stage_bg").css("opacity","0.2");
				$("#stage_level").css("opacity","0.2");
				$("#stage_fg").css("opacity","1");
				color = "rgba(255,0,0,0.5)";
				break;
		}
		
		if(!preview && mode == 4){
			$("#stage_bg").css("opacity","0.2");
			$("#stage_level").css("opacity","0.2");
			$("#stage_fg").css("opacity","0.2");
		}
		
		if(preview || play || mode == 2 || mode == 3){
			$("#stage_bg").css("opacity","1");
			$("#stage_level").css("opacity","1");
			$("#stage_fg").css("opacity","1");
		} 
		
		drawSG.cursor.stroke = color;
		
		if(mode == 2){
			
		}
		drawR.drawFrame();
	};
	
	var drawBoxAt = function(gp){
		if(drawBox != ""){
			var activeLayer;
			switch(layer){
				case 0:
					activeLayer = SG.game.bg;
					break;
				case 1:
					activeLayer = SG.game.level;
					break;
				default:
					activeLayer = SG.game.fg;
					break;
			}
			
			activeLayer[gp.x + "x" + gp.y] = {
				_img: drawBox,
				_x: gp.x * 16,
				_y: gp.y * 16,
				_fps: 16,
			}
		}
	};
	
	var removeBoxAt = function(gp){
		var activeLayer;
		switch(layer){
			case 0:
				activeLayer = SG.game.bg;
				break;
			case 1:
				activeLayer = SG.game.level;
				break;
			default:
				activeLayer = SG.game.fg;
				break;
		}
		delete activeLayer[gp.x + "x" + gp.y];
	};
	
	var addToTS = function(TSUpdate){
		for(var i in TSUpdate.box){
			TS.game.box[i] = TSUpdate.box[i];
		}
		for(var i in TSUpdate.entity){
			TS.game.entity[i] = TSUpdate.entity[i];
		}
		for(var i in TSUpdate.backgroundImage){
			TS.game.backgroundImage[i] = TSUpdate.backgroundImage[i];
		}
		
		showLoading();
		R.updateTileset(function(){
			hideLoading();
			switchMode(mode);
		});	
		
	};
	
	var removeBoxFromTS = function(boxid){
		
		console.log(boxid);
		
		if(boxid != ""){
		
			var splitId = boxid.split(".");
			if(splitId[0] == "game"){
		
				showLoading();
				
				REST.removeTilesetBox(TOOLS.getUrlParam("gameId"), splitId[2], function(){
					var toRemove = [];
				
					for(var i in SG.game.fg){
						if(SG.game.fg[i]._img == boxid){
							toRemove.push(i);
						}
					}
					console.log(toRemove);
					for(var i in toRemove){
						delete SG.game.fg[toRemove[i]];
					}
					toRemove = [];
					
					for(var i in SG.game.level){
						if(SG.game.level[i]._img == boxid){
							toRemove.push(i);
						}
					}
					console.log(toRemove);
					for(var i in toRemove){
						delete SG.game.level[toRemove[i]];
					}
					toRemove = [];
					
					for(var i in SG.game.bg){
						if(SG.game.bg[i]._img == boxid){
							toRemove.push(i);
						}
					}
					console.log(toRemove);
					for(var i in toRemove){
						delete SG.game.bg[toRemove[i]];
					}
					
					delete TS.game.box[splitId[2]];
					
					R.updateTileset(function(){
						hideLoading();
						switchMode(mode);
						drawBox = "";
						
						R.drawFrame();
						drawR.drawFrame();
						
						
						sgStates = [];
						sgStatesPosition = -1;
						invalidate();
						save();
					});	

				}, function(){
					hideLoading();
				});
			}
		}
	};
	
	var removeEntityFromTS = function(entityid){
		
		console.log(entityid);
		
		if(entityid != ""){
		
			var splitId = entityid.split(".");
			if(splitId[0] == "game"){
		
				showLoading();
				
				REST.removeTilesetEntity(TOOLS.getUrlParam("gameId"), splitId[2], function(){
					var toRemove = [];
				
					for(var i = 0; i < SG.game.entity.length;){
						if(SG.game.entity[i]._img == entityid){
							SG.game.entity.splice(i, 1);
						} else {
							i++;
						}
					}
					
					delete TS.game.entity[splitId[2]];
					
					R.updateTileset(function(){
						hideLoading();
						switchMode(mode);
						drawEntity = {};
						
						R.drawFrame();
						drawR.drawFrame();
						
						
						sgStates = [];
						sgStatesPosition = -1;
						invalidate();
						save();
					});	

				}, function(){
					hideLoading();
				});
			}
		}
	};
	
	var removeBackgroundFromTS = function(bgid){
		
		console.log(bgid);
		
		if(bgid != ""){
		
			var splitId = bgid.split(".");
			if(splitId[0] == "game"){
		
				showLoading();
				
				REST.removeTilesetBackgroundImage(TOOLS.getUrlParam("gameId"), splitId[2], function(){
					
					SG.bgImg.img = "";
					
					delete TS.game.backgroundImage[splitId[2]];
					
					R.updateTileset(function(){
						hideLoading();
						switchMode(mode);
						
						R.drawFrame();
						drawR.drawFrame();
						
						
						sgStates = [];
						sgStatesPosition = -1;
						invalidate();
						save();
					});	

				}, function(){
					hideLoading();
				});
			}
		}
	};
	
	LNG.ready(function(){
		new SPRITE_UPLOAD(addToTS);
		
		var header = $.createTemplateURL("tpl/elements/header.tpl.html");
		var loading = $.createTemplateURL("tpl/elements/loading.tpl.html");
		var spriteUploader = $.createTemplateURL("tpl/elements/sprite_upload.tpl.html");
		$("#container").setTemplateURL("tpl/edit.tpl.html", {header: header, loading: loading, spriteUploader:spriteUploader});
		$("#container").processTemplate();
		
		var altLayout = TOOLS.getUrlParam("altLayout");
		if(altLayout){
			$("#editToolBox").css("width","70px");
			$(".toolButton").addClass("mark");
			$(".toolButton").css("width","50px");
			$(".toolButton").css("height","50px");
			$(".toolButton").css("margin-right","0px");
			$(".toolButton").css("margin-bottom","20px");
			$(".toolButton:last-child").css("margin-bottom","10px");
			//$("#editToolBox").css("box-shadow","3px 6px 0 -3px #ccc, 3px -6px 0 -3px #ccc");
			//$("#editSettingsBox").css("box-shadow","0 9px 0 -6px #ccc, -3px -6px 0 -3px #ccc");
			$("#editSettingsBox").css("background","rgb(184, 216, 183)");
			if(altLayout == "1"){
				$("#editToolBox").css("left","670px");
				$("#editCanvasBox").css("left","0px");
				$("#editSettingsBox").css("left","740px");
			} else {
				$("#editToolBox").css("left","0px");
				$("#editCanvasBox").css("left","340px");
				$("#editSettingsBox").css("left","70px");
			}
		}
		
		showLoading();
		
		REST.checkLogin(function(){
			var gameId = TOOLS.getUrlParam("gameId");
			if(!gameId){
				backToMenu();
			} else {
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
					
					REST.getGameInfoForEdit(gameId, function(gi){
						console.log(gi);
						GameInfo = gi;
						
						if(GameInfo.isPublic == "true" || GameInfo.removed == "true"){
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
			
			
				REST.getGameInfoForEdit(gameId, function(gi){
				
					console.log(gi);
					GameInfo = gi;
					
					$("#gameNameDisplay").html(GameInfo.name);
				
					if(GameInfo.isPublic == "true" || GameInfo.removed == "true"){
						backToMenu();
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
						console.log("GAME TILESETS", GameInfo.tilesets);
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
			
			}
			
		});
		
	});
	
	var saveSuccessTO = null;
	
	var saveErrCb = function(){};
	var save = function(onSuccess, onError){
		saveErrCb = onError || function(){};
		onSuccess = onSuccess || function(){};
		var gameId = TOOLS.getUrlParam("gameId");
		//TODO: update game info
		showLoading();
		
		REST.updateGameInfo(gameId, GameInfo, function(gi){
			console.log("saved gameInfo", GameInfo, gi);
			
			REST.updateGameEntityLayer(gameId, SG.game.entity, function(gameEntityLayer){
				console.log("saved entity", SG.game.entity, gameEntityLayer);
				
				REST.updateGameBoxLayer(gameId, 0, SG.game.bg, function(gameBoxLayer0){
					console.log("saved layer bg", SG.game.bg, gameBoxLayer0);
					
					REST.updateGameBoxLayer(gameId, 1, SG.game.level, function(gameBoxLayer1){
						console.log("saved layer level", SG.game.level, gameBoxLayer1);
						
						REST.updateGameBoxLayer(gameId, 2, SG.game.fg, function(gameBoxLayer2){
							console.log("saved layer fg", SG.game.fg, gameBoxLayer2);
							
							REST.updateGameOptions(gameId, {
								bgImg:{
									img: SG.bgImg.img,
								},
								levelSize: SG.game._levelSize,
							}, function(gameOptions){
								console.log("saved options", {
									bgImg:{
										img: SG.bgImg.img,
									},
									levelSize: SG.game._levelSize,
								}, gameOptions);
								//TODO: add options
								
								hideLoading();
								//alert("saved successfully");
								modified = false;
								$("#toolButtonSave").removeClass("unsaved");
								
								$("#saveSuccessMessage").css("display","inline-block");
								
								if(sgStatesPosition != sgStates.length -1){
									sgStates = sgStates.slice(0,sgStatesPosition+1);
								}
								
								if(saveSuccessTO) clearTimeout(saveSuccessTO);
								saveSuccessTO = setTimeout(function(){
									$("#saveSuccessMessage").fadeOut();
								}, 3000);
								
								$("#gameNameDisplay").html(GameInfo.name);
								
								onSuccess();
								
							}, handleSaveError);
						}, handleSaveError);
					}, handleSaveError);
				}, handleSaveError);
			}, handleSaveError);
		}, handleSaveError);
	};
	
	var handleSaveError = function(err){
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
		saveErrCb();
		//backToMenu();
	};
	
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
		
		var stage1 = R.addStage(new H5R.Stage("stage_bgImg")).setScenegraphPart("bgImg");
		var stage2 = R.addStage(new H5R.Stage("stage_bg")).setScenegraphPart("game.bg").setCamera(camera);
		var stage3 = R.addStage(new H5R.Stage("stage_level")).setScenegraphPart("game.level").setCamera(camera);
		var stage4 = R.addStage(new H5R.Stage("stage_entity")).setScenegraphPart("game.entity").setCamera(camera);
		var stage5 = R.addStage(new H5R.Stage("stage_fg")).setScenegraphPart("game.fg").setCamera(camera);
		
		
		drawR.addStage(new H5R.Stage("stage_grid")).setScenegraphPart("grid");
		drawR.addStage(new H5R.Stage("stage_helper")).setScenegraphPart("helper").setCamera(camera);
		drawR.addStage(new H5R.Stage("stage_minimap")).setScenegraphPart("minimap");
		drawR.addStage(new H5R.Stage("stage_cursor")).setScenegraphPart("cursor").setCamera(camera);
		
		drawR.setScenegraph(drawSG);
		drawR.setTileset(drawTS, function(){
			drawR.drawFrame();
		});
		
		
		R.setScenegraph(SG);
		R.setTileset(TS, function(){
			R.drawFrame();
			drawR.drawFrame();
		});
		R.stop();
		
		//drawR.stop();
		
		
		setTimeout(function(){
			var state = stringify({SG:SG,GameInfo:GameInfo});
		
			sgStates.push(state);
			sgStatesPosition = sgStates.length-1;
			
			var storedState = TOOLS.Storage.get(TOOLS.getUrlParam("gameId"));
			if(storedState){
				var parsed = JSON.parse(storedState);
				if(!GameInfo.modifiedDate || parsed.GameInfo.modifiedDate > GameInfo.modifiedDate){
					sgStates.push(storedState);
					sgStatesPosition = sgStates.length-1;
					undoRedo();
					
					modified = true;
					$("#toolButtonSave").addClass("unsaved");
					
					//TODO: prompt user that state has been recovered
				}
			}
			
			R.drawFrame();
			drawR.drawFrame();
			
		},100);
		
		$("#toolButtonUndo").click(function(){
			if(sgStatesPosition > 0){
				sgStatesPosition -= 1;
				undoRedo();
			}
		});
		
		$("#toolButtonRedo").click(function(){
			if(sgStatesPosition < sgStates.length-1){
				sgStatesPosition += 1;
				undoRedo();
			}
		});
		
				
		$("#stage_cursor").on("mouseover",function(e){
			if(mode < 2){
				drawSG.cursor._hide = false;
			}
			drawR.start();
		});
		
		var levelMoveStartX = 0;
		var levelMoveStartY = 0;
		var levelMoveCameraStartX = 0;
		var levelMoveCameraStartY = 0;
		var levelMovingKey = false;
		
		var gridSnapKey = false;
		
		$("#stage_cursor").on("mousedown",function(e){
			levelMoving = levelMovingKey;
			if(levelMoving){
				levelMoveCameraStartX = camera.x;
				levelMoveCameraStartY = camera.y;
				levelMoveStartX = e.offsetX;
				levelMoveStartY = e.offsetY;
			} else {
				var gp = mouseToGrid(e.offsetX-1, e.offsetY-1);
				mousedown = true;
				rectX = gp.x;
				rectY = gp.y;
				
				if(mode == 2){
					var x = e.offsetX-1+camera.x;
					var y = e.offsetY-1+camera.y;
					var dist = -1;
					var closest = null;
					for(var i in SG.game.entity){
						var en = SG.game.entity[i];
						if(en._x <= x && en._x + en._imgWidth > x && en._y <= y && en._y + en._imgHeight > y){
							var newdist = Math.pow(en._x-x,2) + Math.pow(en._y-y,2);
							if(!closest || newdist < dist){
								closest = en;
								dist = newdist;
							}
						}
					}
					if(closest){
						isDragging = true;
						dragObject = closest;
						invalidate(true);
					} else if(drawEntity && drawEntity.id){
						
						dragObject = {
							_img: drawEntity.id,
							_x: x,
							_y: y,
							_fps: drawEntity.fps || 4,
							behavior: drawEntity.behavior,
						};
						
						SG.game.entity.push(dragObject);
						isDragging = true;
						invalidate(true);
					} else {
						isDragging = false;
						dragObject = {};
					}
				}
			}
		});
		
		$("#stage_cursor").on("mouseup",function(e){
			if(levelMoving){
				//levelMoving = false;
			} else {
				var gp = mouseToGrid(e.offsetX-1, e.offsetY-1);
				
				console.log(gp, mousedown, rectTool);
				if(mousedown && rectTool){
					var x, y, w, h;
					if(rectX < gp.x){
						x = rectX;
						w = gp.x - rectX + 1;
					} else {
						x = gp.x;
						w = rectX - gp.x + 1;
					}
					if(rectY < gp.y){
						y = rectY;
						h = gp.y - rectY + 1;
					} else {
						y = gp.y;
						h = rectY - gp.y + 1;
					}
					
					console.log(x, y, w, h);
					switch(mode){
						case 0:
							var start = new Date().getTime();
							for(var i = 0; i < w; i++){
								for(var j = 0; j < h; j++){
									drawBoxAt({x:i+x, y:j+y});
								}
							}
							var duration = new Date().getTime() - start;
							console.info("Adding " + w*h + " level elements took " + duration/1000 + " seconds");
							invalidate();
							//drawBoxAt(gp);
							break;
						case 1:
							var start = new Date().getTime();
							for(var i = 0; i < w; i++){
								for(var j = 0; j < h; j++){
									removeBoxAt({x:i+x, y:j+y});
								}
							}
							var duration = new Date().getTime() - start;
							console.info("Removing " + w*h + " level elements took " + duration/1000 + " seconds");
							invalidate();
							//removeBoxAt(gp);
							break;
					}
				}
				mousedown = false;
				
				drawSG.cursor.x = gp.x * 16 + 1;
				drawSG.cursor.y = gp.y * 16 + 1;
				drawSG.cursor.width = 16;
				drawSG.cursor.height = 16;
				
				isDragging = false;
				/*if(dragObject){
					if(dragObject._x < 0) dragObject._x = 0;
					if(dragObject._y < 0) dragObject._y = 0;
					if(dragObject._x >= 624) dragObject._x = 623;
					if(dragObject._y >= 464) dragObject._y = 463;
				}*/
				dragObject = {};
			}
			invalidate();
		});
		
		$("#stage_cursor").on("click",function(e){
			if(levelMoving){
				levelMoving = false;
			} else {
				var gp = mouseToGrid(e.offsetX-1, e.offsetY-1);
				switch(mode){
					case 0:
						console.log("click paint");
						drawBoxAt(gp);
						invalidate();
						break;
					case 1:
						removeBoxAt(gp);
						invalidate();
						break;
					case 2:
						break;
				}
			}
		});
		
		$("#stage_cursor").on("mousemove",function(e){
			if(levelMoving){
				camera.x = levelMoveCameraStartX - (((e.offsetX - levelMoveStartX)/16 + 0.5) << 0)*16;
				camera.y = levelMoveCameraStartY - (((e.offsetY - levelMoveStartY)/16 + 0.5) << 0)*16;
				checkCamera();
				R.drawFrame();
			} else {
				var gp = mouseToGrid(e.offsetX-1, e.offsetY-1);
				
				if(mousedown && rectTool && mode != 2){
					var x, y, w, h;
					if(rectX < gp.x){
						x = rectX;
						w = gp.x - rectX + 1;
					} else {
						x = gp.x;
						w = rectX - gp.x + 1;
					}
					if(rectY < gp.y){
						y = rectY;
						h = gp.y - rectY + 1;
					} else {
						y = gp.y;
						h = rectY - gp.y + 1;
					}
				
					drawSG.cursor.x = x * 16 + 1;
					drawSG.cursor.y = y * 16 + 1;
					drawSG.cursor.width = w * 16;
					drawSG.cursor.height = h * 16;
				} else {
					drawSG.cursor.x = gp.x * 16 + 1;
					drawSG.cursor.y = gp.y * 16 + 1;
					drawSG.cursor.width = 16;
					drawSG.cursor.height = 16;
				}
				
				if(mode < 2){
					drawSG.cursor._hide = false;
				}
				
				if(mousedown && !rectTool){
					switch(mode){
						case 0:
							drawBoxAt(gp);
							invalidate(true);
							break;
						case 1:
							removeBoxAt(gp);
							invalidate(true);
							break;
						case 2:
							break;
					}
				}
				
				if(isDragging && mode == 2){
					var newDragX = e.offsetX + camera.x - dragObject._imgWidth/2.;
					var newDragY = e.offsetY + camera.y - dragObject._imgHeight/2.
					
					if(gridSnapKey){
						newDragX = (((newDragX - dragObject._imgWidth/2.)/(16/2) + 0.5)<<0)*(16/2) + dragObject._imgWidth/2.;
						newDragY = (((newDragY - dragObject._imgHeight/2.)/(16/2) + 0.5)<<0)*(16/2) + dragObject._imgHeight/2.;
					}
					
					//would be false if newDragX is NaN, javascript is weird!
					if(newDragX == newDragX) dragObject._x = newDragX;
					if(newDragY == newDragY) dragObject._y = newDragY;
					invalidate(true);
				}
			}
		});
		
		$("#stage_cursor").on("mouseout mouseleave",function(e){
			drawSG.cursor._hide = true;
			mousedown = false;
			levelMoving = false;
			
			if(isDragging && mode == 2){
				isDragging = false;
				var idx = SG.game.entity.indexOf(dragObject);
				if (idx > -1) SG.game.entity.splice(idx, 1);
				dragObject = {};
			}
			invalidate();
			drawR.stop();
		});
		
		$("#toolButtonSave").click(function(){
		
			var canvas = document.createElement("canvas");
			canvas.width = 640;
			canvas.height = 480;
			ctx = canvas.getContext('2d');
			ctx.beginPath();
			ctx.rect(0, 0, 640, 480);
			ctx.fillStyle = '#ffffff';
			ctx.fill();
			ctx.drawImage(stage1.getCanvas(), 0, 0);
			ctx.drawImage(stage2.getCanvas(), 0, 0);
			ctx.drawImage(stage3.getCanvas(), 0, 0);
			ctx.drawImage(stage4.getCanvas(), 0, 0);
			ctx.drawImage(stage5.getCanvas(), 0, 0);
			
			GameInfo.img = canvas.toDataURL();
		
			save();
		});
		
		$("#toolButtonPlay").click(function(){
			play = !play;
			if(play){
				startGame();
			} else {
				stopGame();
				$("#endGameOverlay").hide();
			}
			
		});
		
		SG.game._overlayId = "#endGameOverlay";
		SG.game._showEndButton = true;
		
		SG.game._onStop = function(message, score, time){
			
			/*if(typeof message != "undefined" &&
				typeof score != "undefined" &&
				typeof time != "undefined"){
					alert(message + " Score: " + score + " Zeit: " + (time/1000) + " Sekunden");
					// TODO better message
			}*/
			
			
		
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
		
		$("#toolButtonPaint").click(function(){
			useRect(false);
			switchMode(0);
		});
		$("#toolButtonPaintRect").click(function(){
			useRect(true);
			switchMode(0);
		});
		$("#toolButtonErase").click(function(){
			useRect(false);
			switchMode(1);
		});
		$("#toolButtonEraseRect").click(function(){
			useRect(true);
			switchMode(1);
		});
		$("#toolButtonEntity").click(function(){
			switchMode(2);
		});
		$("#toolButtonSettings").click(function(){
			switchMode(3);
		});
		$("#toolButtonBackground").click(function(){
			switchMode(4);
		});
		
		$(document).on("click", "#layerBackground", function(){
			switchLayer(0);
		});
		$(document).on("click", "#layerCenter", function(){
			switchLayer(1);
		});
		$(document).on("click", "#layerForeground", function(){
			switchLayer(2);
		});
		
		$(document).on("click", "#gridOn", function(){
			showGrid(false);
		});
		$(document).on("click", "#gridOff", function(){
			showGrid(true);
		});
		
		$(document).on("click", "#previewOn", function(){
			usePreview(false);
		});
		$(document).on("click", "#previewOff", function(){
			usePreview(true);
		});
		
		$(document).on("click", ".levelbox", function(){
			$(".levelbox").removeClass("active");
			$(this).addClass("active");
			drawBox = $(this).attr("boxId");
		});
		
		$(document).on("click", ".background", function(){
			$(".background").removeClass("active");
			$(this).addClass("active");
			SG.bgImg.img = $(this).attr("backgroundId");
			invalidate();
		});
		
		$(document).on("click", ".entity", function(e){
			$(".entity").removeClass("active");
			$(this).addClass("active");
			drawEntity = {
				id: $(this).attr("entityId"),
				behavior: $(this).attr("behavior"),
			};
		});
		
		$(document).on("click", "#addTilesetElement", function(){
			$("#overlayContainer").setTemplateURL("tpl/elements/addTile.tpl.html");
			$("#overlayContainer").processTemplate();
			$("#overlay").css("display","table");
		});
		
		$(document).on("click", "#addPublicTileset", function(){
			$("#overlayContainer").setTemplateURL("tpl/elements/tilesetExplorer.tpl.html");
			showLoading();
			REST.getGameInfoWithTileset(function(tilesets){
				hideLoading();
				$("#overlayContainer").processTemplate({tilesets:tilesets});
				$("#overlay").css("display","table");
			}, function(){
				hideLoading();
				$("#overlay").css("display","none");
			});
		});
		
		$(document).on("click", ".tilesetExplorerEntry", function(){
			var tsId = $(this).attr("gameId");
			var tsName = $(this).attr("tsName");
			if(tsId){
				if(!GameInfo.tilesets) GameInfo.tilesets = {};
				if(GameInfo.tilesets instanceof Array) GameInfo.tilesets = {};
				GameInfo.tilesets[tsId] = tsName;
				save(function(){
					var al = new AsyncLoader();
					
					var addPublicTilesetToAl = function(i){
						al.addMethod(REST.getPublicTileset, [i], function(tileset){
								console.log(tileset);
								
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
					showLoading();
					al.execute(function(){
						R.setTileset(TS, function(){
							R.drawFrame();
							drawR.drawFrame();
							switchMode(mode);
						});
						hideLoading();
					}, function(){
						console.error("Unknown error");
					});
					
				}, function(){
					console.error("Unknown error");
				});
			}
			$("#overlay").css("display","none");
		});
		
		$(document).on("click", ".tilesetBoxHeader", function(){
			$(this).parent().children(":not(.tilesetBoxHeader)").slideToggle(100);
		});
		
		
		$(document).on("click", "#removeTilesetElement", function(){
			switch(mode){
				case 0:
					if(drawBox != ""){
						if(confirm(t("edit.paint.remove"))){
							removeBoxFromTS(drawBox);
						}
					}
					break;
				case 2:
					if(drawEntity.id){
						if(confirm(t("edit.entity.remove"))){
							removeEntityFromTS(drawEntity.id);
						}
					}
					break;
				case 4:
					if(SG.bgImg.img && SG.bgImg.img != ""){
						if(confirm(t("edit.background.remove"))){
							removeBackgroundFromTS(SG.bgImg.img);
						}
					}
					break;
			}
		});
				
		
		$(document).on("click", "#closeOverlay", function(){
			$("#overlay").css("display","none");
		});
		
		/*$(document).on("drag", ".entity", function(e){
			if(isDragging){
				e.stopPropagation();
				e.preventDefault();
				return false;
			}
		});*/
		
		/*$(document).on("dragenter", "#stage_cursor", function(e){
			if (e.preventDefault) e.preventDefault();
			isDragging = true;
			dragObject = {
				_img: drawEntity.id,
				_x: e.offsetX-1,
				_y: e.offsetY-1,
				_fps: drawEntity.fps || 4,
				behavior: drawEntity.behavior,
			};
			SG.game.entity.push(dragObject);
			return false;
		});*/
		
		window.onkeydown = function (e) {
			var code = e.keyCode ? e.keyCode : e.which;
			console.log("keydown: " + code);
			switch(code){
				/*case 37: //left
				case 65: //left
					SG.game.keyLeft = true;
					break;
				case 38: //up
				case 87: //up
					SG.game.keyUp = true;
					break;
				case 39: //right
				case 68: //right
					SG.game.keyRight = true;
					break;
				case 40: //down
				case 83: //down
					//break;
				case 13: //shoot
				case 17: //shoot
					SG.game.keyFire = true;
					break;*/
				case 16: //shoot && gridSnap
					//SG.game.keyFire = true;
					gridSnapKey = true;
					break;
				case 32: //shoot && levelMove (space)
					//SG.game.keyFire = true;
					levelMovingKey = true;
					break;
				case 79: //o - for debugging
				case 80: //p - for debugging
					console.log("tileset", TS);
					console.log("draw tileset", drawTS);
					console.log("scenegraph", SG);
					console.log("draw scenegraph", drawSG);
					console.log("camera", camera);
					console.log("game info", GameInfo);
					break;
			}
		};
		
		window.onkeyup = function (e) {
			var code = e.keyCode ? e.keyCode : e.which;
			switch(code){
				/*case 37: //left
				case 65: //left
					SG.game.keyLeft = false;
					break;
				case 38: //up
				case 87: //up
					SG.game.keyUp = false;
					break;
				case 39: //right
				case 68: //right
					SG.game.keyRight = false;
					break;
				case 40: //down
				case 83: //down
					//break;
				case 13: //shoot
				case 17: //shoot
					SG.game.keyFire = false;
					break;*/
				case 16: //shoot && gridSnap
					//SG.game.keyFire = false;
					gridSnapKey = false;
					break;
				case 32: //shoot && levelMove (space)
					//SG.game.keyFire = false;
					levelMovingKey = false;
					break;
			}
		};
		
		$(document).on("keyup","#gameName",function(){
			GameInfo.name = $("#gameName").val();
			$("#gameNameDisplay").html(GameInfo.name);
			invalidate();
		});
		
		switchMode(0);
	};
	
	var startGame = function(){
		SG.game.play = true;
		play = true;
		
		R.start();
		drawR.stop();
		
		switchLayer(layer);
		
		$("#toolButtonPlay").addClass("playing");
		$("#toolButtonPlay").attr("tooltip", t("edit.tool.stop"));
		$("#toolButtonSave").fadeOut();
		$("#toolButtonUndo").fadeOut();
		$("#toolButtonRedo").fadeOut();
		$("#stage_grid").fadeOut();
		$("#stage_helper").fadeOut();
		$("#stage_cursor").fadeOut();
		$("#editSettingsBox").fadeOut();
		$("#editToolBox").fadeOut();
		
	};
	
	var stopGame = function(){
	
		SG.game.play = false;
		play = false;
		
		R.stop();
		drawR.start();
		
		switchLayer(layer);
		
		$("#toolButtonPlay").removeClass("playing");
		$("#toolButtonPlay").attr("tooltip", t("edit.tool.play"));
		$("#toolButtonSave").fadeIn();
		$("#toolButtonUndo").fadeIn();
		$("#toolButtonRedo").fadeIn();
		$("#stage_grid").fadeIn();
		$("#stage_helper").fadeIn();
		$("#stage_cursor").fadeIn();
		$("#editSettingsBox").fadeIn();
		$("#editToolBox").fadeIn();
		$("#leftInfoText").html("");
		$("#rightInfoText").html("");
	};
	
	var undoRedo = function(){
		var state = JSON.parse(sgStates[sgStatesPosition]);
		
		console.log("undo/redo", sgStatesPosition, sgStates);
		
		if(state.SG && state.GameInfo){
			SG = state.SG;
			R.setScenegraph(SG);
			GameInfo = state.GameInfo;
			
			SG.game._update = SGupdate;
			SG.bgImg._render = bgImgRender;
		}
		
		
		invalidate();
		checkCamera();
	}
	
	var stringify = function(obj){
		return JSON.stringify({SG:SG,GameInfo:GameInfo}, function censor(key, value) {
			switch(key){
				case "_behavior":
				case "_relations":
				case "_collisions":
				case "_imgWidth":
				case "_imgHeight":
				case "_width":
				case "_height":
				case "_initialized":
				case "_init":
				case "positionX":
				case "positionY":
				case "accelerationX":
				case "accelerationY":
				case "velocityX":
				case "velocityY":
				case "vX":
				case "vY":
				case "aX":
				case "aY":
				case "_frame":
				case "_startFrame":
				case "_previousFrame":
					return undefined;
			}
			
			return value;
		});
	};
	
	var invalidate = function(doNotSave){
		
		if(!doNotSave){
		
			var state = stringify({SG:SG,GameInfo:GameInfo});
			
			if(sgStatesPosition != sgStates.length-1){
				modified = true;
				$("#toolButtonSave").addClass("unsaved");
				if(saveSuccessTO) clearTimeout(saveSuccessTO);
				$("#saveSuccessMessage").hide();
			}
			
			if (state != sgStates[sgStatesPosition]){
			
				modified = true;
				$("#toolButtonSave").addClass("unsaved");
				
				if(saveSuccessTO) clearTimeout(saveSuccessTO);
				$("#saveSuccessMessage").hide();
			
				GameInfo.modifiedDate = new Date().getTime();
				
				state = stringify({SG:SG,GameInfo:GameInfo});
			
				if(sgStatesPosition != sgStates.length -1){
					sgStates = sgStates.slice(0,sgStatesPosition+1);
				} else if(sgStates.length > 20){
					sgStates.shift();
					sgStatesPosition--;
				}
				
				sgStates.push(state);
				sgStatesPosition = sgStates.length-1;
				
				TOOLS.Storage.set(TOOLS.getUrlParam("gameId"),sgStates[sgStatesPosition]);
				
				
			}
		
		}
		R.drawFrame();
		
		$("#toolButtonUndo").addClass("inactive");
		$("#toolButtonRedo").addClass("inactive");
		if(sgStatesPosition > 0) $("#toolButtonUndo").removeClass("inactive");
		if(sgStatesPosition < sgStates.length - 1) $("#toolButtonRedo").removeClass("inactive");
	};
	
	var mouseToGrid = function(x, y){
		var nX = Math.floor((x+camera.x) / 16);
		var nY = Math.floor((y+camera.y) / 16);
		//if(nX < 0) nX = 0;
		//if(nY < 0) nY = 0;
		//if(nX >= 40) nX = 39;
		//if(nY >= 30) nY = 29;
		return {x: nX, y: nY};
	};
	
	var newLevelSize = {
		minX: 0,
		maxX: 40,
		minY: 0,
		maxY: 30,
	};
	var levelSize = SG.game._levelSize;
	
	var initPlayfieldSizeHandlers = function(){
		levelSize = SG.game._levelSize;
		$("#playfieldSizeChangeTop").keyup(function(){
			updateLevelSizeDisplay();
			drawR.drawFrame();
		});
		$("#playfieldSizeChangeBottom").keyup(function(){
			updateLevelSizeDisplay();
			drawR.drawFrame();
		});
		$("#playfieldSizeChangeLeft").keyup(function(){
			updateLevelSizeDisplay();
			drawR.drawFrame();
		});
		$("#playfieldSizeChangeRight").keyup(function(){
			updateLevelSizeDisplay();
			drawR.drawFrame();
		});
		
		$("#playfieldSizeChangeTop").on("input",function(){
			updateLevelSizeDisplay();
			drawR.drawFrame();
		});
		$("#playfieldSizeChangeBottom").on("input",function(){
			updateLevelSizeDisplay();
			drawR.drawFrame();
		});
		$("#playfieldSizeChangeLeft").on("input",function(){
			updateLevelSizeDisplay();
			drawR.drawFrame();
		});
		$("#playfieldSizeChangeRight").on("input",function(){
			updateLevelSizeDisplay();
			drawR.drawFrame();
		});
		
		
		$("#playfieldSizeChangeTop").change(function(){
			updateAndCheckLevelSizeTop();
			drawR.drawFrame();
		});
		$("#playfieldSizeChangeBottom").change(function(){
			updateAndCheckLevelSizeBottom();
			drawR.drawFrame();
		});
		$("#playfieldSizeChangeLeft").change(function(){
			updateAndCheckLevelSizeLeft();
			drawR.drawFrame();
		});
		$("#playfieldSizeChangeRight").change(function(){
			updateAndCheckLevelSizeRight();
			drawR.drawFrame();
		});
		
		
		$("#playfieldSizeChangeApply").click(function(){
			if(updateLevelSizeDisplay()){
				levelSize.minX = newLevelSize.minX;
				levelSize.maxX = newLevelSize.maxX;
				levelSize.minY = newLevelSize.minY;
				levelSize.maxY = newLevelSize.maxY;
				$("#playfieldSizeChangeTop").val(0);
				$("#playfieldSizeChangeBottom").val(0);
				$("#playfieldSizeChangeLeft").val(0);
				$("#playfieldSizeChangeRight").val(0);
				invalidate();
				checkCamera();
				R.drawFrame();
			}
			updateLevelSizeDisplay();
			drawR.drawFrame();
		});
		
		updateLevelSizeDisplay();
	};
	

	
	var updateAndCheckLevelSizeTop = function(){
		updateLevelSizeDisplay();
		var newSizeY = newLevelSize.maxY - newLevelSize.minY;
		var top = $("#playfieldSizeChangeTop").val() - 0;
		if(typeof top != "number" || top != top) top = 0;
		if(newSizeY < 30){
			var diff = 30 - newSizeY;
			console.log("diff", diff);
			$("#playfieldSizeChangeTop").val((top+diff)-0);
		} else if(newSizeY > 300){
			var diff = 300 - newSizeY;
			$("#playfieldSizeChangeTop").val((top+diff)-0);
		}
		updateLevelSizeDisplay();
	};
	
	var updateAndCheckLevelSizeBottom = function(){
		updateLevelSizeDisplay();
		var newSizeY = newLevelSize.maxY - newLevelSize.minY;
		var bottom = $("#playfieldSizeChangeBottom").val() - 0;
		if(typeof bottom != "number" || bottom != bottom) bottom = 0;
		if(newSizeY < 30){
			var diff = 30 - newSizeY;
			$("#playfieldSizeChangeBottom").val((bottom+diff)-0);
		} else if(newSizeY > 300){
			var diff = 300 - newSizeY;
			$("#playfieldSizeChangeBottom").val((bottom+diff)-0);
		}
		updateLevelSizeDisplay();
	};
	
	var updateAndCheckLevelSizeLeft = function(){
		updateLevelSizeDisplay();
		var newSizeX = newLevelSize.maxX - newLevelSize.minX;
		var left = $("#playfieldSizeChangeLeft").val() - 0;
		if(typeof left != "number" || left != left) left = 0;
		if(newSizeX < 40){
			var diff = 40 - newSizeX;
			$("#playfieldSizeChangeLeft").val((left+diff)-0);
		} else if(newSizeX > 400){
			var diff = 400 - newSizeX;
			$("#playfieldSizeChangeLeft").val((left+diff)-0);
		}
		updateLevelSizeDisplay();
	};
	var updateAndCheckLevelSizeRight = function(){
		updateLevelSizeDisplay();
		var newSizeX = newLevelSize.maxX - newLevelSize.minX;
		var right = $("#playfieldSizeChangeRight").val() - 0;
		if(typeof right != "number" || right != right) right = 0;
		if(newSizeX < 40){
			var diff = 40 - newSizeX;
			$("#playfieldSizeChangeRight").val((right+diff)-0);
		} else if(newSizeX > 400){
			var diff = 400 - newSizeX;
			$("#playfieldSizeChangeRight").val((right+diff)-0);
		}
		updateLevelSizeDisplay();
	};
	
	var updateLevelSizeDisplay = function(){
		var sizeX = levelSize.maxX - levelSize.minX;
		var sizeY = levelSize.maxY - levelSize.minY;
		$("#currentPlayfieldSize").html(sizeX + " x " + sizeY);
		
		var left = $("#playfieldSizeChangeLeft").val() - 0;
		if(typeof left != "number" || left != left) left = 0;
		
		var right = $("#playfieldSizeChangeRight").val() - 0;
		if(typeof right != "number" || right != right) right = 0;
		
		var top = $("#playfieldSizeChangeTop").val() - 0;
		if(typeof top != "number" || top != top) top = 0;
		
		var bottom = $("#playfieldSizeChangeBottom").val() - 0;
		if(typeof bottom != "number" || bottom != bottom) bottom = 0;
		
		drawSG.minimap.cutLeft = left;
		drawSG.minimap.cutRight = right;
		drawSG.minimap.cutTop = top;
		drawSG.minimap.cutBottom = bottom;
		
		if(left != 0 || right != 0 || top != 0 || bottom != 0){
			newLevelSize.minX = levelSize.minX - left;
			newLevelSize.maxX = levelSize.maxX + right;
			newLevelSize.minY = levelSize.minY - top;
			newLevelSize.maxY = levelSize.maxY + bottom;
			var newSizeX = newLevelSize.maxX - newLevelSize.minX;
			var newSizeY = newLevelSize.maxY - newLevelSize.minY;
			$("#newPlayfieldSize").html(newSizeX + " x " + newSizeY);
			
			$("#newPlayfieldSizeContainer").show();
			
			var valid = (newSizeX >= 40 && newSizeY >= 30 && newSizeX <= 400 && newSizeY <= 300);
			
			if(valid){
				$("#playfieldSizeChangeApply").show();
			} else {
				$("#playfieldSizeChangeApply").hide();
			}
			
			if(top > 0){
				$("#playfieldSizeChangeTopInc").show();
				$("#playfieldSizeChangeTopDec").hide();
			} else if(top < 0){
				$("#playfieldSizeChangeTopInc").hide();
				$("#playfieldSizeChangeTopDec").show();
			} else {
				$("#playfieldSizeChangeTopInc").hide();
				$("#playfieldSizeChangeTopDec").hide();
			}
			if(bottom > 0){
				$("#playfieldSizeChangeBottomInc").show();
				$("#playfieldSizeChangeBottomDec").hide();
			} else if(bottom < 0){
				$("#playfieldSizeChangeBottomInc").hide();
				$("#playfieldSizeChangeBottomDec").show();
			} else {
				$("#playfieldSizeChangeBottomInc").hide();
				$("#playfieldSizeChangeBottomDec").hide();
			}
			if(left > 0){
				$("#playfieldSizeChangeLeftInc").show();
				$("#playfieldSizeChangeLeftDec").hide();
			} else if(left < 0){
				$("#playfieldSizeChangeLeftInc").hide();
				$("#playfieldSizeChangeLeftDec").show();
			} else {
				$("#playfieldSizeChangeLeftInc").hide();
				$("#playfieldSizeChangeLeftDec").hide();
			}
			if(right > 0){
				$("#playfieldSizeChangeRightInc").show();
				$("#playfieldSizeChangeRightDec").hide();
			} else if(right < 0){
				$("#playfieldSizeChangeRightInc").hide();
				$("#playfieldSizeChangeRightDec").show();
			} else {
				$("#playfieldSizeChangeRightInc").hide();
				$("#playfieldSizeChangeRightDec").hide();
			}
			
			return valid;
			
		} else {
			$("#newPlayfieldSizeContainer").hide();
			$("#playfieldSizeChangeApply").hide();
			$(".playfieldArrow").hide();
			
			return false;
		}
		
	};
	
	
	var renderMinimap = function(self, ctx){
		
		if(levelMoving || 
				(mode == 3 &&
				(self.cutLeft != 0 || 
				self.cutRight != 0 ||
				self.cutTop != 0 ||
				self.cutBottom != 0))){
			var w = SG.game._levelSize.maxX - SG.game._levelSize.minX;
			var h = SG.game._levelSize.maxY - SG.game._levelSize.minY;
			
			var x = 640 - w - 11;
			var y = 11;
			
			var cX = - SG.game._levelSize.minX + ~~(camera.x / 16);
			var cY = - SG.game._levelSize.minY + ~~(camera.y / 16);
			
			//Draw bg
			ctx.beginPath();
			ctx.rect(x-11, y-11, w+22, h+22);
			ctx.fillStyle = "rgba(255,255,255,0.7)";
			ctx.fill();
			
			//Draw border
			ctx.beginPath();
			ctx.rect(x-1, y-1, w+2, h+2);
			ctx.fillStyle = "rgba(0,0,0,0.7)";
			ctx.fill();
			ctx.lineWidth = 1;
			ctx.strokeStyle = "rgba(0,0,0,0.8)";
			ctx.stroke();
			
			//Draw level
			for(var i in SG.game.bg){
				if(SG.game.bg[i]){
					var split = i.split("x");
					var lX = - SG.game._levelSize.minX + (split[0]-0);
					var lY = - SG.game._levelSize.minY + (split[1]-0);
					
					if(lX < 0 || lX >= w || lY < 0 || lY >= h) continue;
					
					ctx.beginPath();
					ctx.rect(x+lX, y+lY, 1, 1);
					ctx.fillStyle = "rgba(128,128,128,0.7)";
					ctx.fill();
				}
			}
			for(var i in SG.game.level){
				if(SG.game.level[i]){
					var split = i.split("x");
					var lX = - SG.game._levelSize.minX + (split[0]-0);
					var lY = - SG.game._levelSize.minY + (split[1]-0);
					
					if(lX < 0 || lX >= w || lY < 0 || lY >= h) continue;
					
					ctx.beginPath();
					ctx.rect(x+lX, y+lY, 1, 1);
					ctx.fillStyle = "rgba(255,255,255,1)";
					ctx.fill();
				}
			}
			for(var i in SG.game.fg){
				if(SG.game.fg[i]){
					var split = i.split("x");
					var lX = - SG.game._levelSize.minX + (split[0]-0);
					var lY = - SG.game._levelSize.minY + (split[1]-0);
					
					if(lX < 0 || lX >= w || lY < 0 || lY >= h) continue;
					
					ctx.beginPath();
					ctx.rect(x+lX, y+lY, 1, 1);
					ctx.fillStyle = "rgba(192,192,192,0.8)";
					ctx.fill();
				}
			}
			
			//Draw cutoff
			if(self.cutLeft < 0){
				ctx.beginPath();
				ctx.rect(x, y, -self.cutLeft, h);
				ctx.fillStyle = "rgba(255,0,0,0.6)";
				ctx.fill();
			} else if(self.cutLeft > 0){
				ctx.beginPath();
				ctx.rect(x-2, y-1, 1, h+2);
				ctx.fillStyle = "rgba(0,192,0,0.8)";
				ctx.fill();
				ctx.beginPath();
				ctx.rect(x-3, y-1, 1, h+2);
				ctx.fillStyle = "rgba(0,192,0,0.6)";
				ctx.fill();
				ctx.beginPath();
				ctx.rect(x-4, y-1, 1, h+2);
				ctx.fillStyle = "rgba(0,192,0,0.4)";
				ctx.fill();
				ctx.beginPath();
				ctx.rect(x-5, y-1, 1, h+2);
				ctx.fillStyle = "rgba(0,192,0,0.2)";
				ctx.fill();
			}
			if(self.cutRight < 0){
				ctx.beginPath();
				ctx.rect(x+w+self.cutRight, y, -self.cutRight, h);
				ctx.fillStyle = "rgba(255,0,0,0.6)";
				ctx.fill();
			} else if(self.cutRight > 0){
				ctx.beginPath();
				ctx.rect(x+w+2, y-1, 1, h+2);
				ctx.fillStyle = "rgba(0,192,0,0.8)";
				ctx.fill();
				ctx.beginPath();
				ctx.rect(x+w+3, y-1, 1, h+2);
				ctx.fillStyle = "rgba(0,192,0,0.6)";
				ctx.fill();
				ctx.beginPath();
				ctx.rect(x+w+4, y-1, 1, h+2);
				ctx.fillStyle = "rgba(0,192,0,0.4)";
				ctx.fill();
				ctx.beginPath();
				ctx.rect(x+w+5, y-1, 1, h+2);
				ctx.fillStyle = "rgba(0,192,0,0.2)";
				ctx.fill();
			}
			
			if(self.cutTop < 0){
				ctx.beginPath();
				ctx.rect(x, y, w, -self.cutTop);
				ctx.fillStyle = "rgba(255,0,0,0.6)";
				ctx.fill();
			} else if(self.cutTop > 0){
				ctx.beginPath();
				ctx.rect(x-1, y-2, w+2, 1);
				ctx.fillStyle = "rgba(0,192,0,0.8)";
				ctx.fill();
				ctx.beginPath();
				ctx.rect(x-1, y-3, w+2, 1);
				ctx.fillStyle = "rgba(0,192,0,0.6)";
				ctx.fill();
				ctx.beginPath();
				ctx.rect(x-1, y-4, w+2, 1);
				ctx.fillStyle = "rgba(0,192,0,0.4)";
				ctx.fill();
				ctx.beginPath();
				ctx.rect(x-1, y-5, w+2, 1);
				ctx.fillStyle = "rgba(0,192,0,0.2)";
				ctx.fill();
			}
			if(self.cutBottom < 0){
				ctx.beginPath();
				ctx.rect(x, y+h+self.cutBottom, w, -self.cutBottom);
				ctx.fillStyle = "rgba(255,0,0,0.6)";
				ctx.fill();
			} else if(self.cutBottom > 0){
				ctx.beginPath();
				ctx.rect(x-1, y+h+2, w+2, 1);
				ctx.fillStyle = "rgba(0,192,0,0.8)";
				ctx.fill();
				ctx.beginPath();
				ctx.rect(x-1, y+h+3, w+2, 1);
				ctx.fillStyle = "rgba(0,192,0,0.6)";
				ctx.fill();
				ctx.beginPath();
				ctx.rect(x-1, y+h+4, w+2, 1);
				ctx.fillStyle = "rgba(0,192,0,0.4)";
				ctx.fill();
				ctx.beginPath();
				ctx.rect(x-1, y+h+5, w+2, 1);
				ctx.fillStyle = "rgba(0,192,0,0.2)";
				ctx.fill();
			}
			
			//Draw camera
			ctx.beginPath();
			ctx.rect(x+cX, y+cY, 40, 30);
			ctx.fillStyle = "rgba(255,255,255,0.3)";
			ctx.fill();
			ctx.lineWidth = 1;
			ctx.strokeStyle = "rgba(255,255,0,0.8)";
			ctx.stroke();
		}
		
	};
	
	
});
