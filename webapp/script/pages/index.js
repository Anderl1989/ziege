$(function(){
	var loadGames = function(page){
		page = page || 0;
		REST.getPublicGames(page, function(publicGames){
				
			console.log(publicGames);
			$("#index_showroom").setTemplateURL("tpl/elements/gamesList.tpl.html");
			$("#index_showroom").processTemplate({games: publicGames, editable: false, shared: false});
			
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
		
		$("#container").setTemplateURL("tpl/index.tpl.html", {header: header});
		$("#container").processTemplate();
		
		var page = 0;
		
		loadGames(page);
		
		$("#index_showroom").on("click",".prev", function(){
			if(!$(this).hasClass("disabled")){
				page--;
				loadGames(page);
				return true;
			}
			return false;
		});
		
		$("#index_showroom").on("click",".next", function(){
			if(!$(this).hasClass("disabled")){
				page++;
				loadGames(page);
				return true;
			}
			return false;
		});
		
		$("#index_showroom").on("click",".page", function(){
			if(!$(this).hasClass("disabled")){
				page = $(this).attr("page")-0;
				loadGames(page);
				return true;
			}
			return false;
		});
		
	});
});