var initializeBehaviors = function(self, renderer){
	for(var i = 0; i < self.entity.length; i++){
		if(self.entity[i]){
			if(!self.entity[i]._initialized || !self.entity[i]._behavior){
				if(!self.entity[i].behavior){
					var img = renderer.getImage(self.entity[i]._img, self.entity[i].animation||0);
					if(img && img.raw && img.raw.behavior){
						self.entity[i].behavior = img.raw.behavior
					}
				}
				self.entity[i]._behavior = copyObject(PREDEFINED_BEHAVIORS[self.entity[i].behavior]);
				console.error(self.entity[i]._behavior);
			}
		}
	}
	
	self.entity.sort(function(a,b){
		if(!a._behavior || typeof a._behavior.zIndex != "number") return 0;
		if(!b._behavior || typeof b._behavior.zIndex != "number") return 0;
		return a._behavior.zIndex - b._behavior.zIndex;
	})
};

var SGupdate = function(self, dT, time, renderer){
	initializeBehaviors(self, renderer);
	if(self.play && !self.shouldStop){
		if(!self.oldState){
			self.oldState = JSON.stringify(self.entity, function censor(key, value) {
				if (key == "_behavior" || key == "_relations" || key == "_collisions") {
					return undefined;
				}
				return value;
			});
			self._save.entity = self.oldState;
			self._save.score = 0;
		}
		if(!self.oldCamera) self.oldCamera = {x: camera.x, y: camera.y};
		
		for(var i = 0; i < self.entity.length; i++){
			if(self.entity[i]){
				/*if(!self.entity[i]._initialized || !self.entity[i]._behavior){
					if(!self.entity[i].behavior){
						var img = renderer.getImage(self.entity[i]._img, self.entity[i].animation||0);
						if(img && img.raw && img.raw.behavior){
							self.entity[i].behavior = img.raw.behavior
						}
					}
					self.entity[i]._behavior = copyObject(PREDEFINED_BEHAVIORS[self.entity[i].behavior]);
				}*/
				
				setEntityMovement(self.entity[i], dT);
			}
		}
		
		var camXSum = 0;
		var camYSum = 0;
		var camSum = 0;
		
		
		for(var k in self._keyChanges){
			var change = self._keyChanges[k];
			if(change.down){
				self._keyDowns[change.code] = true;
				self._keyPressed[change.code] = true;
			} else {
				self._keyUps[change.code] = true;
				self._keyPressed[change.code] = false;
			}
		}
		var length = self.entity.length;
		for(var i = 0; i < length; i++){
			if(self.entity[i]){
				var a = self.entity[i];
				if(i == 0){
					a._relations = [];
					a._collisions = [];
				}
							
				for(var j = i+1; j < length; j++){
				
					if(self.entity[j]){
						var b = self.entity[j];
						if(i == 0){
							b._relations = [];
							b._collisions = [];
						}
						
						if(!a || !b || !a._initialized || !b._initialized || !a._width || !b._width || !a._height || !b._height || !a._x || !b._x || !a._y || !b._y) continue;

						setEntityCollision(a, b);
						setEntityRelation(a, b);
					}
				}
			
				resolveCollisions(self.entity[i], self.level);
				resolveBehavior(self.entity[i], self, dT, time);
				
				if(self.entity[i] && self.entity[i]._initialized) self.entity[i]._hide = false;
				if(self.entity[i]) self.entity[i]._initialized = true;
				
				if(a._behavior && a._behavior.attachCamera){
					camXSum += (a._x + a._width/2.);
					camYSum += (a._y + a._height/2.);
					camSum++;
				}
			}
		}
		
		
		self._keyDowns = {};
		self._keyUps = {};
		self._keyChanges = [];
		
		if(camSum != 0){
			camera.x = ~~((camXSum/camSum)+0.5) - 320;
			camera.y = ~~((camYSum/camSum)+0.5) - 240;
		}
		checkCamera();
		
		if(SG.game._onUpdate) SG.game._onUpdate(self.score, time);
		
	} else {
		if(self.shouldStop){
			// TODO display stop message
			self.shouldStop = false;
			self.play = false;
			
			R.stop();
			
			if(SG.game._overlayId){
				var seconds = ~~(time/1000);
				var minutes = ~~(seconds/60);
				var seconds = seconds%60;
				var hours = ~~(minutes/60);
				var minutes = minutes%60;
				
				var timeTxt = "";
				
				if(hours != 0){
					timeTxt += hours + ":";
					if(minutes < 10) timeTxt += "0";
					timeTxt += minutes + ":";
					if(seconds < 10) timeTxt += "0";
					timeTxt += seconds;
				} else if(minutes != 0){
					timeTxt += minutes + ":";
					if(seconds < 10) timeTxt += "0";
					timeTxt += seconds;
				} else {
					timeTxt += seconds;
				}
			
				$(SG.game._overlayId).setTemplateURL("tpl/elements/game_endOverlay.tpl.html");
				$(SG.game._overlayId).processTemplate({message: self.stopMessage, score: self.score, time: timeTxt, showEnd: SG.game._showEndButton});
				
				$("#gameOverRestart").click(function(){
					SG.game.play = true;
					$(SG.game._overlayId).hide();
					R.start();
				});
				
				$("#gameOverEnd").click(function(){
					if(SG.game._onStop){
						SG.game._onStop(self.stopMessage, self.score, time);
					}
					$(SG.game._overlayId).hide();
				});
				$(SG.game._overlayId).show();
			} else if(SG.game._onStop){
				SG.game._onStop(self.stopMessage, self.score, time);
			}
		}
		self.score = 0;
		
		self._keyDowns = {};
		self._keyUps = {};
		self._keyChanges = [];
		self._keyPressed = {};
		
		if(self.oldState){
			self.entity = JSON.parse(self.oldState);
			self.oldState = null;
		}
		if(self.oldCamera){
			camera.x = self.oldCamera.x || 0;
			camera.y = self.oldCamera.y || 0;
			self.oldCamera = null;
		}
		checkCamera();
	}
};

var TIME_CONST = 0.005;

var setEntityMovement = function(entity, dT){
	if(typeof entity.positionX == "number") entity._x = entity.positionX;
	if(typeof entity.positionY == "number") entity._y = entity.positionY;
	if(typeof entity.velocityX == "number") entity.vX = entity.velocityX;
	if(typeof entity.velocityY == "number") entity.vY = entity.velocityY;
	if(typeof entity.accelerationX == "number") entity.aX = entity.accelerationX;
	if(typeof entity.accelerationY == "number") entity.aY = entity.accelerationY;
	if(!entity.vX) entity.vX = 0;
	if(!entity.vY) entity.vY = 0;
	if(!entity.aX) entity.aX = 0;
	if(!entity.aY) entity.aY = 0;
	
	entity._oldX = entity._x;
	entity._oldY = entity._y;
	
	/*if(entity._onLeftWall){
		if(entity.vX < 0) entity.vX = 0;
		if(entity.aX < 0) entity.aX = 0;
	}
	if(entity._onRightWall){
		if(entity.vX > 0) entity.vX = 0;
		if(entity.aX > 0) entity.aX = 0;
	}
	if(entity._onCeil){
		if(entity.vY < 0) entity.vY = 0;
		if(entity.aY < 0) entity.aY = 0;
	}
	if(entity._onFloor){
		if(entity.vY > 0) entity.vY = 0;
		if(entity.aY > 0) entity.aY = 0;
	}*/
	
	entity.vX += entity.aX * dT * TIME_CONST;
	entity.vY += entity.aY * dT * TIME_CONST;
	
	entity._x += entity.vX * dT * TIME_CONST;
	entity._y += entity.vY * dT * TIME_CONST;
	
	entity.positionX = entity._x;
	entity.positionY = entity._y;
	entity.velocityX = entity.vX;
	entity.velocityY = entity.vY;
	entity.accelerationX = entity.aX;
	entity.accelerationY = entity.aY;
};

var setEntityRelation = function(a, b){
	var aX = a._x + a._width*0.5;
	var aY = a._y + a._height*0.5;
	var bX = b._x + b._width*0.5;
	var bY = b._y + b._height*0.5;
	
	var dX = (bX > aX)? bX - aX : aX - bX;
	var dY = (bY > aY)? bY - aY : aY - bY;
	
	a._relations.push({
		opponent: b,
		dX: dX,
		dY: dY
	});
	b._relations.push({
		opponent: a,
		dX: dX,
		dY: dY
	});
};

var setEntityCollision = function(a, b){
	
	var right = a._x - (b._x + b._width);
	var left = b._x - (a._x + a._width);
	var bottom = a._y - (b._y + b._height);
	var top = b._y - (a._y + a._height);
	
	if(top <= 0 && bottom <= 0 && left <= 0 && right <= 0){
		
		a._collisions.push({
			opponent: b,
			top: -bottom,
			bottom: -top,
			left: -right,
			right: -left,
		});
		
		b._collisions.push({
			opponent: a,
			top: -top,
			bottom: -bottom,
			left: -left,
			right: -right,
		});
		
	}
};

var getCollisionDirection = function(collision){
	var smallest = collision.top;
	var direction = "top";
	if(collision.bottom < smallest){
		smallest = collision.bottom;
		direction = "bottom"
	}
	if(collision.left < smallest){
		smallest = collision.left;
		direction = "left"
	}
	if(collision.right < smallest){
		direction = "right"
	}
	return direction;
};

var resolveCollisions = function(entity, level){
	if(!entity || !entity._initialized || !entity._width || !entity._height || !entity._x || !entity._y) return;
	
	if(entity._behavior && entity._behavior.colliding){
		resolveEntityCollisions(entity);
		resolveWorldCollisions(entity, level);
	}
};

var resolveEntityCollisions = function(entity){
	for(var i in entity._collisions){
		var c = entity._collisions[i];
		if(c.opponent._behavior.rigid){
			var dir = getCollisionDirection(c);
			switch(dir){
				case "left":
					if(!entity._onRightWall) entity._x += c[dir];
					entity.velocityX = 0;
					entity.positionX = entity._x;
					break;
				case "right":
					if(!entity._onLeftWall) entity._x -= c[dir];
					entity.velocityX = 0;
					entity.positionX = entity._x;
					break;
				case "top":
					if(!entity._onFloor) entity._y += c[dir];
					entity.velocityY = 0;
					entity.positionY = entity._y;
					break;
				case "bottom":
					if(!entity._onCeil) entity._y -= c[dir];
					entity.velocityY = 0;
					entity.positionY = entity._y;
					break;
			}
		}
	}
};

var resolveWorldCollisions = function(entity, level){
	var colliding = false;
	var onFloor = false;
	var onCeil = false;
	var onRightWall = false;
	var onLeftWall = false;
	var minX;
	var minY;
	var maxX;
	var maxY;
	
	var physX = entity._x + 1;
	var physY = entity._y + 1;
	var physW = entity._width - 2;
	var physH = entity._height - 2;
	
	var minSize = (physW < physH)? physW : physH;
	var dX = entity._x - entity._oldX;
	var dY = entity._y - entity._oldY;
	
	var dist = dX*dX + dY*dY;
	//var steps = ~~(dist / ((minSize/2)*(minSize/2)));
	var steps = ~~Math.sqrt(dist);
	if(steps <= 0) steps = 1;
	
	var sX = dX / steps;
	var sY = dY / steps;
	
	var cX = entity._oldX+1;
	var cY = entity._oldY+1;
	
	for(var s = 0; s < steps; s++){
	
		if(!onRightWall && !onLeftWall){
			cX += sX;
		} else {
			cX = physX;
		}
		
		minX = ~~((cX)/16);
		minY = ~~((cY)/16);
		maxX = Math.ceil((cX+physW)/16)-1;
		maxY = Math.ceil((cY+physH)/16)-1;
		
		if(cX%16 == 0){
			for(var i = minY; i <= maxY; i++){
				if(level[(minX-1) + "x" + i]){
					onLeftWall = true;
					entity.velocityX = 0;
					physX = cX;
					break;
				}
			}
		}
		if((cX+physW)%16 == 0){
			for(var i = minY; i <= maxY; i++){
				if(level[(maxX+1) + "x" + i]){
					onRightWall = true;
					entity.velocityX = 0;
					physX = cX;
					break;
				}
			}
		}
		
		if(!onRightWall && !onLeftWall){
			for(var i = minY; i <= maxY; i++){
				if(dX > 0){ 
					if(level[maxX + "x" + i]){
						physX = maxX*16 - physW;
						cX = physX;
						entity.velocityX = 0;
						onRightWall = true;
						break;
					}
				} else {
					if(level[minX + "x" + i]){
						physX = (minX+1)*16;
						cX = physX;
						entity.velocityX = 0;
						onLeftWall = true;
						break;
					}
				}
			}
		}
		
		if(!onFloor && !onCeil){ 
			cY += sY;
		} else {
			cY = physY;
		}
		
		minX = ~~((cX)/16);
		minY = ~~((cY)/16);
		maxX = Math.ceil((cX+physW)/16)-1;
		maxY = Math.ceil((cY+physH)/16)-1;
		
		if(cY%16 == 0){
			for(var i = minX; i <= maxX; i++){
				if(level[i + "x" + (minY-1)]){
					onCeil = true;
					entity.velocityY = 0;
					physY = cY;
					break;
				}
			}
		}
		if((cY+physH)%16 == 0){
			for(var i = minX; i <= maxX; i++){
				if(level[i + "x" + (maxY+1)]){
					onFloor = true;
					entity.velocityY = 0;
					physY = cY;
					break;
				}
			}
		}
		
		if(!onFloor && !onCeil){
			for(var i = minX; i <= maxX; i++){
				if(dY > 0){ 
					if(level[i + "x" + maxY]){
						physY = maxY*16 - physH;
						cY = physY;
						entity.velocityY = 0;
						onFloor = true;
						break;
					}
				} else{
					if(level[i + "x" + minY]){
						physY = (minY+1)*16;
						cY = physY;
						entity.velocityY = 0;
						onCeil = true;
						break;
					}
				}
			}
		}
		
	}
	
	entity._x = physX - 1;
	entity.positionX = entity._x;
	entity._y = physY - 1;
	entity.positionY = entity._y;
	

	
	/*minX = ~~((physX)/16+0.5);
	minY = ~~((physY)/16+0.5);
	maxX = ~~((physX+physW)/16+0.5);
	maxY = ~~((physY+physH)/16+0.5);*/
	minX = ~~((physX)/16);
	minY = ~~((physY)/16);
	maxX = Math.ceil((physX+physW)/16)-1;
	maxY = Math.ceil((physY+physH)/16)-1;
	
	entity._onLeftWall = onLeftWall;
	entity._onRightWall = onRightWall;
	entity._onCeil = onCeil;
	entity._onFloor = onFloor;
	entity._colliding = onLeftWall || onRightWall || onCeil || onFloor;
		
	entity._abyss = {};	
	
	if(entity._onFloor){
		console.log(maxY);
	
		if(!level[minX + "x" + (maxY+1)]) entity._abyss.bottomLeft = true;
		if(!level[maxX + "x" + (maxY+1)]) entity._abyss.bottomRight = true;
	}
	if(entity._onCeil){
		if(!level[minX + "x" + (minY-1)]) entity._abyss.topLeft = true;
		if(!level[maxX + "x" + (minY-1)]) entity._abyss.topRight = true;
	}
	if(entity._onLeftWall){
		if(!level[(minX-1) + "x" + minY]) entity._abyss.leftTop = true;
		if(!level[(minX-1) + "x" + maxY]) entity._abyss.leftBottom = true;
	}
	if(entity._onRightWall){
		if(!level[(maxX+1) + "x" + minY]) entity._abyss.rightTop = true;
		if(!level[(maxX+1) + "x" + maxY]) entity._abyss.rightBottom = true;
	}
	
	if(entity._abyss.bottomLeft || entity._abyss.bottomRight) entity._abyss.bottom = true;
	if(entity._abyss.topLeft || entity._abyss.topRight) entity._abyss.top = true;
	if(entity._abyss.leftTop || entity._abyss.leftBottom) entity._abyss.left = true;
	if(entity._abyss.rightTop || entity._abyss.rightBottom) entity._abyss.right = true;
	
	if(entity._abyss.bottom || entity._abyss.top) entity._abyss.vertical = true;
	if(entity._abyss.left || entity._abyss.right) entity._abyss.horizontal = true;
	
	if(entity._abyss.vertical || entity._abyss.horizontal) entity._abyss.any = true;
};

var checkEvents = function(pattern, entity, gameSG, dT, time){
	for(var i in pattern.events){
		var event = pattern.events[i];
		if(EVENTS[event.type]){
			if(!EVENTS[event.type](event, entity, gameSG, dT, time)) return false;
		} else {
			console.error("event '" + event.type + "' is not defined");
			return false;
		}
	}
	return true;
};

var resolveBehavior = function(entity, gameSG, dT, time){
	//entity.accelerationY = 9.81;
	
	if(entity._behavior){
		for(var i in entity._behavior.patterns){
		
			var pattern = entity._behavior.patterns[i];
			
			if(checkEvents(pattern, entity, gameSG, dT, time)){
				for(var j in pattern.reactions){
					var reaction = pattern.reactions[j];
					if(REACTIONS[reaction.type]){
						REACTIONS[reaction.type](reaction, entity, gameSG, dT, time);
					} else {
						console.error("reaction '" + reaction.type + "' is not defined");
					}
				}
			}
		
		}
	}
};

var bgImgRender = function(self, ctx, renderer){
	if(self.img){
		var img = renderer.getImage(self.img, 0)
		if(img && img.img){
			ctx.drawImage(img.img, 0, 0, 640, 480);
		}
	}
};

var onFocus = function(){
	if(!SG.game.play){
		R.setPaused(false);
	}
	
	if(drawR) drawR.setPaused(false);
};

var onBlur = function(){
	if(SG.game.play){
		$(SG.game._overlayId).setTemplateURL("tpl/elements/game_pauseOverlay.tpl.html");
		$(SG.game._overlayId).processTemplate();
		
		$("#gamePausedRevert").click(function(){
			$(SG.game._overlayId).hide();
			R.setPaused(false);
		});
		$(SG.game._overlayId).show();
	}
	R.setPaused(true);
	if(drawR) drawR.setPaused(true);
};

if (/*@cc_on!@*/false) { // check for Internet Explorer
    document.onfocusin = onFocus;
    document.onfocusout = onBlur;
} else {
    window.onfocus = onFocus;
    window.onblur = onBlur;
}

document.onkeydown = function(e){
	var code = e.keyCode ? e.keyCode : e.which;
	SG.game._keyChanges.push({
		code: code,
		down: true
	});
	if(SG.game.play && !R.isPaused()){
		e.stopPropagation();
		e.preventDefault();
		return true;
	}
};

document.onkeyup = function(e){
	var code = e.keyCode ? e.keyCode : e.which;
	SG.game._keyChanges.push({
		code: code,
		down: false
	});
};

var copyObject = function(object){
	return JSON.parse(JSON.stringify(object));
};

var camera = {
	x: 0,
	y: 0,
};


var TS = {
	game: {
		box: {},
		entity: {},
		backgroundImage: {},
		bullet: {
			img: {
				src: "res/entity/bullet.png",
			},
			behavior: "bullet",
		},
		bam: {
			img: {
				src: "res/entity/bam.png",
			},
			behavior: "effect",
		},
		pow: {
			img: {
				src: "res/entity/pow.png",
			},
			behavior: "effect",
		},
	},
};
	
var SG = {
	bgImg: {
		_render: bgImgRender,
	},
	game: {
		bg: {},
		level: {},
		entity: [],
		fg: {},
		_update: SGupdate,
		play: false,
		shouldStop: false,
		stopMessage: "",
		oldState: null,
		oldCamera: null,
		score: 0,
		_levelSize: {
			minX: 0,
			maxX: 40,
			minY: 0,
			maxY: 30,
		},
		_globals: {},
		_keyChanges: [],
		_keyDowns: {},
		_keyPressed: {},
		_keyUps: {},
		_save: {},
	},
};

var checkCamera = function(){
	if(camera.x < SG.game._levelSize.minX*16) camera.x = SG.game._levelSize.minX*16;
	if(camera.x+640 > SG.game._levelSize.maxX*16) camera.x = (SG.game._levelSize.maxX*16)-640;
	if(camera.y < SG.game._levelSize.minY*16) camera.y = SG.game._levelSize.minY*16;
	if(camera.y+480 > SG.game._levelSize.maxY*16) camera.y = (SG.game._levelSize.maxY*16)-480;
};