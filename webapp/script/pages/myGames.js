$(function(){
	var loadOwnGames = function(){
		REST.getOwnGames(0, false, function(ownGames){
			console.log(ownGames);
			ownGames.total = 0;
			$("#myGames_unpublished").setTemplateURL("tpl/elements/gamesList.tpl.html");
			$("#myGames_unpublished").processTemplate({games: ownGames, editable: true, shared: false});
			$("#myGames_unpublished").append("<div id=\"myGames_addGame\" tooltip=\"" + t("tooltip.addGame") + "\">+</div>");
		}, function(err){
			console.error(err);
			switch(err.status){
				case 403:
					// TODO:
					break;
				case 500:
					// TODO:
					break;
			}
		});
		REST.getOwnGames(0, true, function(ownGames){
			console.log(ownGames);
			ownGames.total = 0;
			$("#myGames_published").setTemplateURL("tpl/elements/gamesList.tpl.html");
			$("#myGames_published").processTemplate({games: ownGames, editable: true, shared: true});
		}, function(err){
			console.error(err);
			switch(err.status){
				case 403:
					// TODO:
					break;
				case 500:
					// TODO:
					break;
			}
		});
	};
	
	LNG.ready(function(){
		var header = $.createTemplateURL("tpl/elements/header.tpl.html");
		$("#container").setTemplateURL("tpl/myGames.tpl.html", {header: header});
		$("#container").processTemplate();
		
		REST.checkLogin();
		
		loadOwnGames();
		
		$(document).on("click", "#myGames_addGame", function(){
			REST.addGame(function(gameId){
				console.log(gameId);
				window.location = "edit.html?gameId=" + gameId;
			}, function(err){
				console.error(err);
				switch(err.status){
					case 403:
						// TODO:
						break;
					case 500:
						// TODO:
						break;
				}
			});
		});
		
		$(document).on("click", ".showroom_entry_tools_button_edit", function(){
			var gameId = $(this).parent().parent().parent().attr("gameId");
			window.location = "edit.html?gameId=" + gameId;
		});
		
		$(document).on("click", ".showroom_entry_tools_button_copy", function(){
			var gameId = $(this).parent().parent().parent().attr("gameId");
			alert("Dieses Feature ist leider noch nicht vorhanden!");
			// TODO
		});
		
		$(document).on("click", ".showroom_entry_tools_button_share", function(){
			var gameId = $(this).parent().parent().parent().attr("gameId");
			REST.updateGameInfo(gameId, {isPublic: "true"}, function(gi){
				console.log("saved gameInfo", gi);
				window.location = "myGames.html";
			}, handleUpdateError);
		});
		
		$(document).on("click", ".showroom_entry_tools_button_unshare", function(){
			var gameId = $(this).parent().parent().parent().attr("gameId");
			REST.updateGameInfo(gameId, {isPublic: "false"}, function(gi){
				console.log("saved gameInfo", gi);
				window.location = "myGames.html";
			}, handleUpdateError);
		});
		
		$(document).on("click", ".showroom_entry_tools_button_shareTileset", function(){
			var gameId = $(this).parent().parent().parent().attr("gameId");
			var tilesetName = prompt("Bitte gib einen Namen für das Tileset ein", "Tileset von " + TOOLS.Storage.get("user"));
			
			if(tilesetName != null){
				REST.shareTileset(gameId, tilesetName, function(){
					alert("Spielgrafiken erfolgreich veröffentlicht.");
				}, handleUpdateError);
			}
		});
		
		$(document).on("click", ".showroom_entry_tools_button_remove", function(){
			if(confirm(t("menu.confirmRemoval"))){
				var gameId = $(this).parent().parent().parent().attr("gameId");
				REST.updateGameInfo(gameId, {removed: "true"}, function(gi){
					console.log("saved gameInfo", gi);
					window.location = "myGames.html";
				}, handleUpdateError);
			}
		});
		
		
	});
	
	var handleUpdateError = function(err){
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
});