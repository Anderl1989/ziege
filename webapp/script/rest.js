var REST = new function(){
	var IP = "localhost";
	var PORT = 8080;
	var SERVERPATH = "/rest";
	
	var call = function(path, method, get, post, onSuccess, onError){
		$.support.cors = true;
		var params = "";
		if(get && typeof get == "object"){
			for(var i in get){
				params += (params == "")? "?" : "&";
				params += encodeURI(i) + "=" + encodeURI(get[i]);
			}
		}
		var headers = {};
		$.ajax({
			url: /*IP + ":" + PORT +*/ SERVERPATH + path + params,
			contentType: "application/json",
			headers: headers,
			type: method,
			data: stringify(post),
			success: onSuccess || function(){},
			error: onError || function(){},
		});
	};
	
	var stringify = function(params){
		if(!params || params == "") return "";
		var cache = [];
		return JSON.stringify(params, function(key, value) {
			if (typeof value === 'object' && value !== null) {
				if (cache.indexOf(value) !== -1) return;
				cache.push(value);
			}
			return value;
		});
	};
	
	this.checkLogin = function(onSuccess){
		this.isLoggedIn(function(obj){
			if(!obj.loggedIn){
				TOOLS.Storage.remove("user");
				window.location = "login.html";
			} else {
				if(onSuccess) onSuccess();
			}
		}, function(){
			console.error(arguments);
		});
	};
	
	this.checkAdminLogin = function(onSuccess){
		this.isLoggedInAsAdmin(function(obj){
			if(!obj.loggedIn || !obj.isAdmin){
				window.location = "index.html";
			} else {
				if(onSuccess) onSuccess();
			}
		}, function(){
			console.error(arguments);
		});
	};
	
	this.login = function(username, password, onSuccess, onError){
		call('/user/login', "POST", null, {name: username, password: password}, onSuccess, onError);
	};
	
	this.register = function(username, password, mail, onSuccess, onError){
		call('/user/register', "POST", null, {name: username, password: password, mail: mail}, onSuccess, onError);
	};
	
	this.updateUser = function(user, onSuccess, onError){
		call('/user/updateUser', "POST", null, user, onSuccess, onError);
	};
	
	this.logout = function(onSuccess, onError){
		call('/user/logout', "POST", null, null, onSuccess, onError);
	};
	
	this.isLoggedIn = function(onSuccess, onError){
		call('/user/isLoggedIn', "GET", null, null, onSuccess, onError);
	};
	
	this.isLoggedInAsAdmin = function(onSuccess, onError){
		call('/user/isLoggedInAsAdmin', "GET", null, null, onSuccess, onError);
	};
	
	this.addGame = function(onSuccess, onError){
		call('/game/addGame', "POST", null, null, onSuccess, onError);
	};
	
	this.getOwnGames = function(page, isPublic, onSuccess, onError){
		call('/game/getOwnGames', "GET", {isPublic: isPublic, page: page}, null, onSuccess, onError);
	};
	
	this.getPublicGames = function(page, onSuccess, onError){
		call('/game/getPublicGames', "GET", {page: page}, null, onSuccess, onError);
	};
	
	this.getGameInfoWithTileset = function(onSuccess, onError){
		call('/game/getGameInfoWithTileset', "GET", null, null, onSuccess, onError);
	};
	
	this.getAllGames = function(page, onSuccess, onError){
		call('/game/getAllGames', "GET", {page: page}, null, onSuccess, onError);
	};
	
	this.getGameInfo = function(gameId, onSuccess, onError){
		call('/game/getGameInfo', "GET", {gameId: gameId}, null, onSuccess, onError);
	};
	
	this.getGameInfoForEdit = function(gameId, onSuccess, onError){
		call('/game/getGameInfoForEdit', "GET", {gameId: gameId}, null, onSuccess, onError);
	};
	
	this.getGameEntityLayer = function(gameId, onSuccess, onError){
		call('/game/getGameEntityLayer', "GET", {gameId: gameId}, null, onSuccess, onError);
	};
	
	this.getGameBoxLayer = function(gameId, layer, onSuccess, onError){
		call('/game/getGameBoxLayer', "GET", {gameId: gameId, layer: layer}, null, onSuccess, onError);
	};
	
	this.getGameOptions = function(gameId, onSuccess, onError){
		call('/game/getGameOptions', "GET", {gameId: gameId}, null, onSuccess, onError);
	};
	
	this.updateGameInfo = function(gameId, gameInfo, onSuccess, onError){
		call('/game/updateGameInfo', "PUT", null, {gameId: gameId, gameInfo: gameInfo}, onSuccess, onError);
	};
	
	this.updateGameEntityLayer = function(gameId, entities, onSuccess, onError){
		call('/game/updateGameEntityLayer', "PUT", null, {gameId: gameId, entities: entities}, onSuccess, onError);
	};
	
	this.updateGameBoxLayer = function(gameId, layer, boxes, onSuccess, onError){
		call('/game/updateGameBoxLayer', "PUT", null, {gameId: gameId, layer: layer, boxes: boxes}, onSuccess, onError);
	};
	
	this.updateGameOptions = function(gameId, options, onSuccess, onError){
		call('/game/updateGameOptions', "PUT", null, {gameId: gameId, options: options}, onSuccess, onError);
	};
	
	this.addTilesetBox = function(gameId, box, onSuccess, onError){
		call('/tileset/addTilesetBox', "POST", null, {gameId: gameId, box: box}, onSuccess, onError);
	};
	
	this.addTilesetEntity = function(gameId, entity, onSuccess, onError){
		call('/tileset/addTilesetEntity', "POST", null, {gameId: gameId, entity: entity}, onSuccess, onError);
	};
	
	this.addTilesetBackgroundImage = function(gameId, backgroundImage, onSuccess, onError){
		call('/tileset/addTilesetBackgroundImage', "POST", null, {gameId: gameId, backgroundImage: backgroundImage}, onSuccess, onError);
	};
	
	this.getTileset = function(gameId, onSuccess, onError){
		call('/tileset/getTileset', "GET", {gameId: gameId}, null,  onSuccess, onError);
	};
	
	this.getPublicTileset = function(gameId, onSuccess, onError){
		call('/tileset/getPublicTileset', "GET", {gameId: gameId}, null,  onSuccess, onError);
	};
	
	this.getGameRating = function(gameId, onSuccess, onError){
		call('/ratings/getGameRating', "GET", {gameId: gameId}, null,  onSuccess, onError);
	};
	
	this.getRating = function(gameId, onSuccess, onError){
		call('/ratings/getRating', "GET", {gameId: gameId}, null,  onSuccess, onError);
	};
	
	this.rateGame = function(gameId, rating, onSuccess, onError){
		call('/ratings/rateGame', "PUT", null, {gameId: gameId, rating: rating},  onSuccess, onError);
	};
	
	this.removeTilesetBox = function(gameId, boxId, onSuccess, onError){
		call('/tileset/removeTilesetBox', "POST", null, {gameId: gameId, id: boxId}, onSuccess, onError);
	};
	
	this.removeTilesetEntity = function(gameId, entityId, onSuccess, onError){
		call('/tileset/removeTilesetEntity', "POST", null, {gameId: gameId, id: entityId}, onSuccess, onError);
	};
	
	this.removeTilesetBackgroundImage = function(gameId, backgroundImageId, onSuccess, onError){
		call('/tileset/removeTilesetBackgroundImage', "POST", null, {gameId: gameId, id: backgroundImageId}, onSuccess, onError);
	};
	
	this.shareTileset = function(gameId, tilesetName, onSuccess, onError){
		call('/tileset/shareTileset', "POST", null, {gameId: gameId, tilesetName: tilesetName}, onSuccess, onError);
	};
};