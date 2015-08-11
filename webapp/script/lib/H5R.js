window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
			};
})();

var H5R = function(){

	var stages = {};
	var renderTO;
	var timer;
	var timePassed = 0;
	var pauseTimer = 0;
	var running = false;
	var tileset = {}; //raw tileset reference
	var images = {}; //images loaded from tileset
	var SG = {}; //scenegraph
	var paused = false;
	
	var init = function(){
		restart();
		
		MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		if(MutationObserver){
			var observer = new MutationObserver(observe);
			observer.observe(document, {
				subtree: true,
				attributes: true,
				childList: true,
			});
		}
	};
	
	var observe = function(mutations, observer){
		console.log("change noticed",mutations);
		updateStages();
	};
	
	var updateStages = function(){
		for(var i in stages){
			stages[i].checkDOMElement();
		}
	};
	
	var stop = function(){
		running = false;
		paused = false;
		timer = new Date().getTime();
		timePassed = 0;
		pauseTimer = 0;
		if(renderTO){
			clearTimeout(renderTO);
			renderTO = null;
		}
	};
	
	var drawFrame = function(){
		for(var i in stages){
			updateSG(SG, 0, timePassed-pauseTimer);
			stages[i].render(SG, 0, timePassed-pauseTimer, {getImage: getImage});
		}
	};
	
	
	var restart = function(){
		stop();
		running = true;
		paused = false;
		timer = new Date().getTime();
		timePassed = 0;
		pauseTimer = 0;
		renderStages();
	};
	
	var renderStages = function(){
		if(running) requestAnimFrame(renderStages);
		
		var newTime = new Date().getTime();
		var timeDiff = newTime - timer;
		timer = newTime;
		timePassed += timeDiff;
		
		if(!paused){
			//max time difference between two frames 500ms, if more game will be paused for the rest of the time
			if(timeDiff > 500){
				pauseTimer += timeDiff - 500;
				timeDiff = 500;
			}
		
			
			updateSG(SG, timeDiff, timePassed-pauseTimer);
			
			for(var i in stages){
				stages[i].render(SG, timeDiff, timePassed-pauseTimer, {getImage: getImage});
			}
		} else {
			pauseTimer += timeDiff;
		}
		//if(running) renderTO = setTimeout(renderStages, 1);
	};
	
	var updateSG = function(sgObj, timeDiff, timePassed){
		if(sgObj instanceof Object){
			
			var animation = sgObj._animation || 0;
			var img = getImage(sgObj._img, animation);
			
			sgObj._fps = (img)? img.fps : 0;
			
			if(sgObj._update) sgObj._update(sgObj, timeDiff, timePassed, {getImage: getImage});
			
			if(img && img.fps && !sgObj._freeze){
				if(!sgObj._startFrame) sgObj._startFrame = sgObj._frame || 0;
				sgObj._previousFrame = sgObj._frame || 0;
				sgObj._frame = Math.round(timePassed * (img.fps/1000)) + sgObj._startFrame;
			}
		}
		if(sgObj instanceof Object || sgObj instanceof Array){
			for(var i in sgObj){
				if(!(typeof i == "string" && i.charAt(0) == "_") && (sgObj[i] instanceof Object || sgObj[i] instanceof Array)){
					updateSG(sgObj[i], timeDiff, timePassed);
				}
			}
		}
	};
	
	var addStage = function(stage){
		if(!stage || !(stage instanceof H5R.Stage) || !stage.isValid()){
			console.error("The submitted stage is not a valid H5R.Stage object!");
			return {};
		} else {
			stages[stage.getId()] = stage;
			return stage;
		}
	};
	
	var getStage = function(id){
		return stages[id] || null;
	};
	
	var removeStage = function(id){
		delete stages[id];
	};
	
	var setTileset = function(ts, cb){
		if(!ts){
			console.error("The tileset object is invalid!");
		} else {
			tileset = ts;
			updateTileset(cb);
		}
	};
	
	var updateTileset = function(cb){
		cb = cb || function(){};
		images = {};
		readTileset(tileset);
		createImages(cb);
		console.log(images);
	};
	
	var createImages = function(cb){
		var indices = [];
		for(var i in images){
			indices.push(i);
		}
		loadImage(indices, 0, 0, cb);
	};
	
	var loadImage = function(indices, i, j, cb){
		if(i < indices.length){
			if(j < images[indices[i]].length){
				if(images[indices[i]][j].sprites <= 0) images[indices[i]][j].sprites = 1;
				var img = new Image();
				img.onload = function(){
					images[indices[i]][j].img = img;
					images[indices[i]][j].width = img.width / images[indices[i]][j].sprites;
					images[indices[i]][j].height = img.height;
					loadImage(indices, i, j+1, cb);
				};
				img.onerror = function(){
					loadImage(indices, i, j+1, cb);
				};
				img.src = images[indices[i]][j].src;
			} else {
				loadImage(indices, i+1, 0, cb);
			}
		} else {
			console.log(images);
			cb();
		}
	};
	
	var readTileset = function(tsObj, path){
		path = path || "";
		for(var i in tsObj){
			if(i.toLowerCase() == "img"){
				readImages(tsObj[i], path, tsObj);
			} else if(i.toLowerCase() == "src" && 
					(typeof tsObj[i]).toLowerCase() == "string"){
				readImages(tsObj[i], path, tsObj);
			} else {
				if(tsObj[i] instanceof Object || tsObj[i] instanceof Array){
					if(path != ""){
						readTileset(tsObj[i], path + "." + i);
					} else {
						readTileset(tsObj[i], i);
					}
				}
			}
		}
	};
	
	var readImages = function(imgObj, path, raw){
		images[path] = [];
		if(imgObj instanceof Array){
			for(var i in imgObj){
				if(imgObj[i].src){
					images[path].push({
						src: imgObj[i].src,
						sprites: imgObj[i].sprites || 1,
						fps: imgObj[i].fps || 4,
						raw: raw,
					});
				} else if((typeof imgObj[i]).toLowerCase() == "string"){
					images[path].push({
						src: imgObj[i],
						sprites: 1,
						raw: raw,
					});
				}
			}
		} else if(imgObj instanceof Object){
			if(imgObj.src){
				images[path].push({
					src: imgObj.src,
					sprites: imgObj.sprites || 1,
					fps: imgObj.fps || 4,
					raw: raw,
				});
			}
		} else {
			images[path].push({
				src: imgObj,
				sprites: 1,
				raw: raw,
			});
		}
	};
	
	var getImage = function(id, animation){
		id = id || "";
		animation = animation || 0;
		if(images[id] && images[id].length > animation){
			return images[id][animation];
		} else {
			//TODO image not found
			return null;
		}
	};
	
	var getRawImage = function(id, animation){
		id = id || "";
		animation = animation || 0;
		if(images[id] && images[id].length > animation){
			return images[id][animation];
		} else {
			//TODO image not found
			return null;
		}
	};
	
	var setScenegraph = function(scenegraph){
		if(!scenegraph){
			console.error("The scene graph object is invalid!");
		} else {
			SG = scenegraph;
		}
	};
	
	var setPaused = function(newPausedValue){
		paused = newPausedValue;
	};
	
	var isPaused = function(){
		return paused;
	};
	
	init();
	
	this.addStage		= addStage;
	this.getStage		= getStage;
	this.removeStage	= removeStage;
	this.stop			= stop;
	this.drawFrame		= drawFrame;
	this.restart		= restart;
	this.start			= restart;
	this.setTileset		= setTileset;
	this.updateTileset	= updateTileset;
	this.getImage		= getImage;
	this.updateStages	= updateStages;
	this.setScenegraph	= setScenegraph;
	this.setPaused		= setPaused;
	this.isPaused		= isPaused;
};

H5R.Stage = function(id, options){
	
	var visible = false;
	var elementId;
	var valid = false;
	var canvas;
	var offCanvas;
	var ctx;
	var offCtx;
	var params;
	var sgPart = "";
	var camera;
	
	var isValid = function(){
		return valid;
	};
	
	var render = function(SG, timeDiff, timePassed, renderer){
		if(visible){
			renderSG(SG, timeDiff, timePassed, renderer);
		}
	};
	
	var renderSG = function(SG, timeDiff, timePassed, renderer){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		offCtx.clearRect(0, 0, canvas.width, canvas.height);
		
		var x = (camera && camera.x)? camera.x : 0;
		var y = (camera && camera.y)? camera.y : 0;
		
		
		var sgRenderPart = SG;
		if(sgPart != ""){
			var splitPart = sgPart.split(".");
			for(var i in splitPart){
				if (sgRenderPart instanceof Object){
					if(sgRenderPart[splitPart[i]]){
						sgRenderPart = sgRenderPart[splitPart[i]];
					} else {
						return;
					}
				} else if(sgRenderPart instanceof Array){
					var idx = splitPart[i]-0;
					if(sgRenderPart[idx]){
						sgRenderPart = sgRenderPart[idx];
					} else {
						return;
					}
				} else {
					return;
				}
			}
		}
		
		offCtx.translate(-x, -y);
		renderSGPart(sgRenderPart, timeDiff, timePassed, renderer);
		offCtx.translate(x, y);
		
		ctx.drawImage(offCanvas, 0, 0);
	};
	
	var renderSGPart = function(sgObj, timeDiff, timePassed, renderer){
		if(sgObj){
			
			/*var scaleX = sgObj.scaleX || sgObj.scale || 1;
			if(scaleX == 0) scaleX = 1;
			var scaleY = sgObj.scaleY || sgObj.scale || 1;
			if(scaleY == 0) scaleY = 1;*/
			var x = ((sgObj._x || 0)+0.5) <<0;
			var y = ((sgObj._y || 0)+0.5) <<0;
					
			offCtx.translate(x, y);
			if(sgObj._flipX) offCtx.scale(-1, 1);
			if(sgObj._flipY) offCtx.scale(1, -1);
			//offCtx.scale(scaleX, scaleY);
			offCtx.save();
			
			if(!sgObj._hide){
				if(sgObj._img){
					
					var animation = sgObj._animation || 0;
					var img = renderer.getImage(sgObj._img, animation);
								
					if(img && img.img){
					
						/*var width = sgObj._width || -1;
						if(width < 0 || width > img.width) width = img.width;
						var height = sgObj._height || -1;
						if(height < 0 || height > img.height) height = img.height;*/
						
						var width = img.width;
						var height = img.height;
						
						sgObj._imgWidth = img.width;
						sgObj._imgHeight = img.height;
						
						var frame = sgObj._frame || 0;
						while(frame < 0) frame += img.sprites;
						if(frame >= img.sprites) frame = frame % img.sprites;
						
						var repeatX = sgObj._repeatX || 1;
						var repeatY = sgObj._repeatY || 1;
						
						sgObj._width = sgObj._imgWidth * repeatX;
						sgObj._height = sgObj._imgHeight * repeatY;
						
						var offsetX = (sgObj._flipX)? repeatX * width : 0;
						var offsetY = (sgObj._flipY)? repeatY * height : 0;
						
						for(var i = 0; i < repeatX; i++){
							for(var j = 0; j < repeatY; j++){
								offCtx.drawImage(
									img.img, //img obj
									img.width * frame, //src x
									0, //src y
									width, //src width 
									height, //src height
									-offsetX + width*i, //dest x
									-offsetY + height*j, //dest y
									width, //dest width
									height //dest height
								);
							}
						}
					}
				
				}
				
				if(sgObj._render) sgObj._render(sgObj, offCtx, renderer);//(self, context, renderer)
			}
			
			if(!sgObj._hideChildren){
			
				for(var i in sgObj){
					if(!(typeof i == "string" && i.charAt(0) == "_") && (sgObj[i] instanceof Object || sgObj[i] instanceof Array)){
						renderSGPart(sgObj[i], timeDiff, timePassed, renderer);
					}
				}
				
			}
			
			offCtx.restore();
			//offCtx.scale(1/scaleX, 1/scaleY);
			if(sgObj._flipX) offCtx.scale(-1, 1);
			if(sgObj._flipY) offCtx.scale(1, -1);
			offCtx.translate(-x, -y);
		
		}
	}
		
	var checkDOMElement = function(){
		var elem = document.getElementById(elementId);
		if(elem && (elem.offsetWidth > 0 || elem.offsetHeight > 0) && (elem.style.opacity == "" || elem.style.opacity > 0)){
			if(!visible){
				visible = true;
				initDOMElement(elem);
			}
		} else {
			visible = false;
		}
	};
	
	var initDOMElement = function(elem){
		elem.innerHTML = "";
		canvas = document.createElement("canvas");
		offCanvas = document.createElement("canvas");
		elem.appendChild(canvas);
		console.log(elem);
		canvas.width = params.width || elem.clientWidth;
		canvas.height = params.height || elem.clientHeight;
		offCanvas.width = canvas.width;
		offCanvas.height = canvas.height;
		ctx = canvas.getContext('2d');
		offCtx = offCanvas.getContext('2d');
	};
	
	var getId = function(){
		return elementId;
	};
	
	var setScenegraphPart = function(part){
		if(!part || typeof part != "string"){
			console.error("Each H5R.Stage needs a valid id!");
		} else {
			sgPart = part;
		}
		return this;
	};
	
	var setCamera = function(customCamera){
		camera = customCamera || null;
		return this;
	};
	
	var init = function(id, options){
		if(!id || id.trim() == ""){
			console.error("Each H5R.Stage needs a valid id!");
		} else {
			valid = true;
			params = {};
			if(options){
				if(options.width) params.width = options.width;
				if(options.height) params.height = options.height;
			}
			elementId = id;
			checkDOMElement();
		}
	};
	
	var getCanvas = function(){
		return canvas;
	};
	
	init(id, options);
	
	this.render				= render;
	this.checkDOMElement	= checkDOMElement;
	this.isValid			= isValid;
	this.getId				= getId;
	this.setScenegraphPart	= setScenegraphPart;
	this.setCamera			= setCamera;
	this.getCanvas			= getCanvas;
	
};