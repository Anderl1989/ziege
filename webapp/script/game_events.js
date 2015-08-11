var EVENTS = {

	"always": function(event, entity, gameSG, dT, time){
		return true;
	},
	
	"attribute": function(event, entity, gameSG, dT, time){
		if(!this.checkPars(event, 3)) return false;
		
		if(!entity._attrs) return false;
		var attrValue = entity._attrs[event.param1];
		if(typeof attrValue == "undefined") return false;
		var operator = event.param2;
		var value = event.param3;
		
		return this.checkValue(attrValue, operator, value);
	},
	
	"global": function(event, entity, gameSG, dT, time){
		if(!this.checkPars(event, 3)) return false;
		
		if(!gameSG._globals) return false;
		var attrValue = gameSG._globals[event.param1];
		if(typeof attrValue == "undefined") return false;
		var operator = event.param2;
		var value = event.param3;
		
		return this.checkValue(attrValue, operator, value);
	},
	
	"keyPressed": function(event, entity, gameSG, dT, time){
		if(!this.checkPars(event, 1)) return false;
		if(gameSG._keyPressed[event.param1] === true) return true;
		return false;
	},
	
	"keyDown": function(event, entity, gameSG, dT, time){
		if(!this.checkPars(event, 1)) return false;
		if(gameSG._keyDowns[event.param1] === true) return true;
		return false;
	},
	
	"keyUp": function(event, entity, gameSG, dT, time){
		if(!this.checkPars(event, 1)) return false;
		if(gameSG._keyUps[event.param1] === true) return true;
		return false;
	},
	
	"animation": function(event, entity, gameSG, dT, time){
		if(!this.checkPars(event, 1)) return false;
		if(entity._animation && entity._animation == event.param1) return true;
		return false;
	},
	
	"animationRunning": function(event, entity, gameSG, dT, time){
		if(!entity._freeze) return true;
		return false;
	},
	
	"animationStopped": function(event, entity, gameSG, dT, time){
		if(entity._freeze) return true;
		return false;
	},
	
	"frame": function(event, entity, gameSG, dT, time){
		if(!this.checkPars(event, 1)) return false;
		var frame = event.param1;
		if(entity._frame >= entity._previousFrame){
			return (frame >= entity._previousFrame && frame <= entity._frame);
		} else {
			return (frame >= entity._previousFrame || frame <= entity._frame);
		}
	},
	
	"init": function(event, entity, gameSG, dT, time){
		if(entity._behavior.group == "bullet") console.log("init", entity);
		if(!entity._init){
			entity._init = true;
			return true;
		}
		return false;
	},
	
	"abyss": function(event, entity, gameSG, dT, time){
		if(!this.checkPars(event, 1)) return false;
		if(entity._abyss && entity._abyss[event.param1]) return true;
		return false;
	},
	
	"noCollision": function(event, entity, gameSG, dT, time){
		if(!this.checkPars(event, 1)) return false;
		if(event.param1 == "box"){
			return !(entity._colliding);
		} else if(event.param1 == "anyEntity"){
			return (entity._collisions.length == 0);
		} else if(event.param1 == "entity" && event.param2){
			var group = event.param2;
			for(var i in entity._collisions){
				var col = entity._collisions[i];
				if(col.opponent._behavior.group == group) return false;
			}
			return true;
		}
		return false;
	},
	
	"collision": function(event, entity, gameSG, dT, time){
		if(!this.checkPars(event, 2)) return false;
		if(event.param2 == "box"){
			switch(event.param1){
				case "left":
					return (entity._onLeftWall);
				case "right":
					return (entity._onRightWall);
				case "side":
					return (entity._onLeftWall || entity._onRightWall);
				case "top":
					return (entity._onCeil);
				case "bottom":
					return (entity._onFloor);
				case "vertical":
					return (entity._onCeil || entity._onFloor);
				case "anywhere":
					return (entity._colliding);
				default:
					return false;
			}
		} else if(event.param2 == "anyEntity"){
			for(var i in entity._collisions){
				var col = entity._collisions[i];
				var dir = getCollisionDirection(col);
				if(dir == event.param1){
					entity._opponent = col.opponent;
					return true;
				}
				switch(event.param1){
					case "side":
						if(dir == "left" || dir == "right"){
							entity._opponent = col.opponent;
							return true;
						}
						break;
					case "vertical":
						if(dir == "top" || dir == "bottom"){
							entity._opponent = col.opponent;
							return true;
						}
						break;
					case "anywhere":
						entity._opponent = col.opponent;
						return true;
					default:
						return false;
				}
			}
		} else if(event.param2 == "entity" && event.param3){
			var group = event.param3;
			for(var i in entity._collisions){
				var col = entity._collisions[i];
				if(col.opponent._behavior.group == group){
					var dir = getCollisionDirection(col);
					if(dir == event.param1){
						entity._opponent = col.opponent;
						return true;
					}
					switch(event.param1){
						case "side":
							if(dir == "left" || dir == "right"){
								entity._opponent = col.opponent;
								return true;
							}
							break;
						case "vertical":
							if(dir == "top" || dir == "bottom"){
								entity._opponent = col.opponent;
								return true;
							}
							break;
						case "anywhere":
							entity._opponent = col.opponent;
							return true;
						default:
							return false;
					}
				}
			}
			return false;
		}
		return false;
	},
	
	"outOfScreen": function(event, entity, gameSG, dT, time){
		if(!this.checkPars(event, 1)) return false;
		switch(event.param1){
			case "left":
				if(entity._x + entity._width < gameSG._levelSize.minX * 16) return true;
				break;
			case "right":
				if(entity._x > gameSG._levelSize.maxX * 16) return true;
				break;
			case "side":
				if(entity._x + entity._width < gameSG._levelSize.minX * 16 ||
						entity._x > gameSG._levelSize.maxX * 16) return true;
				break;
			case "top":
				if(entity._y + entity._height < gameSG._levelSize.minY * 16) return true;
				break;
			case "bottom":
				if(entity._y > gameSG._levelSize.maxY * 16) return true;
				break;
			case "vertical":
				if(entity._y + entity._height < gameSG._levelSize.minY * 16 ||
						entity._y > gameSG._levelSize.maxY * 16) return true;
				break;
			case "anywhere":
				if(entity._x + entity._width < gameSG._levelSize.minX * 16 ||
						entity._x > gameSG._levelSize.maxX * 16 ||
						entity._y + entity._height < gameSG._levelSize.minY * 16 ||
						entity._y > gameSG._levelSize.maxY * 16) return true;
				break;
			default:
				return false;
		}
	},
	
	"approach": function(event, entity, gameSG, dT, time){
		if(!this.checkPars(event, 3)) return false;
		var group = event.param1;
		for(var i in entity._relations){
			var rel = entity._relations[i];
			if(rel.opponent._behavior.group == group){
				switch(event.param1){
					case "distLess":
						if(rel.dX*rel.dX + rel.dY*rel.dY <= event.param3*event.param3){
							entity._opponent = rel.opponent;
							return true;
						}
						break;
					case "distGreater":
						if(rel.dX*rel.dX + rel.dY*rel.dY >= event.param3*event.param3){
							entity._opponent = rel.opponent;
							return true;
						}
						break;
					case "xLess":
						if(rel.dX <= event.param3){
							entity._opponent = rel.opponent;
							return true;
						}
						break;
					case "xGreater":
						if(rel.dX >= event.param3){
							entity._opponent = rel.opponent;
							return true;
						}
						break;
					case "yLess":
						if(rel.dY <= event.param3){
							entity._opponent = rel.opponent;
							return true;
						}
						break;
					case "yGreater":
						if(rel.dY >= event.param3){
							entity._opponent = rel.opponent;
							return true;
						}
						break;
					default:
						return false;
				}
			}
		}
		return false;
	},
	
	"group": function(event, entity, gameSG, dT, time){
		if(!this.checkPars(event, 1)) return false;
		if(entity._behavior.group == event.param1) return true;
		return false;
	},
	
	"position": function(event, entity, gameSG, dT, time){
		if(!this.checkPars(event, 3)) return false;
		
		var attrValue;
		if(event.param1 == "x"){
			attrValue = entity._x;
		} else if(event.param1 == "y"){
			attrValue = entity._y;
		} else {
			return false;
		}
		var operator = event.param2;
		var value = event.param3;
		
		return this.checkValue(attrValue, operator, value);
	},
	
	"velocity": function(event, entity, gameSG, dT, time){
		if(!this.checkPars(event, 3)) return false;
		
		var square = false;
		
		var attrValue;
		if(event.param1 == "x"){
			attrValue = entity.vX;
		} else if(event.param1 == "y"){
			attrValue = entity.vY;
		} else if(event.param1 == "total"){
			attrValue = entity.vX * entity.vX + entity.vY * entity.vY;
			square = true;
		} else {
			return false;
		}
		var operator = event.param2;
		var value = (square)? event.param3*event.param3 : event.param3;
		
		return this.checkValue(attrValue, operator, value);
	},
	
	"acceleration": function(event, entity, gameSG, dT, time){
		if(!this.checkPars(event, 3)) return false;
		
		var square = false;
		
		var attrValue;
		if(event.param1 == "x"){
			attrValue = entity.vX;
		} else if(event.param1 == "y"){
			attrValue = entity.vY;
		} else if(event.param1 == "total"){
			attrValue = entity.vX * entity.vX + entity.vY * entity.vY;
			square = true;
		} else {
			return false;
		}
		var operator = event.param2;
		var value = (square)? event.param3*event.param3 : event.param3;
		
		return this.checkValue(attrValue, operator, value);
	},
	
	"mirrored": function(event, entity, gameSG, dT, time){
		if(!this.checkPars(event, 2)) return false;
		
		switch(event.param1){
			case "x":
				if(event.param2 == "true"){
					if(entity._flipX) return true;
				} else if(event.param2 == "false"){
					if(!entity._flipX) return true;
				} else {
					return false;
				}
			case "y":
				if(event.param2 == "true"){
					if(entity._flipY) return true;
				} else if(event.param2 == "false"){
					if(!entity._flipY) return true;
				} else {
					return false;
				}
			default:
				return false;
		}
		return false;
	},
	
	"score": function(event, entity, gameSG, dT, time){
		if(!this.checkPars(event, 2)) return false;
		
		var attrValue = gameSG.score;
		var operator = event.param1;
		var value = event.param2;
		
		return this.checkValue(attrValue, operator, value);
	},
	
	
	
	
	
	checkValue: function(a, operator, b){
		switch(operator){
			case "g":
				return a > b;
			case "l":
				return a < b;
			case "e":
				return a == b;
			case "ge":
				return a >= b;
			case "le":
				return a <= b;
			case "ne":
				return a != b;
			default:
				return false;
		}
	},
	
	checkPars: function(event, amount){
		if(amount <= 0) return true;
		else if(amount == 1 && typeof event.param1 != "undefined") return true;
		else if(amount == 2 && typeof event.param1 != "undefined" && typeof event.param2 != "undefined") return true;
		else if(amount == 3 && typeof event.param1 != "undefined" && typeof event.param2 != "undefined" && typeof event.param3 != "undefined") return true;
		else if(amount == 4 && typeof event.param1 != "undefined" && typeof event.param2 != "undefined" && typeof event.param3 != "undefined" && typeof event.param4 != "undefined") return true;
		return false;
	},
};
