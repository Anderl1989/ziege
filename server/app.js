/* SETTINGS */
var PORT = 8080;
process.argv.forEach(function (val, index, array) {
	if(val.toLowerCase().indexOf("port=") != -1){
		PORT = val.split("=")[1]; 
	}
});
var SESSION_SECRET = '1234567890QWERTY';

/* IMPORTS */
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var log = require('./log');
var dbObj = require('./db');
var db = dbObj.db;
var mongojs = dbObj.mongojs;
var user = require('./routes/user').init(db, mongojs);
var game = require('./routes/game').init(db, mongojs);
var tileset = require('./routes/tileset').init(db, mongojs);
var ratings = require('./routes/ratings').init(db, mongojs);

/* APP INITIALIZATION */
var app = express();

/* MIDDLEWARE */
app.use(bodyParser()); //parses body arguments
app.use(cookieParser()); //required for session management
app.use(session({secret: SESSION_SECRET})); //enables session management
app.use(function(req, res, next){ //adds a simple logger
	console.log('%s %s', req.method, req.url);
	next();
});
app.use(function(req, res, next) { //adds CORS headers
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	next();
});

/* UPDATING */
user.addAdminUser();
game.updateScreenshots();
tileset.updateTilesets();


/* ROUTES */
app.get('/rest/user/isLoggedIn', user.isLoggedIn);
app.get('/rest/user/isLoggedInAsAdmin', user.isLoggedInAsAdmin);
app.get('/rest/user/getAllUsers', user.isAdmin, user.getAllUsers);
app.post('/rest/user/register', user.register);
app.post('/rest/user/login', user.login);
app.post('/rest/user/logout', user.isValid, user.logout);
app.post('/rest/user/updateUser', user.isValid, user.updateUser);

app.post('/rest/game/addGame', user.isValid, game.addGame);
app.get('/rest/game/getOwnGames', user.isValid, game.getOwnGames);
app.get('/rest/game/getPublicGames', game.getPublicGames);
app.get('/rest/game/getGameInfoWithTileset', game.getGameInfoWithTileset);
app.get('/rest/game/getAllGames', user.isAdmin, game.getAllGames);
app.get('/rest/game/getGameInfo', game.getGameInfo);
//app.get('/rest/game/getGameInfoForEdit', user.isValid, game.getGameInfoForEdit);
app.get('/rest/game/getGameInfoForEdit', user.isValid, game.isGameAuthor, game.getGameInfo);
app.get('/rest/game/getGameEntityLayer', game.getGameEntityLayer);
app.get('/rest/game/getGameBoxLayer', game.getGameBoxLayer);
app.get('/rest/game/getGameOptions', game.getGameOptions);
app.put('/rest/game/updateGameEntityLayer', user.isValid, game.isGameAuthor, game.updateGameEntityLayer);
app.put('/rest/game/updateGameBoxLayer', user.isValid, game.isGameAuthor, game.updateGameBoxLayer);
app.put('/rest/game/updateGameOptions', user.isValid, game.isGameAuthor, game.updateGameOptions);
app.put('/rest/game/updateGameInfo', user.isValid, game.isGameAuthor, game.updateGameInfo);

app.post('/rest/tileset/addTilesetEntity', user.isValid, game.isGameAuthor, tileset.addTilesetEntity);
app.post('/rest/tileset/addTilesetBox', user.isValid, game.isGameAuthor, tileset.addTilesetBox);
app.post('/rest/tileset/addTilesetBackgroundImage', user.isValid, game.isGameAuthor, tileset.addTilesetBackgroundImage);
app.post('/rest/tileset/updateTilesetEntity', user.isValid, game.isGameAuthor, tileset.updateTilesetEntity);
app.post('/rest/tileset/updateTilesetBox', user.isValid, game.isGameAuthor, tileset.updateTilesetBox);
app.post('/rest/tileset/updateTilesetBackgroundImage', user.isValid, game.isGameAuthor, tileset.updateTilesetBackgroundImage);
app.post('/rest/tileset/removeTilesetEntity', user.isValid, game.isGameAuthor, tileset.removeTilesetEntity);
app.post('/rest/tileset/removeTilesetBox', user.isValid, game.isGameAuthor, tileset.removeTilesetBox);
app.post('/rest/tileset/removeTilesetBackgroundImage', user.isValid, game.isGameAuthor, tileset.removeTilesetBackgroundImage);
app.post('/rest/tileset/shareTileset', user.isValid, game.isGameAuthor, tileset.shareTileset);
app.get('/rest/tileset/getTileset', tileset.getTileset);
app.get('/rest/tileset/getPublicTileset', tileset.getPublicTileset);

app.get('/rest/ratings/getGameRating', ratings.getGameRating);
app.get('/rest/ratings/getRating', user.isValid, ratings.getRating);
app.put('/rest/ratings/rateGame', user.isValid, ratings.rateGame);

/* TODO: remove reset method on release */
/*app.use('/rest/reset', function(req, res){
	db.users.remove();
	db.gameInfo.remove();
	db.gameEntityLayer.remove();
	db.gameBoxLayer.remove();
	db.gameOptions.remove();
	db.tilesetInfo.remove();
	db.tilesetEntity.remove();
	db.tilesetBox.remove();
	db.tilesetBackgroundImage.remove();
	res.send(200, { message: 'Database reset!' });
});*/

app.use('', express.static(__dirname + '/../webapp'));

/* APP START */
app.listen(PORT);
console.log('Express started on port ' + PORT);