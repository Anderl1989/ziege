$(function(){
	var loadAllGames = function(){
		REST.getAllGames(0, function(games){
			
			console.error(games);
			
			var unshared = {
				total: 0,
				count: 12,
				games: [],
			};
			var shared = {
				total: 0,
				count: 12,
				games: [],
			};
			var removed = {
				total: 0,
				count: 12,
				games: [],
			};
			
			for(var i in games.games){
				if(games.games[i].removed == "true"){
					removed.games.push(games.games[i]);
				} else if(games.games[i].isPublic == "true"){
					shared.games.push(games.games[i]);
				} else {
					unshared.games.push(games.games[i]);
				}
			}
			
			/*unshared.sort(function(a,b){ 
				if(!a.rating) return 1;
				if(!b.rating) return -1;
				return (a.rating.sum/a.rating.votes > b.rating.sum/b.rating.votes)? -1 : 1;
			});*/
			$("#adminGames_unpublished").setTemplateURL("tpl/elements/gamesList.tpl.html");
			$("#adminGames_unpublished").processTemplate({games: unshared, editable: true, shared: false});
		
		
			/*shared.sort(function(a,b){ 
				if(!a.rating) return 1;
				if(!b.rating) return -1;
				return (a.rating.sum/a.rating.votes > b.rating.sum/b.rating.votes)? -1 : 1;
			});*/
			$("#adminGames_published").setTemplateURL("tpl/elements/gamesList.tpl.html");
			$("#adminGames_published").processTemplate({games: shared, editable: true, shared: true});
		
		
			/*removed.sort(function(a,b){ 
				if(!a.rating) return 1;
				if(!b.rating) return -1;
				return (a.rating.sum/a.rating.votes > b.rating.sum/b.rating.votes)? -1 : 1;
			});*/
			$("#adminGames_removed").setTemplateURL("tpl/elements/gamesList.tpl.html");
			$("#adminGames_removed").processTemplate({games: removed, editable: true, shared: true});
		
			$(".showroom_entry_tools_button_shareTileset").show();
			TOOLS.addRatingsToGamesList();
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
		$("#container").setTemplateURL("tpl/adminGames.tpl.html", {header: header});
		$("#container").processTemplate();
		
		
		REST.checkAdminLogin();
		
		loadAllGames();
		
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
				window.location = "adminGames.html";
			}, handleUpdateError);
		});
		
		$(document).on("click", ".showroom_entry_tools_button_unshare", function(){
			var gameId = $(this).parent().parent().parent().attr("gameId");
			REST.updateGameInfo(gameId, {isPublic: "false"}, function(gi){
				console.log("saved gameInfo", gi);
				window.location = "adminGames.html";
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
					window.location = "adminGames.html";
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