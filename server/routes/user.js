var pass = require('pwd');
var mail = require("nodemailer").mail;
var log = require('../log');

var user = new function(){

	var db;
	var mongojs;

	var getUser = function(name, onSuccess, onError){
		db.users.find({name: name}, function(err, users) {
			if(err || !users || users.length < 1){
				onError(err);
			} else {
				users.forEach(function(user){
					onSuccess(user);
				});
			}
		});
	};
	
	
	var getAllUsers = function(onSuccess, onError){
		db.users.find({}, {name: true, mail: true, admin: true}, function(err, users) {
			if(err || !users){
				onError(err);
			} else {
				onSuccess(users);
			}
		});
	};

	var addUser = function(user, onSuccess, onError){
		db.users.save(user, function(err, saved) {
			if(err || !saved ){
				onError(err);
			} else {
				onSuccess(saved);
			}
		});
	};
	
	var updateUser = function(req, onSuccess, onError){
		var set = {};
		
		if(typeof req.body.mail != "undefined") set.mail = req.body.mail;
		
		if(typeof req.body.newPassword != "undefined"){
			pass.hash(req.body.newPassword, function(err, salt, hash){
				set.salt = salt;
				set.hash = hash;
				doUserUpdate(req.session.user.name, set, onSuccess, onError);
			});
		} else {
			doUserUpdate(req.session.user.name, set, onSuccess, onError);
		}
		
	};
	
	var doUserUpdate = function(name, set, onSuccess, onError){
		db.users.update(
			{
				name: name,
			},
			{ 
				$set: set
			},
			{upsert: false, multi: false},
			function(err, saved) {
				if(err || !saved ){
					onError(err);
				} else {
					getUser(name, onSuccess, onError);
				}
			}
		);
	};
		
	
	var addAdminUser = function(){
		db.users.find({name: "Admin"}, function(err, users) {
			if(err || !users || users.length < 1){
				console.log("Creating Admin user!");
				pass.hash("admin", function(err, salt, hash){
					var user = {
						name: "Admin",
						mail: "",
						salt: salt,
						hash: hash,
						admin: true,
					};
					
					db.users.save(user, function(err, saved) {
						if(err || !saved ){
							console.log("Creating Admin user failed:", err);
						} else {
							console.log("Creating Admin user succeeded!");
						}
					});
				});
			}
		});
		
	};
	
		
		
	this.init = function(database, mongo){
		db = database;
		mongojs = mongo;
		return this;
	};
	
	this.register = function(req, res){
		if(!req.body.name || !req.body.password || !req.body.mail){
			res.send(400, { error: 'User name, password or email missing!' });
		} else {
			getUser(req.body.name, function(){
				res.send(409, { error: 'User already exists!' });
			}, function(){
				var user = { name: req.body.name, mail: req.body.mail};
				pass.hash(req.body.password, function(err, salt, hash){
					user.salt = salt;
					user.hash = hash;
					addUser(user, function(newUser){
					
						console.log(JSON.stringify(newUser));
					
						/*mail({
							from: "ZIEGE <noreply@game-editor.at>", // sender address
							to: newUser.mail, // list of receivers
							subject: "Willkommen bei ZIEGE", // Subject line
							text: "Hallo " + newUser.name + ", dein Account bei ZIEGE (www.game-editor.at) wurde erfolgreich erstellt!", // plaintext body
							html: "<b>Hallo " + newUser.name + ",</b><br>dein Account bei <a href=\"http://www.game-editor.at\">ZIEGE</a> wurde erfolgreich erstellt!", // html body
						});*/
					
						req.session.regenerate(function(){
							req.session.user = newUser;
							res.send(201, { name: user.name, mail: user.mail });
						});
					}, function(){
						res.send(500, { message: 'An unknown error occurred!' });
					});
				});
			});
		}
	};
	
	this.login = function(req, res){
		if(!req.body.name || !req.body.password){
			res.send(400, { error: 'User name or password missing!' });
		} else {
			getUser(req.body.name, function(user){
				pass.hash(req.body.password, user.salt, function(err, hash){
					if (user.hash == hash) {
						req.session.regenerate(function(){
							req.session.user = user;
							res.send(200, { name: user.name, mail: user.mail });
						});
					} else {
						res.send(403, { error: 'Password invalid!' });
					}
				});
			}, function(){
				res.send(404, { error: 'User not found!' });
			});
		}
	};
	
	this.updateUser = function(req, res){
		if(!req.body.password){
			res.send(403, { error: 'Password missing!' });
		} else {
		
			getUser(req.session.user.name, function(user){
				pass.hash(req.body.password, user.salt, function(err, hash){
					if (user.hash == hash) {
						
						updateUser(req, function(newUser){
							log(newUser);
							req.session.regenerate(function(){
								req.session.user = newUser;
								res.send(200, { name: newUser.name, mail: newUser.mail });
							});
						}, function(){
							res.send(500, { message: 'An unknown error occurred!' });
						});
						
					} else {
						res.send(403, { error: 'Password invalid!' });
					}
				});
			}, function(){
				res.send(404, { error: 'User not found!' });
			});
		
		
		}
	};
	
	this.getAllUsers = function(req, res){
		getAllUsers(function(users){
			res.send(200, { users: users });
		}, function(){
			res.send(500, { message: 'An unknown error occurred!' });
		});
	};
	
	this.logout = function(req, res){
		req.session.destroy(function(){
			res.send(200, { message: 'User logged out!' });
		});
	};
	
	this.isValid = function(req, res, next){
		if (req.session.user) {
			next();
		} else {
			res.send(403, { error: 'User is not logged on!' });
		}
	};
	
	this.isAdmin = function(req, res, next){
		if (req.session.user && req.session.user.admin) {
			next();
		} else {
			res.send(403, { error: 'User is not an administrator!' });
		}
	};
	
	this.isLoggedIn = function(req, res){
		if (req.session.user) {
			res.send(200, {loggedIn: true, name: req.session.user.name});
		} else {
			res.send(200, {loggedIn: false});
		}
	};
	
	this.isLoggedInAsAdmin = function(req, res){
		if (req.session.user) {
			if(req.session.user.admin){
				res.send(200, {loggedIn: true, isAdmin: true, name: req.session.user.name});
			} else {
				res.send(200, {loggedIn: true, isAdmin: false, name: req.session.user.name});
			}
		} else {
			res.send(200, {loggedIn: false, isAdmin: false});
		}
	};
	
	this.addAdminUser = addAdminUser;
};

module.exports = user;