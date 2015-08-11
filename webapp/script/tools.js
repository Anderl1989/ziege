var TOOLS = new function(){

	var init = function() {
		$(document).on("mouseover","[tooltip]",function(e){
			$("body").append("<div id=\"tooltip\">" + $(this).attr("tooltip") + "</div>");
			$("#tooltip").css("top",(e.pageY + 20) + "px");
			$("#tooltip").css("left",(e.pageX + 20) + "px");
		});
		$(document).on("mousemove","[tooltip]",function(e){
			$("#tooltip").css("top",(e.pageY + 20) + "px");
			$("#tooltip").css("left",(e.pageX + 20) + "px");
		});
		$(document).on("mouseleave mouseout","[tooltip]",function(e){
			$("#tooltip").remove();
		});
		
		
		
		$(document).on("mousemove",".ratingArea",function(e){
			var amount = ~~(e.offsetX/22)+1;
			if(amount > 5) amount = 5;
			if(amount < 1) amount = 1;
			$(this).parent().children(".ratingNew").css("width", (amount*22) + "px");
		});
		$(document).on("mouseout mouseleave",".ratingArea",function(){
			$(this).parent().children(".ratingNew").css("width","0px");
		});
		$(document).on("click",".ratingArea",function(e){
			var amount = ~~(e.offsetX/22)+1;
			if(amount > 5) amount = 5;
			if(amount < 1) amount = 1;
			
			var ratingBox = $(this).parent();
			
			var gameId = ratingBox.attr("gameId");
			
			REST.rateGame(gameId, amount, function(rating){
				console.log(rating);
				ratingBox.attr("tooltip", t('tooltip.rating', (rating.votes > 0)? (~~(rating.sum/rating.votes*10))/10 : 0, rating.votes));
				ratingBox.children(".ratingUsers").css("width", (~~(rating.sum*2/rating.votes+0.5))*11 + "px");
				ratingBox.children(".ratingCount").html("(" + rating.votes + ")");
			
				REST.getRating(gameId, function(myRating){
					ratingBox.children(".ratingOwn").css("width", myRating.rating*22 + "px");
				}, function(err){
					console.error(err);
				});
			
			}, function(err){
				console.error(err);
			});
		});
	};
	
	var ScriptLoader = new function(){
		var included = [];
		this.include = function(filename, callback){
			for(var i = 0; i < included.length; i++){
				if(included[i] == filename){
					if(callback) callback();
					return;
				}
			}
			$.get(filename, function(data){
				eval(data);
				included.push(filename);
				if(callback) callback();
			});
		};
	};
	
	this.getUrlParam = function(id){
		var vars = {};
		window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
			vars[key] = value;
		});
		if(id){
			if(vars[id]){
				return vars[id];
			} else {
				return null;
			}
		} else {
			return vars;
		}
	};

	this.loadScript = function(filename, callback){
		ScriptLoader.include(filename, callback);
	}
	
	this.Storage = new function(){
		var isAvailable = function(){
			return (localStorage)? true : false;
		};
		this.isAvailable = function(){
			return isAvailable();
		};
		this.get = function(id){
			if(isAvailable){
				return localStorage.getItem(id);
			} else {
				return null;
			}
		};
		this.set = function(id, value){
			if(isAvailable){
				localStorage.setItem(id, value);
				return true;
			} else {
				return false;
			}
		};
		this.remove = function(id){
			if(isAvailable){
				localStorage.removeItem(id);
			}
		};
		this.clear = function(){
			if(isAvailable){
				localStorage.clear();
			}
		};
		this.length = function(){
			if(isAvailable){
				return localStorage.length;
			} else {
				return 0;
			}
		};
		this.key = function(id){
			if(isAvailable){
				return localStorage.key(id);
			} else {
				return null;
			}
		};
	};
	
	this.addRatingsToGamesList = function(){
		REST.isLoggedIn(function(obj){
			var rateable = false;
			if(obj.loggedIn) rateable = true;
			
			$(".showroom_entry").each(function(){
				var gameId = $(this).attr("gameId");
				if(gameId){
					var ratingContainer = $(this).children(".showroom_entry_content").children(".ratingContainer");
					console.log("loading rating for:",gameId, ratingContainer, rateable);
					loadRatingContainerData(ratingContainer, gameId, rateable);
					
				}
			});
			
			
		}, function(){
			console.error(arguments);
		});
		
	};
	
	var loadRatingContainerData = function(container, gameId, rateable){
		REST.getGameRating(gameId, function(rating){
			var data = {
				isRateable: rateable,
				gameId: gameId,
				votes: rating.votes,
				sum: rating.sum,
			};
			if(rateable){
				REST.getRating(gameId, function(myRating){
					data.own = myRating.rating;
					displayRatingContainer(container, data);
				}, function(err){
					console.error(err);
				});
			} else {
				displayRatingContainer(container, data);
			}
		}, function(err){
			console.error(err);
		});
	};
	
	var displayRatingContainer = function(container, data){
		container.setTemplateURL("tpl/elements/rating.tpl.html");
		container.processTemplate(data);
	};
	
	init();
	
};