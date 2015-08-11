var log = require('../log');

var ratings = new function(){

	var db;
	var mongojs;

	var rateGame = function(gameId, userName, rating, onSuccess, onError){
		db.ratings.update(
			{
				userName: userName,
				gameId: gameId,
			},
			{ 
				$set: { rating: rating, },
			},
			{upsert: true, multi: false},
			function(err, saved) {
				if(err || !saved ){
					onError(err);
				} else {
					getGameRating(gameId, true, onSuccess, onError);
				}
			}
		);
	};
	
	var getRating = function(gameId, userName, onSuccess, onError){
		db.ratings.findOne({userName: userName, gameId: gameId}, function(err, rating) {
			if(err || !rating){
				onSuccess({rating: 0});
			} else {
				onSuccess(rating);
			}
		});
	};
	
	var getGameRating = function(gameId, update, onSuccess, onError){
		db.ratings.find({gameId: gameId}, function(err, ratings) {
			if(err || !ratings){
				onError(err);
			} else {
				var rating = {
					votes: 0,
					sum: 0,
				};
				
				for(var i in ratings){
					
					rating.votes++;
					rating.sum += ratings[i].rating;
				}
				
				rating.total = (rating.votes > 0)? rating.sum/rating.votes : 0;
				rating.valid = (rating.votes > 1);
				
				if(update){
					db.gameInfo.update(
						{
							_id: mongojs.ObjectId(gameId),
						},
						{ 
							$set: { rating: rating, }
						},
						{upsert: false, multi: false},
						function(err, saved) {
							if(err || !saved ){
								console.log("updating game info after rating error:", err);
							} else {
								console.log("updating game info after rating success");
							}
						}
					);
				}
				
				onSuccess(rating);
			}
		});
	};
	
	this.init = function(database, mongo){
		db = database;
		mongojs = mongo;
		
		//update/get all game ratings on init
		db.gameInfo.find(function(err, gameInfos) {
			if(!err && gameInfos){
				for(var i in gameInfos){
					getGameRating(gameInfos[i]._id+"", true, function(){}, function(){});
				}
			}
		});
		
		
		return this;
	};
	
	this.rateGame = function(req, res){
		if(!req.body.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else if(!req.body.rating){
			res.send(400, { error: 'No rating specified!' });
		} else if(req.body.rating < 1 || req.body.rating > 5){
			res.send(400, { error: 'Rating invalid!' });
		} else {
			rateGame(req.body.gameId, req.session.user.name, ~~req.body.rating, function(rating){
				res.send(200, rating);
			}, function(err){
				log(err);
				res.send(500, { message: 'An unknown error occurred!' });
			});
		}
	};
	
	this.getRating = function(req, res){
		if(!req.query.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			getRating(req.query.gameId, req.session.user.name, function(rating){
				res.send(200, rating);
			}, function(err){
				log(err);
				res.send(404, { message: 'No rating from this user for this game found!' });
			});
		}
	};
	
	
	this.getGameRating = function(req, res){
		if(!req.query.gameId){
			res.send(400, { error: 'No game id specified!' });
		} else {
			getGameRating(req.query.gameId, false, function(rating){
				res.send(200, rating);
			}, function(err){
				log(err);
				res.send(404, { message: 'No rating from this user for this game found!' });
			});
		}
	};
};

module.exports = ratings;