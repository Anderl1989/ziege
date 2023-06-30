import express from 'express';
import { ObjectId } from 'mongodb';
import fs from 'node:fs/promises';

import { isValid, isAdmin } from './user.js';

const router = express.Router();

const DEFAULT_GAME_COUNT = 12;
const DEFAULT_GAME_ORDER = 'rating';

let db;

export function init(database) {
	db = database;
}

async function fsExists(path) {
	try {
		const stat = await fs.stat(path);
		return true;
	} catch (err) {
		return false;
	}
}

export async function updateScreenshots() {
	const gameInfos = await db.collection('gameInfo').find({}).toArray();

	try {
		if (!(await fsExists('../webapp/userContent/'))) {
			await fs.mkdir('../webapp/userContent/')
		}

		if (!(await fsExists('../webapp/userContent/screenshots/'))) {
			await fs.mkdir('../webapp/userContent/screenshots/')
		}

		const promises = gameInfos.map(async (gameInfo) => {
			if (gameInfo && typeof gameInfo.img !== 'undefined' && gameInfo.img.indexOf('png;base64') !== -1) {
				console.log('Updating screenshot of game with id', gameInfo._id);

				const url = `userContent/screenshots/${gameInfo._id}.png`;
				const base64Data = gameInfo.img.replace(/^data:image\/png;base64,/, '');

				await fs.writeFile(`../webapp/${url}`, base64Data, 'base64');

				const update = {
					$set: { img: url, }
				};

				try {
					await db.collection('gameInfo').updateOne({ _id: gameInfo._id }, update);
					console.log('Updating screenshot success');
				} catch (err) {
					console.log('updating screenshot failed', err);
				}
			}
		});

		await Promise.all(promises);
		console.log('Screenshots updated.');
	} catch (err) {
		console.log('Error updating screenshots', err);
	}
}

export async function isGameAuthor(req, res, next) {
	var gameId = req.query.gameId || req.body.gameId;
	if (!gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const gameInfo = await db.collection('gameInfo').findOne({ _id: new ObjectId(gameId) });
			if (gameInfo) {
				if (gameInfo.author === req.session.user.name || req.session.user.admin){
					next();
				} else {
					res.status(403).send({ message: 'The user is not the author of this game!' });
				}
			} else {
				res.status(404).send({ message: 'No game with this id was found!' });
			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
};



router.post('/addGame', isValid, async (req, res) => {
	const gameName = req.body.name || `Neues Spiel von ${req.session.user.name}`;

	try {
		const result = await db.collection('gameInfo').insertOne({
			author: req.session.user.name,
			isPublic: 'false',
			creationDate: new Date().getTime(),
			modifiedDate: new Date().getTime(),
			name: gameName,
			removed: 'false',
			img: '',
			tilesets: {},
		});
		const gameInfo = await db.collection('gameInfo').findOne({ _id: result.insertedId });
		const gameId = gameInfo._id;

		await db.collection('gameEntityLayer').insertOne({
			gameId: gameId,
			entities: [],
		});

		await db.collection('gameBoxLayer').insertOne({
			gameId: gameId,
			layer: 0,
			boxes: {},
		});

		await db.collection('gameBoxLayer').insertOne({
			gameId: gameId,
			layer: 1,
			boxes: {},
		});

		await db.collection('gameBoxLayer').insertOne({
			gameId: gameId,
			layer: 2,
			boxes: {},
		});

		await db.collection('gameOptions').insertOne({
			gameId: gameId,
			options: {},
		});

		res.status(201).send(gameId);
	} catch (err) {
		console.log('ERR', err);
		res.status(500).send({ message: 'An unknown error occurred!' });
	}
});

router.get('/getOwnGames', isValid, async (req, res) => {
	// const gameCount = req.query.count || DEFAULT_GAME_COUNT;
	// const page = req.query.page || 0;
	const isPublic = req.query.isPublic || 'false';

	try {
		const games = await db.collection('gameInfo').find({ author: req.session.user.name, isPublic, removed: 'false' }).sort({ name: 1 }).toArray();

		res.send({
			total: games.length,
			count: games.length,
			page: 0,
			games,
		});
	} catch (err) {
		console.log('ERR', err);
		res.status(500).send({ message: 'An unknown error occurred!' });
	}
});

router.get('/getPublicGames', async (req, res) => {
	const gameCount = req.query.count || DEFAULT_GAME_COUNT;
	const orderBy = req.query.orderBy || DEFAULT_GAME_ORDER;
	const page = req.query.page || 0;

	const query = {
		removed: 'false',
		isPublic: 'true',
	};

	let sort = {};
	switch(orderBy) {
		case 'author':
			sort = { 'author': 1, 'name': 1 };
			break;
		case 'name':
			sort = { 'name': 1 };
			break;
		case 'creationDate':
			sort = { 'creationDate': -1 };
			break;
		case 'modifiedDate':
			sort = { 'modifiedDate': -1 };
			break;
		case 'rating':
		default:
			sort = { 'rating.valid': -1, 'rating.total': -1 };
			break;
	}

	try {
		const total = await db.collection('gameInfo').count(query);

		const games = await db.collection('gameInfo').find(query)
			.sort(sort).skip(gameCount*page).limit(gameCount)
			.toArray();

		res.send({
			total,
			count: gameCount,
			page,
			games,
		})
	} catch (err) {
		console.log('ERR', err);
		res.status(500).send({ message: 'An unknown error occurred!' });
	}
});

router.get('/getGameInfoWithTileset', async (req, res) => {
	try {
		const games = await db.collection('gameInfo').find({ tilesetShared: 'true', removed: 'false' }).toArray();
		res.send(games);
	} catch (err) {
		console.log('ERR', err);
		res.status(500).send({ message: 'An unknown error occurred!' });
	}
});

router.get('/getAllGames', isAdmin, async (req, res) => {
	// const gameCount = req.query.count || DEFAULT_GAME_COUNT;
	// const page = req.query.page || 0;
	const isPublic = req.query.isPublic || 'false';

	try {
		const games = await db.collection('gameInfo').find({}).sort({ name: 1 }).toArray();

		res.send({
			total: games.length,
			count: games.length,
			page: 0,
			games,
		});
	} catch (err) {
		console.log('ERR', err);
		res.status(500).send({ message: 'An unknown error occurred!' });
	}
});

async function getGameInfo(req, res) {
	if (!req.query.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const gameInfo = await db.collection('gameInfo').findOne({ _id: new ObjectId(req.query.gameId) });
			if (gameInfo) {
				res.send(gameInfo);
			} else {
				res.status(404).send({ message: 'No game with this id was found!' });
			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
}

router.get('/getGameInfo', getGameInfo);

router.get('/getGameInfoForEdit', isValid, isGameAuthor, getGameInfo);

router.get('/getGameEntityLayer', async (req, res) => {
	if (!req.query.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const gameEntityLayer = await db.collection('gameEntityLayer').findOne({ gameId: new ObjectId(req.query.gameId) });
			if (gameEntityLayer) {
				res.send(gameEntityLayer);
			} else {
				res.status(404).send({ message: 'No gameEntityLayer with this id was found!' });
			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.get('/getGameBoxLayer', async (req, res) => {
	if (!req.query.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else if (!req.query.layer) {
		res.status(400).send({ error: 'No layer specified!' });
	} else {
		try {
			const gameBoxLayer = await db.collection('gameBoxLayer').findOne({ gameId: new ObjectId(req.query.gameId), layer: parseInt(req.query.layer, 10) });
			if (gameBoxLayer) {
				res.send(gameBoxLayer);
			} else {
				res.status(404).send({ message: 'No gameBoxLayer with this id was found!' });
			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.get('/getGameOptions', async (req, res) => {
	if (!req.query.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const gameOptions = await db.collection('gameOptions').findOne({ gameId: new ObjectId(req.query.gameId) });
			if (gameOptions) {
				res.send(gameOptions);
			} else {
				res.status(404).send({ message: 'No gameOptions with this id was found!' });
			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.put('/updateGameEntityLayer', isValid, isGameAuthor, async (req, res) => {
	if (!req.body.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const gameEntityLayer = await db.collection('gameEntityLayer').findOne({ gameId: new ObjectId(req.body.gameId) });
			if (gameEntityLayer) {
				const update = {
					$set: {
						entities: req.body.entities || [],
					}
				};

				await db.collection('gameEntityLayer').updateOne({ gameId: new ObjectId(req.body.gameId) }, update);

				res.send();
			} else {
				res.status(404).send({ message: 'No gameEntityLayer with this id was found!' });
			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.put('/updateGameBoxLayer', isValid, isGameAuthor, async (req, res) => {
	if (!req.body.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else if (req.body.layer !== 0 && !req.body.layer) {
		res.status(400).send({ error: 'No layer specified!' });
	} else {
		try {
			const gameBoxLayer = await db.collection('gameBoxLayer').findOne({ gameId: new ObjectId(req.body.gameId), layer: parseInt(req.body.layer, 10) });
			if (gameBoxLayer) {
				const update = {
					$set: {
						boxes: req.body.boxes || {},
					}
				};

				await db.collection('gameBoxLayer').updateOne({ gameId: new ObjectId(req.body.gameId), layer: parseInt(req.body.layer, 10) }, update);

				res.send();
			} else {
				res.status(404).send({ message: 'No gameBoxLayer with this id was found!' });
			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.put('/updateGameOptions', isValid, isGameAuthor, async (req, res) => {
	if (!req.body.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const gameOptions = await db.collection('gameOptions').findOne({ gameId: new ObjectId(req.body.gameId) });
			if (gameOptions) {
				const update = {
					$set: {
						options: req.body.options || [],
					}
				};

				await db.collection('gameOptions').updateOne({ gameId: new ObjectId(req.body.gameId) }, update);

				res.send();
			} else {
				res.status(404).send({ message: 'No gameOptions with this id was found!' });
			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.put('/updateGameInfo', isValid, isGameAuthor, async (req, res) => {
	if (!req.body.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const gameInfo = await db.collection('gameInfo').findOne({ _id: new ObjectId(req.body.gameId) });
			if (gameInfo) {
				let url;
				if (req.body.gameInfo.img) {
					if (!(await fsExists('../webapp/userContent/'))) {
						await fs.mkdir('../webapp/userContent/')
					}

					if (!(await fsExists('../webapp/userContent/screenshots/'))) {
						await fs.mkdir('../webapp/userContent/screenshots/')
					}

					url = `userContent/screenshots/${gameInfo._id}.png`;
					const base64Data = req.body.gameInfo.img.replace(/^data:image\/png;base64,/, '');

					await fs.writeFile(`../webapp/${url}`, base64Data, 'base64');
				}

				const update = {
					$set: {
						name: req.body.gameInfo.name || gameInfo.name,
						modifiedDate: req.body.gameInfo.modifiedDate || gameInfo.modifiedDate,
						isPublic: req.body.gameInfo.isPublic || gameInfo.isPublic,
						removed: req.body.gameInfo.removed || gameInfo.removed,
						tilesets: req.body.gameInfo.tilesets || gameInfo.tilesets,
						img: url || gameInfo.img,
					}
				};

				await db.collection('gameInfo').updateOne({ _id: new ObjectId(req.body.gameId) }, update);

				res.send();
			} else {
				res.status(404).send({ message: 'No gameInfo with this id was found!' });
			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});


export default router;
