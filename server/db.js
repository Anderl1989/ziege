var databaseURI = "mongodb://admin@localhost:27017/ziege";
var collections = ["users", "gameInfo", "gameEntityLayer", "gameBoxLayer", "gameOptions", "tilesetInfo", "tilesetEntity", "tilesetBox", "tilesetBackgroundImage", "ratings", "settings"];
var mongojs = require("mongojs");
var db = mongojs.connect(databaseURI, collections);

module.exports = {db: db, mongojs: mongojs};