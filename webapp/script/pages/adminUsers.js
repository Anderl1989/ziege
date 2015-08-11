$(function(){
	
	
	LNG.ready(function(){
		var header = $.createTemplateURL("tpl/elements/header.tpl.html");
		$("#container").setTemplateURL("tpl/adminUsers.tpl.html", {header: header});
		$("#container").processTemplate();
		
		REST.checkAdminLogin();
		
		
		
	});
	
});