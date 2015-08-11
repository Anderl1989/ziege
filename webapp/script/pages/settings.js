$(function(){
	LNG.ready(function(){
		$("#container").setTemplateURL("tpl/settings.tpl.html");
		$("#container").processTemplate();
		
		$("#settings_mail").on("keyup", function(evt){
			if(evt.keyCode == 13) $("#settings_new_password").focus();
		});
				
		$("#settings_new_password").on("keyup", function(evt){
			if(evt.keyCode == 13) $("#settings_new_password_repeat").click();
		});
		
		$("#settings_new_password_repeat").on("keyup", function(evt){
			if(evt.keyCode == 13) $("#settings_password").focus();
		});
		
		$("#settings_password").on("keyup", function(evt){
			if(evt.keyCode == 13) $("#update_button").click();
		});
		
		$("#update_button").click(function(){
			$("#error .message").html("");
			$("#error").hide();
			$(".row").removeClass("error");
			var newPwd = $("#settings_new_password").val();
			var pwdRepeat = $("#settings_new_password_repeat").val();
			var pwd = $("#settings_password").val();
			var mail = $("#settings_mail").val();
			var valid = true;
			
			if(mail != "" && !mail.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)){
				$("#settings_mail_row").addClass("error");
				$("#error .message").append("<li>" + t("settings.error.invalidMail") + "</li>");
				$("#error").show();
				valid = false;
			}
			
			if(pwd == ""){
				$("#settings_password_row").addClass("error");
				$("#error .message").append("<li>" + t("settings.error.passwordMissing") + "</li>");
				$("#error").show();
				valid = false;
			}
			
			if(newPwd != "" && pwdRepeat == ""){
				$("#settings_new_password_repeat_row").addClass("error");
				$("#error .message").append("<li>" + t("settings.error.passwordRepeatMissing") + "</li>");
				$("#error").show();
				valid = false;
			} else if(newPwd != "" && newPwd != pwdRepeat){
				$("#settings_new_password_repeat_row").addClass("error");
				$("#error .message").append("<li>" + t("settings.error.passwordRepeatWrong") + "</li>");
				$("#error").show();
				valid = false;
			}
			
			if(valid){
				var userUpdate = {
					password: pwd,
				};
				
				if(newPwd != "") userUpdate.newPassword = newPwd;
				if(mail != "") userUpdate.mail = mail;
			
				REST.updateUser(userUpdate, function(user){
					TOOLS.Storage.set("user", user.name);
					TOOLS.Storage.set("mail", user.mail);
					window.location = "myGames.html";
				}, function(err){
					console.error(err);
					switch(err.status){
						case 404:
							$("#error .message").append("<li>" + t("settings.error.userNotFound") + "</li>");
							$("#error").show();
							break;
						case 403:
							$("#settings_password_row").addClass("error");
							$("#error .message").append("<li>" + t("settings.error.wrongPassword") + "</li>");
							$("#error").show();
							break;
					}
				});
			}
		});
		
		
		REST.isLoggedIn(function(obj){
			if(!obj.loggedIn){
				window.location = "index.html";
			}
		}, function(){
			console.error(arguments);
		});
	});
});