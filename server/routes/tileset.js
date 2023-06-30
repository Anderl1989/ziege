import express from 'express';
import { ObjectId } from 'mongodb';

import { isValid } from './user.js';
import { isGameAuthor } from './game.js';

const router = express.Router();

let db;

export function init(database) {
	db = database;
}

export async function updateTilesets() {
	try {
		await db.collection('tilesetBox').updateMany({ isPublic: { $exists: false } }, { $set: { isPublic: 'false' } });
		await db.collection('tilesetBox').updateMany({ removed: { $exists: false } }, { $set: { removed: 'false' } });

		await db.collection('tilesetEntity').updateMany({ isPublic: { $exists: false } }, { $set: { isPublic: 'false' } });
		await db.collection('tilesetEntity').updateMany({ removed: { $exists: false } }, { $set: { removed: 'false' } });

		await db.collection('tilesetBackgroundImage').updateMany({ isPublic: { $exists: false } }, { $set: { isPublic: 'false' } });
		await db.collection('tilesetBackgroundImage').updateMany({ removed: { $exists: false } }, { $set: { removed: 'false' } });

		console.log('Tilesets updated.')
	} catch (err) {
		console.log('Error updating tilesets', err);
	}
}

router.post('/addTilesetEntity', isValid, isGameAuthor, async (req, res) => {
	if (!req.body.entity) {
		res.status(400).send({ error: 'No entity specified!' });
	} else if (!req.body.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const result = await db.collection('tilesetEntity').insertOne({
				gameId: req.body.gameId,
				entity: req.body.entity,
				isPublic: 'false',
				removed: 'false',
			});
			const createdElement = await db.collection('tilesetEntity').findOne({ _id: result.insertedId });
			res.status(201).send(createdElement);
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.post('/addTilesetBox', isValid, isGameAuthor, async (req, res) => {
	if (!req.body.box) {
		res.status(400).send({ error: 'No box specified!' });
	} else if (!req.body.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const result = await db.collection('tilesetBox').insertOne({
				gameId: req.body.gameId,
				box: req.body.box,
				isPublic: 'false',
				removed: 'false',
			});
			const createdElement = await db.collection('tilesetBox').findOne({ _id: result.insertedId });
			res.status(201).send(createdElement);
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.post('/addTilesetBackgroundImage', isValid, isGameAuthor, async (req, res) => {
	if (!req.body.backgroundImage) {
		res.status(400).send({ error: 'No background image specified!' });
	} else if (!req.body.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const result = await db.collection('tilesetBackgroundImage').insertOne({
				gameId: req.body.gameId,
				backgroundImage: req.body.backgroundImage,
				isPublic: 'false',
				removed: 'false',
			});
			const createdElement = await db.collection('tilesetBackgroundImage').findOne({ _id: result.insertedId });
			res.status(201).send(createdElement);
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.post('/updateTilesetEntity', isValid, isGameAuthor, async (req, res) => {
	if (!req.body.entityObject) {
		res.status(400).send({ error: 'No entity object specified!' });
	} else if (!req.body.id) {
		res.status(400).send({ error: 'No entity id specified!' });
	} else if (!req.body.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const query = {
				_id: new ObjectId(req.body.id),
				removed: 'false',
				gameId: req.body.gameId,
			};

			const element = await db.collection('tilesetEntity').findOne(query);
			if (element) {
				const update = {
					$set: {
						entity: req.body.entityObject.entity || element.entity,
						isPublic: req.body.entityObject.isPublic === 'true' ? req.body.entityObject.isPublic : element.isPublic,
					}
				};

				await db.collection('tilesetEntity').updateOne(query, update);
				const updatedElement = await db.collection('tilesetEntity').findOne(query);

				res.send(updatedElement);
			} else {
				res.status(404).send({ message: 'No tilesetEntity with this id was found!' });
			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.post('/updateTilesetBox', isValid, isGameAuthor, async (req, res) => {
	if (!req.body.boxObject) {
		res.status(400).send({ error: 'No box object specified!' });
	} else if (!req.body.id) {
		res.status(400).send({ error: 'No box id specified!' });
	} else if (!req.body.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const query = {
				_id: new ObjectId(req.body.id),
				removed: 'false',
				gameId: req.body.gameId,
			};

			const element = await db.collection('tilesetBox').findOne(query);
			if (element) {
				const update = {
					$set: {
						box: req.body.boxObject.box || element.box,
						isPublic: req.body.boxObject.isPublic === 'true' ? req.body.boxObject.isPublic : element.isPublic,
					}
				};

				await db.collection('tilesetBox').updateOne(query, update);
				const updatedElement = await db.collection('tilesetBox').findOne(query);

				res.send(updatedElement);
			} else {
				res.status(404).send({ message: 'No tilesetBox with this id was found!' });
			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.post('/updateTilesetBackgroundImage', isValid, isGameAuthor, async (req, res) => {
	if (!req.body.backgroundImageObject) {
		res.status(400).send({ error: 'No background image object specified!' });
	} else if (!req.body.id) {
		res.status(400).send({ error: 'No background image id specified!' });
	} else if (!req.body.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const query = {
				_id: new ObjectId(req.body.id),
				removed: 'false',
				gameId: req.body.gameId,
			};

			const element = await db.collection('tilesetBackgroundImage').findOne(query);
			if (element) {
				const update = {
					$set: {
						backgroundImage: req.body.backgroundImageObject.backgroundImage || element.backgroundImage,
						isPublic: req.body.backgroundImageObject.isPublic === 'true' ? req.body.backgroundImageObject.isPublic : element.isPublic,
					}
				};

				await db.collection('tilesetBackgroundImage').updateOne(query, update);
				const updatedElement = await db.collection('tilesetBackgroundImage').findOne(query);

				res.send(updatedElement);
			} else {
				res.status(404).send({ message: 'No tilesetBackgroundImage with this id was found!' });
			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.post('/removeTilesetEntity', isValid, isGameAuthor, async (req, res) => {
	if (!req.body.id) {
		res.status(400).send({ error: 'No entity id specified!' });
	} else if (!req.body.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const query = {
				_id: new ObjectId(req.body.id),
				removed: 'false',
				gameId: req.body.gameId,
			};

			const element = await db.collection('tilesetEntity').findOne(query);
			if (element) {
				const update = {
					$set: {
						removed: 'true',
					}
				};

				await db.collection('tilesetEntity').updateOne(query, update);

				res.send();
			} else {
				res.status(404).send({ message: 'No tilesetEntity with this id was found!' });
			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.post('/removeTilesetBox', isValid, isGameAuthor, async (req, res) => {
	if (!req.body.id) {
		res.status(400).send({ error: 'No box id specified!' });
	} else if (!req.body.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const query = {
				_id: new ObjectId(req.body.id),
				removed: 'false',
				gameId: req.body.gameId,
			};

			const element = await db.collection('tilesetBox').findOne(query);
			if (element) {
				const update = {
					$set: {
						removed: 'true',
					}
				};

				await db.collection('tilesetBox').updateOne(query, update);

				res.send();
			} else {
				res.status(404).send({ message: 'No tilesetBox with this id was found!' });
			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.post('/removeTilesetBackgroundImage', isValid, isGameAuthor, async (req, res) => {
	if (!req.body.id) {
		res.status(400).send({ error: 'No background image id specified!' });
	} else if (!req.body.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const query = {
				_id: new ObjectId(req.body.id),
				removed: 'false',
				gameId: req.body.gameId,
			};

			const element = await db.collection('tilesetBackgroundImage').findOne(query);
			if (element) {
				const update = {
					$set: {
						removed: 'true',
					}
				};

				await db.collection('tilesetBackgroundImage').updateOne(query, update);

				res.send();
			} else {
				res.status(404).send({ message: 'No tilesetBackgroundImage with this id was found!' });
			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.post('/shareTileset', isValid, isGameAuthor, async (req, res) => {
	if (!req.body.tilesetName) {
		res.status(400).send({ error: 'No tileset name specified!' });
	} else if (!req.body.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const gameQuery = { _id: new ObjectId(req.body.gameId) };
			const tsQuery = { gameId: req.body.gameId };
			const gameUpdate = {
				$set: {
					tilesetName: req.body.tilesetName,
					tilesetShared: 'true',
				},
			};
			const tsUpdate = {
				$set: {
					isPublic: 'true',
				},
			};
			await db.collection('tilesetBox').updateMany(tsQuery, tsUpdate);
			await db.collection('tilesetEntity').updateMany(tsQuery, tsUpdate);
			await db.collection('tilesetBackgroundImage').updateMany(tsQuery, tsUpdate);
			await db.collection('gameInfo').updateOne(gameQuery, gameUpdate);

			res.send();
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.get('/getTileset', async (req, res) => {
	if (!req.query.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const query = { gameId: req.query.gameId, removed: 'false' };
			const boxes = await db.collection('tilesetBox').find(query).toArray();
			const entities = await db.collection('tilesetEntity').find(query).toArray();
			const bgImages = await db.collection('tilesetBackgroundImage').find(query).toArray();

			res.send({
				box: boxes,
				entity: entities,
				backgroundImage: bgImages,
			});
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.get('/getPublicTileset', async (req, res) => {
	if (!req.query.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const query = { gameId: req.query.gameId, removed: 'false', isPublic: 'true' };
			const boxes = await db.collection('tilesetBox').find(query).toArray();
			const entities = await db.collection('tilesetEntity').find(query).toArray();
			const bgImages = await db.collection('tilesetBackgroundImage').find(query).toArray();

			res.send({
				box: boxes,
				entity: entities,
				backgroundImage: bgImages,
			});
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});


export default router;
