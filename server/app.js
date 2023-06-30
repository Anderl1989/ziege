import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import connectDB from './db.js';

import user, { init as initUser, addAdminUser } from './routes/user.js';
import game, { init as initGame, updateScreenshots } from './routes/game.js';
import tileset, { init as initTileset, updateTilesets }  from './routes/tileset.js';
import ratings, { init as initRatings, updateGameRatings }  from './routes/ratings.js';
import settings, { init as initSettings }  from './routes/settings.js';

const mongoUrl = process.env.DB || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'ziege';
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const secret = process.env.SESSION_SECRET || '1234567890QWERTY';

const db = await connectDB(mongoUrl, dbName);

initUser(db);
initGame(db);
initTileset(db);
initRatings(db);
initSettings(db);

/* APP INITIALIZATION */
const app = express();

/* MIDDLEWARE */
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser()); // required for session management
app.use(session({
	secret,
  resave: false,
  saveUninitialized: true,
})); // enables session management
app.use(function(req, res, next){ // adds a simple logger
	console.log(req.method, req.url);
	next();
});
app.use(function(req, res, next) { // adds CORS headers
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	next();
});

/* UPDATING */
await addAdminUser();
await updateScreenshots();
await updateTilesets();
await updateGameRatings();

/* ROUTES */
app.use('/rest/user', user);
app.use('/rest/game', game);
app.use('/rest/tileset', tileset);
app.use('/rest/ratings', ratings);
app.use('/rest/settings', settings);

app.use(express.static('../webapp'));

/* APP START */
app.listen(port, () => {
	console.log('Express started on port ' + port);
});
