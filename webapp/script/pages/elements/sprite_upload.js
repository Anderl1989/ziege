var SPRITE_UPLOAD = function(onTileUpload){
	
	var filesToImport = []; //raw files not converted to images
	var invalidFiles = []; //invalid files
	var imagesToImport = []; //image data to be processed
	
	var SpR = new H5R();
	var STS = {
		sprite: {
			img:{
				src: "",
				sprites: 1,
				fps: 1,
			}
		}
	};
	var SSG = {
		obj:{
			_img: "sprite",
		},
	};
	
	var init = function(){
	
		$(document).on("drop", function(evt){
			evt = evt.originalEvent || evt;
			for(var i = 0; i < evt.dataTransfer.files.length; i++){
				var file = evt.dataTransfer.files[i];
				importImage(file);
			}
			evt.stopPropagation();
			evt.preventDefault();
		});
		
		
		$(document).on("change", "#addFilesToTilesetInput", function(e) {
			for(var i = 0; i < this.files.length; i++){
				var file = this.files[i];
				importImage(file);
			}
			$("#overlay").hide();
		});
		
		$(document).on("dragover", function(evt){
			evt.stopPropagation();
			evt.preventDefault();
		});
		$(document).on("dragleave", function(evt){
		});
		$(document).on("dragexit", function(evt){
		});
		
		$(document).on("click", "#btnSpriteAsBox", setToBox);
		$(document).on("click", "#btnSpriteAsEntity", setToEntity);
		$(document).on("click", "#btnSpriteAsBackground", setToBackground);
		
		$(document).on("keyup change", "#inputFrameCount", onFrameCountChange);
		$(document).on("keyup change", "#inputFPS", onFPSChange);
		
		$(document).on("click", "#btnSaveSprite", onBtnSaveClick);
		$(document).on("click", "#btnDiscardSprite", onBtnDiscardClick);
		$(document).on("click", "#btnDiscardAllSprites", onBtnDiscardAllClick);
		
		SpR.addStage(new H5R.Stage("spritePreview"));
		SpR.setScenegraph(SSG);
		SpR.setTileset(STS);
	};
	
	var overlayOpen = false;
	
	var importImage = function(file){
		if(file.type.lastIndexOf("image" != -1)){
			filesToImport.push(file);
		} else {
			file.error = "INVALID_TYPE";
			invalidFiles.push(file);
		}
		
		if(!overlayOpen) update();
	};
	
	var update = function(){
		overlayOpen = true;
		if(filesToImport.length > 0){
			handleNextFile();
		} else if(imagesToImport.length > 0){
			handleNextImage();
		} else {
			showInvalidFiles();
		}
	};
	
	var handleNextFile = function(){
		var file = filesToImport.shift();
		
		var filename = file.name;
		var reader = new FileReader();
		reader.onload = function (event) {
			
			var img = new Image();
			img.onload = function () {
				imagesToImport.push(img);
				update();
			}
			img.name = filename;
			img.src  = event.target.result;
		};
		
		reader.readAsDataURL(file);
	};
	
	var handleNextImage = function(){
		var img = imagesToImport.shift();
		if(img.height != 16 || img.width % 16 != 0){
			showSpriteUploadOverlay(false, img);
		} else {
			showSpriteUploadOverlay(true, img);
		}
		
	};
	
	var name = "";
	var behavior = "enemy";
	var frameCount = 1;
	var FPS = 8;
	var saveAs = "box";
	var currImg = null;
	
	var showSpriteUploadOverlay = function(boxEnabled, img){
		console.log("show ovl for img", img);
		
		var first = null;
		
		$("#inputOption").html("");
		var behaviorGroups = {};
		for(var i in PREDEFINED_BEHAVIORS){
			//if(!first) first = i;
			//$("#inputOption").append("<option value=\"" + i + "\">" + PREDEFINED_BEHAVIORS[i].name + "</option>");
			
			if(PREDEFINED_BEHAVIORS[i].showInMenu){
				if(!first) first = i;
				if(!behaviorGroups[PREDEFINED_BEHAVIORS[i].menuGroup]) behaviorGroups[PREDEFINED_BEHAVIORS[i].menuGroup] = [];
				behaviorGroups[PREDEFINED_BEHAVIORS[i].menuGroup].push({
					id: i,
					name: PREDEFINED_BEHAVIORS[i].name,
				});
			}
		}
		
		var keys = Object.keys(behaviorGroups);
		keys.sort();
		
		for(var i in keys){
			var key = keys[i];
			$("#inputOption").append("<optgroup label=\"" + key + "\"></optgroup>");
			var group = $("#inputOption optgroup").last();
			behaviorGroup = behaviorGroups[key]
			behaviorGroup.sort(function(a,b){
				if(a.name < b.name) return -1;
				if(a.name > b.name) return 1;
				return 0;
			});
			for(var j in behaviorGroup){
				group.append("<option value=\"" + behaviorGroup[j].id + "\">" + behaviorGroup[j].name + "</option>");
			}
		}
		
		$("#rawPreview").css("background-image","url(" + img.src + ")");
		$("#spriteUploadBg").css("display","table");
		SpR.updateStages();
		
		STS.sprite.img.src = img.src;
		
		SpR.updateTileset(function(){
			
		});
		
		name = "";
		behavior = first;
		frameCount = 1;
		FPS = 8;
		saveAs = "box";
		currImg = img;
		
		STS.sprite.img.fps = FPS;
		
		$("#inputName").val(name);
		$("#inputOption").val(behavior);
		$("#inputFrameCount").val(frameCount);
		$("#inputFPS").val(FPS);
		updateFPSView();
		
		if(boxEnabled){
			$("#btnSpriteAsBox").removeClass("disabled");
			setToBox();
		} else {
			$("#btnSpriteAsBox").addClass("disabled");
			
			if((img.width >= 320 && img.height >= 240)||(img.height > 64 && img.height/img.width == 0.75)){
				setToBackground();
			} else {
				guessFrameCount(img);
				setToEntity();
			}
		}
		
	};
	
	var onFrameCountChange = function(){
		frameCount = $("#inputFrameCount").val();
		updateFPSView();
	};
	
	var onFPSChange = function(){
		FPS = $("#inputFPS").val();
		STS.sprite.img.fps = FPS;
		SpR.updateTileset(function(){});
	};
	
	var onBtnSaveClick = function(){
		name = $("#inputName").val();
		var bE = $("#inputOption")[0];
		behavior = bE.options[bE.selectedIndex].value;
		console.log(behavior);
		frameCount = $("#inputFrameCount").val();
		FPS = $("#inputFPS").val();
		
		if(saveAs == "box"){
			showLoading();
			REST.addTilesetBox(TOOLS.getUrlParam("gameId"), {
				img:{
					src: currImg.src,
					sprites: frameCount,
					fps: FPS,
				}
			}, function(boxObj){
				console.log("SAVED", boxObj);
				hideLoading();
				
				var TSUpdate = {box: {}, entity: {}, backgroundImage: {}};
				TSUpdate.box[boxObj._id] = boxObj.box;
				onTileUpload(TSUpdate);
				
				update();
			}, handleUploadError);
		} else if (saveAs == "entity") {
			showLoading();
			REST.addTilesetEntity(TOOLS.getUrlParam("gameId"), {
				img:{
					src: currImg.src,
					sprites: frameCount,
					fps: FPS,
				},
				behavior: behavior,
				name: name,
			}, function(entityObj){
				console.log("SAVED", entityObj);
				hideLoading();
				
				var TSUpdate = {box: {}, entity: {}, backgroundImage: {}};
				TSUpdate.entity[entityObj._id] = entityObj.entity;
				onTileUpload(TSUpdate);
				
				update();
			}, handleUploadError);
		} else {
			showLoading();
			REST.addTilesetBackgroundImage(TOOLS.getUrlParam("gameId"), {
				img:{
					src: currImg.src,
				},
			}, function(bgObj){
				console.log("SAVED", bgObj);
				hideLoading();
				
				var TSUpdate = {box: {}, entity: {}, backgroundImage: {}};
				TSUpdate.backgroundImage[bgObj._id] = bgObj.backgroundImage;
				onTileUpload(TSUpdate);
				
				update();
			}, handleUploadError);
		}
	};
	
	var onBtnDiscardClick = function(){
		update();
	};
	
	var onBtnDiscardAllClick = function(){
		filesToImport = [];
		invalidFiles = [];
		imagesToImport = [];
		$("#spriteUploadBg").css("display","none");
		overlayOpen = false;
	};
	
	var setToBox = function(){
		if($("#btnSpriteAsBox").hasClass("disabled")){
			setToEntity();
		} else {
			saveAs = "box";
			frameCount = currImg.width / 16;
			updateFPSView();
			$("#inputFrameCount").val(frameCount);
			$("#btnSpriteAsBox").addClass("active");
			$("#btnSpriteAsEntity").removeClass("active");
			$("#btnSpriteAsBackground").removeClass("active");
			$("#spriteUploadContent").removeClass("uploadBackground");
			$("#entityOnly").hide();
		}
	};
	
	var updateFPSView = function(){
		if(frameCount == 1){
			$("#fpsView").hide();
		} else {
			$("#fpsView").show();
		}
		STS.sprite.img.sprites = frameCount;
		SpR.updateTileset(function(){});
	};
	
	var setToEntity = function(){
		saveAs = "entity";
		frameCount = $("#inputFrameCount").val();
		updateFPSView();
		$("#btnSpriteAsEntity").addClass("active");
		$("#btnSpriteAsBox").removeClass("active");
		$("#btnSpriteAsBackground").removeClass("active");
		$("#spriteUploadContent").removeClass("uploadBackground");
		$("#entityOnly").show();
	};
	
	var guessFrameCount = function(img){
		var possWidth = [];
		for(var i = img.width; i > 0; i--){
			if(img.width % i == 0) possWidth.push(i);
		}
		var minDiff = Math.abs(possWidth[0] - img.height);
		var minIdx = 0;
		for(var i = 1; i < possWidth.length; i++){
			var diff = Math.abs(possWidth[i] - img.height);
			if(diff < minDiff){
				minDiff = diff;
				minIdx = i;
			}
		}
		var count = img.width / possWidth[minIdx];
		$("#inputFrameCount").val(count);
	};
	
	var setToBackground = function(){
		saveAs = "background";
		frameCount = 1;
		updateFPSView();
		$("#btnSpriteAsBackground").addClass("active");
		$("#btnSpriteAsEntity").removeClass("active");
		$("#btnSpriteAsBox").removeClass("active");
		$("#spriteUploadContent").addClass("uploadBackground");
		$("#entityOnly").hide();
	};
	
	var showInvalidFiles = function(){
		console.log(invalidFiles);
		invalidFiles = [];
		$("#spriteUploadBg").css("display","none");
		overlayOpen = false;
	};
	
	var handleUploadError = function(err){
		console.error(err);
		hideLoading();
		//TODO: handle errors
		/*switch(err.status){
			case 400:
				// TODO:
				break;
		}*/
	};
	
	init();
	
};