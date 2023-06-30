import express from 'express';
import { ObjectId } from 'mongodb';

import { isValid } from './user.js';

const router = express.Router();

let db;

export function init(database) {
	db = database;
}

async function getGameRating(gameId, update) {
	const ratings = await db.collection('ratings').find({ gameId: gameId.toString() }).toArray();
	const rating = ratings.reduce((acc, r) => {
		acc.votes += 1;
		acc.sum += r.rating;
		return acc;
	}, { votes: 0, sum: 0, total: 0, valid: false });
	if (rating.votes > 0) rating.total = rating.sum / rating.votes;
	if (rating.votes > 1) rating.valid = true;
	if (update) {
		await db.collection('gameInfo').updateOne({ _id: new ObjectId(gameId.toString()) }, { $set: { rating } });
	}

	return rating;
}

export async function updateGameRatings() {
	try {
		const games = await db.collection('gameInfo').find({}).toArray();
		const promises = games.map((game) => getGameRating(game._id, true));
		await Promise.all(promises);
		console.log('Game ratings updated.');
	} catch (err) {
		console.log('Error updating game ratings', err);
	}
}

router.get('/getGameRating', async (req, res) => {
	if (!req.query.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const rating = await getGameRating(req.query.gameId, false);
			res.status(200).send(rating);
		} catch (err) {
			console.log('ERR', err);
			res.status(404).send({ message: 'No rating for this game found!' });
		}
	}
});

router.get('/getRating', isValid, async (req, res) => {
	if (!req.query.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else {
		try {
			const rating = await db.collection('ratings').findOne({ gameId: req.query.gameId.toString(), userName: req.session.user.name });
			if (rating) {
				res.send(rating);
			} else {
				res.send({ rating: 0 });
			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.put('/rateGame', isValid, async (req, res) => {
	if (!req.body.gameId) {
		res.status(400).send({ error: 'No game id specified!' });
	} else if (!req.body.rating) {
		res.status(400).send({ error: 'No rating specified!' });
	} else if (req.body.rating < 1 || req.body.rating > 5) {
		res.status(400).send({ error: 'Rating invalid!' });
	} else {
		try {
			const query = {
				userName: req.session.user.name,
				gameId: req.body.gameId,
			};
			const update = {
				$set: {
					rating: Math.floor(req.body.rating),
				},
			};
			await db.collection('ratings').updateOne(query, update, { upsert: true });

			const rating = await getGameRating(req.body.gameId, true);
			res.status(200).send(rating);

		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

export default router;
