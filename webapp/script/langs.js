var LNG = new function(){
	var langs = [
		"de",
	];
	
	var currentLang = langs[0];
	
	var ready = false;
	var readyfn = function(){};
	
	this.ready = function(cb){
		if(ready){
			cb();
		} else {
			readyfn = cb;
		}
	};
	
	var setReady = function(){
		if(!ready){
			ready = true;
			readyfn();
		}
	};
	
	this.set = function(lang){
		if(LNG[lang]){
			currentLang = lang;
		} else {
			currentLang = langs[0];
		}
		TOOLS.Storage.set("lng", currentLang);
	};
	
	var init = function(){
		loadLang(0, function(){
			/* Set browser language as page language */
			if(window.navigator){
				if(window.navigator.userLanguage){
					LNG.set(window.navigator.userLanguage);
				} else if(window.navigator.language){
					LNG.set(window.navigator.language);
				}
			}
			
			/* Check local storage for language definition */
			if(TOOLS.Storage.get("lng")){
				LNG.set(TOOLS.Storage.get("lng"));
			}
			
			/* Check get parameter for language definition */
			if(TOOLS.getUrlParam("lng")){
				LNG.set(TOOLS.getUrlParam("lng"));
			}
			
			setReady();
		});
	};
	
	var loadLang = function(i, cb){
		if(i < langs.length){
			TOOLS.loadScript("lng/" + langs[i] + ".js", function(){
				loadLang(i+1, cb);
			});
		} else {
			cb();
		}
	}
		
	this.t = function(id){
		var splitId = id.split(".");
		var text = getText(splitId, LNG[currentLang]);
		
		
		for(var i = 1; i < arguments.length; i++){
			text = text.replace("{" + (i-1) + "}",arguments[i]);
		}
		
		return text;
	};
	
	var getText = function(split, obj, i){
		i = i || 0;
		var newObj = obj[split[i]];
		if(typeof newObj == "string"){
			return newObj;
		} else if(typeof newObj == "object"){
			return getText(split, newObj, i+1);
		} else {
			console.error("Could not find translation!", currentLang, split);
			return "";
		}
	};
	
	init();
};

var t = function(){
	return LNG.t.apply(LNG, arguments);
};