var REACTIONS = {

	"animation": function(action, entity, gameSG, dT, time){
		if(!this.checkPars(action, 1)) return;
		
		var attrValue = entity._animation;
		var operator = action.param1;
		var value = this.getDestValue(action.param2, action.param3, entity, gameSG, dT, time);
		if(typeof value == "undefined") return;
		
		entity._animation = this.calculate(attrValue, operator, value);
	},
	
	"random": function(action, entity, gameSG, dT, time){
		if(!this.checkPars(action, 3)) return;
		
		var min = action.param2;
		var max = action.param3;
		
		entity._attrs[action.param1] = ~~(Math.random()*(max-min+1)) + min;
	},

	"frame": function(action, entity, gameSG, dT, time){
		if(!this.checkPars(action, 1)) return;
		
		var attrValue = entity._frame;
		var operator = action.param1;
		var value = this.getDestValue(action.param2, action.param3, entity, gameSG, dT, time);
		if(typeof value == "undefined") return;
		
		entity._frame = this.calculate(attrValue, operator, value);
		entity._startFrame = entity._frame - Math.round(time * (entity._fps/1000));
	},
	
	"stopAnimation": function(action, entity, gameSG, dT, time){
		entity._freeze = true;
	},

	"startAnimation": function(action, entity, gameSG, dT, time){
		entity._freeze = false;
	},
	
	"disappear": function(action, entity, gameSG, dT, time){
		var idx = gameSG.entity.indexOf(entity);
		if (idx > -1) gameSG.entity.splice(idx, 1);
	},
	
	"endGame": function(action, entity, gameSG, dT, time){
		gameSG.shouldStop = true;
		if(!this.checkPars(action, 1)) return;
		
		gameSG.stopMessage = action.param1;
	},
	
	"group": function(action, entity, gameSG, dT, time){
		if(!this.checkPars(action, 1)) return;
		
		entity._behavior.group = action.param1;
	},
	
	"save": function(action, entity, gameSG, dT, time){
		gameSG._save.entity = JSON.stringify(gameSG.entity, function censor(key, value) {
			if (key == "_behavior" || key == "_relations" || key == "_collisions") {
				return undefined;
			}
			return value;
		});
		gameSG._save.score = gameSG.score;
	},
	
	"restore": function(action, entity, gameSG, dT, time){
		gameSG.entity = JSON.parse(gameSG._save.entity + "");
		gameSG.score = gameSG._save.score;
	},
	
	"mirror": function(action, entity, gameSG, dT, time){
		if(!this.checkPars(action, 2)) return;
		
		switch(action.param2){
			case "true":
				if(action.param1 == "x"){
					entity._flipX = true;
				} else if(action.param1 == "y"){
					entity._flipY = true;
				}
				break;
			case "false":
				if(action.param1 == "x"){
					entity._flipX = false;
				} else if(action.param1 == "y"){
					entity._flipY = false;
				}
				break;
			case "toggle":
				if(action.param1 == "x"){
					entity._flipX = !entity._flipX;
				} else if(action.param1 == "y"){
					entity._flipY = !entity._flipY;
				}
				break;
		}
	},
	
	"attribute": function(action, entity, gameSG, dT, time){
		if(!this.checkPars(action, 4)) return;
		
		if(!entity._attrs) entity._attrs = {};
		var attrValue = entity._attrs[action.param1] || 0;
		var operator = action.param2;
		var value = this.getDestValue(action.param3, action.param4, entity, gameSG, dT, time);
		if(typeof value == "undefined") return;
		
		entity._attrs[action.param1] = this.calculate(attrValue, operator, value);
	},
	
	"global": function(action, entity, gameSG, dT, time){
		if(!this.checkPars(action, 4)) return;
		
		var attrValue = gameSG._globals[action.param1] || 0;
		var operator = action.param2;
		var value = this.getDestValue(action.param3, action.param4, entity, gameSG, dT, time);
		if(typeof value == "undefined") return;
		
		gameSG._globals[action.param1] = this.calculate(attrValue, operator, value);
	},
	
	"velocityX": function(action, entity, gameSG, dT, time){
		if(!this.checkPars(action, 3)) return;
		
		var attrValue = entity.velocityX;
		var operator = action.param1;
		var value = this.getDestValue(action.param2, action.param3, entity, gameSG, dT, time);
		if(typeof value == "undefined") return;
		
		entity.velocityX = this.calculate(attrValue, operator, value);
	},
	
	"velocityY": function(action, entity, gameSG, dT, time){
		if(!this.checkPars(action, 3)) return;
		
		var attrValue = entity.velocityY;
		var operator = action.param1;
		var value = this.getDestValue(action.param2, action.param3, entity, gameSG, dT, time);
		if(typeof value == "undefined") return;
		
		entity.velocityY = this.calculate(attrValue, operator, value);
	},
	
	"accelerationX": function(action, entity, gameSG, dT, time){
		if(!this.checkPars(action, 3)) return;
		
		var attrValue = entity.accelerationX;
		var operator = action.param1;
		var value = this.getDestValue(action.param2, action.param3, entity, gameSG, dT, time);
		if(typeof value == "undefined") return;
		
		entity.accelerationX = this.calculate(attrValue, operator, value);
	},
	
	"accelerationY": function(action, entity, gameSG, dT, time){
		if(!this.checkPars(action, 3)) return;
		
		var attrValue = entity.accelerationY;
		var operator = action.param1;
		var value = this.getDestValue(action.param2, action.param3, entity, gameSG, dT, time);
		if(typeof value == "undefined") return;
		
		entity.accelerationY = this.calculate(attrValue, operator, value);
	},
	
	"positionX": function(action, entity, gameSG, dT, time){
		if(!this.checkPars(action, 3)) return;
		
		var attrValue = entity.positionX;
		var operator = action.param1;
		var value = this.getDestValue(action.param2, action.param3, entity, gameSG, dT, time);
		if(typeof value == "undefined") return;
		
		entity.positionX = this.calculate(attrValue, operator, value);
	},
	
	"positionY": function(action, entity, gameSG, dT, time){
		if(!this.checkPars(action, 3)) return;
		
		var attrValue = entity.positionY;
		var operator = action.param1;
		var value = this.getDestValue(action.param2, action.param3, entity, gameSG, dT, time);
		if(typeof value == "undefined") return;
		
		entity.positionY = this.calculate(attrValue, operator, value);
	},
	
	"score": function(action, entity, gameSG, dT, time){
		if(!this.checkPars(action, 3)) return;
		
		var attrValue = gameSG.score;
		var operator = action.param1;
		var value = this.getDestValue(action.param2, action.param3, entity, gameSG, dT, time);
		if(typeof value == "undefined") return;
		
		gameSG.score = this.calculate(attrValue, operator, value);
	},
	
	"spawn": function(action, entity, gameSG, dT, time){
		if(!this.checkPars(action, 1)) return;
		var toSpawn = {
			_img: action.param1,
			_x: entity._x,
			_y: entity._y,
			_flipX: entity._flipX,
			_flipY: entity._flipY,
			_opponent: entity,
			_hide: true,
		};
		gameSG.entity.push(toSpawn);
	},
	
	"colliding": function(action, entity, gameSG, dT, time){
		if(!this.checkPars(action, 1)) return;
		
		entity._behavior.colliding = (action.param1 == "true")? true : false;
	},
	
	"rigid": function(action, entity, gameSG, dT, time){
		if(!this.checkPars(action, 1)) return;
		
		entity._behavior.rigid = (action.param1 == "true")? true : false;
	},
	
	"attachCamera": function(action, entity, gameSG, dT, time){
		if(!this.checkPars(action, 1)) return;
		
		entity._behavior.attachCamera = (action.param1 == "true")? true : false;
	},
	
	
	calculate: function(source, operator, value){
		var result = false;
		switch(operator){
			case "add":
				result = source + value;
				break;
			case "subtract":
				result = source - value;
				break;
			case "multiply":
				result = source * value;
				break;
			case "divide":
				result = source / value;
				break;
			case "set":
				result = value;
				break;
		}
		if(typeof result == "number" && result == result){
			return result;
		} else {
			return source;
		}
	},
	
	getDestValue: function(source, attr, entity, gameSG, dT, time){
		var value;
		switch(source){
			case "custom":
				value = attr;
				break;
			case "value":
				value = this.getValue(attr, entity, gameSG, dT, time);
				break;
			case "attribute":
				value = entity._attrs[attr];
				break;
			case "global":
				value = gameSG._globals[attr];
				break;
			case "opponentValue":
				value = this.getValue(attr, entity._opponent, gameSG, dT, time);
				break;
			case "opponentAttribute":
				value = entity._opponent._attrs[attr];
				break;
		}
		return value;
	},

	getValue: function(source, entity, gameSG, dT, time){
		if(source == "score") return gameSG.score;
		if(source == "millis") return dT;
		if(source == "time") return time;
		if(source == "animation") return entity._animation;
		if(source == "frame") return entity._frame;
		if(entity[source]) return entity[source];
		return false;
	},
	
	checkPars: function(action, amount){
		if(amount <= 0) return true;
		else if(amount == 1 && typeof action.param1 != "undefined") return true;
		else if(amount == 2 && typeof action.param1 != "undefined" && typeof action.param2 != "undefined") return true;
		else if(amount == 3 && typeof action.param1 != "undefined" && typeof action.param2 != "undefined" && typeof action.param3 != "undefined") return true;
		else if(amount == 4 && typeof action.param1 != "undefined" && typeof action.param2 != "undefined" && typeof action.param3 != "undefined" && typeof action.param4 != "undefined") return true;
		return false;
	},
};