$(function(){
	LNG.ready(function(){
		var header = $.createTemplateURL("tpl/elements/header.tpl.html");
		$("#container").setTemplateURL("tpl/instructions.tpl.html", {header: header});
		$("#container").processTemplate();
		
		
		
	});
});