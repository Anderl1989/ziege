$(function(){
	LNG.ready(function(){
		$("#container").setTemplateURL("tpl/login.tpl.html");
		$("#container").processTemplate();
		$("#switch_login").click(function(){
			$("#login").show();
			$("#register").hide();
			$("#switch_login").addClass("active");
			$("#switch_register").removeClass("active");
			$("#login_name").focus();
			$("#error .message").html("");
			$("#error").hide();
			$(".row").removeClass("error");
		});
		$("#switch_register").click(function(){
			$("#register").show();
			$("#login").hide();
			$("#switch_register").addClass("active");
			$("#switch_login").removeClass("active");
			$("#register_name").focus();
			$("#error .message").html("");
			$("#error").hide();
			$(".row").removeClass("error");
		});
		
		$("#login_name").on("keyup", function(evt){
			if(evt.keyCode == 13) $("#login_password").focus();
		});
				
		$("#login_password").on("keyup", function(evt){
			if(evt.keyCode == 13) $("#login_button").click();
		});
		
		$("#register_name").on("keyup", function(evt){
			if(evt.keyCode == 13) $("#register_mail").focus();
		});
		
		$("#register_mail").on("keyup", function(evt){
			if(evt.keyCode == 13) $("#register_password").focus();
		});
		
		$("#register_password").on("keyup", function(evt){
			if(evt.keyCode == 13) $("#register_password_repeat").focus();
		});
		
		$("#register_password_repeat").on("keyup", function(evt){
			if(evt.keyCode == 13) $("#register_button").click();
		});
		
		$("#login_button").click(function(){
			$("#error .message").html("");
			$("#error").hide();
			$(".row").removeClass("error");
			var user = $("#login_name").val().trim();
			var pwd = $("#login_password").val();
			var valid = true;
			
			if(user == ""){
				$("#login_name_row").addClass("error");
				$("#error .message").append("<li>" + t("login.error.userMissing") + "</li>");
				$("#error").show();
				valid = false;
			} else if(!user.match(/^[a-zA-Z0-9]+$/)){
				$("#login_name_row").addClass("error");
				$("#error .message").append("<li>" + t("login.error.invalidUser") + "</li>");
				$("#error").show();
				valid = false;
			}
			if(pwd == ""){
				$("#login_password_row").addClass("error");
				$("#error .message").append("<li>" + t("login.error.passwordMissing") + "</li>");
				$("#error").show();
				valid = false;
			}
			
			if(valid){
				REST.login(user, pwd, function(user){
					TOOLS.Storage.set("user", user.name);
					TOOLS.Storage.set("mail", user.mail);
					window.location = "myGames.html";
				}, function(err){
					console.error(err);
					switch(err.status){
						case 404:
							$("#login_name_row").addClass("error");
							$("#error .message").append("<li>" + t("login.error.userNotFound") + "</li>");
							$("#error").show();
							break;
						case 403:
							$("#login_password_row").addClass("error");
							$("#error .message").append("<li>" + t("login.error.wrongPassword") + "</li>");
							$("#error").show();
							break;
					}
				});
			}
		});
		
		$("#register_button").click(function(){
			$("#error .message").html("");
			$("#error").hide();
			$(".row").removeClass("error");
			var user = $("#register_name").val().trim();
			var pwd = $("#register_password").val();
			var pwdRepeat = $("#register_password_repeat").val();
			var mail = $("#register_mail").val();
			var valid = true;
			
			if(user == ""){
				$("#register_name_row").addClass("error");
				$("#error .message").append("<li>" + t("login.error.userMissing") + "</li>");
				$("#error").show();
				valid = false;
			} else if(!user.match(/^[a-zA-Z0-9]+$/)){
				$("#register_name_row").addClass("error");
				$("#error .message").append("<li>" + t("login.error.invalidUser") + "</li>");
				$("#error").show();
				valid = false;
			}
			if(mail == ""){
				$("#register_mail_row").addClass("error");
				$("#error .message").append("<li>" + t("login.error.mailMissing") + "</li>");
				$("#error").show();
				valid = false;
			} else if(!mail.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)){
				$("#register_mail_row").addClass("error");
				$("#error .message").append("<li>" + t("login.error.invalidMail") + "</li>");
				$("#error").show();
				valid = false;
			}
			if(pwd == ""){
				$("#register_password_row").addClass("error");
				$("#error .message").append("<li>" + t("login.error.passwordMissing") + "</li>");
				$("#error").show();
				valid = false;
			} else if(pwdRepeat == ""){
				$("#register_password_repeat_row").addClass("error");
				$("#error .message").append("<li>" + t("login.error.passwordRepeatMissing") + "</li>");
				$("#error").show();
				valid = false;
			} else if(pwd != pwdRepeat){
				$("#register_password_repeat_row").addClass("error");
				$("#error .message").append("<li>" + t("login.error.passwordRepeatWrong") + "</li>");
				$("#error").show();
				valid = false;
			}
			
			if(valid){
				REST.register(user, pwd, mail, function(user){
					TOOLS.Storage.set("user", user.name);
					TOOLS.Storage.set("mail", user.mail);
					window.location = "myGames.html";
				}, function(err){
					console.error(err);
					switch(err.status){
						case 409:
							$("#register_name_row").addClass("error");
							$("#error .message").append("<li>" + t("login.error.userFound") + "</li>");
							$("#error").show();
							break;
					}
				});
			}
		});
		
		var user = TOOLS.Storage.get("user");
		if(user && user != ""){
			$("#login_name").val(user);
			$("#login_password").focus();
		} else {
			$("#login_name").focus();
		}
		
		REST.isLoggedIn(function(obj){
			if(obj.loggedIn){
				window.location = "myGames.html";
			}
		}, function(){
			console.error(arguments);
		});
	});
});