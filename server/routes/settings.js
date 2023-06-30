import express from 'express';
import { ObjectId } from 'mongodb';

import { isAdmin } from './user.js';

const router = express.Router();

let db;

export function init(database) {
	db = database;
}

router.get('/get/:setting', async (req, res) => {
	if (!req.params.setting) {
		res.status(400).send({ error: 'No setting id specified!' });
	} else {
		try {
			const setting = await db.collection('settings').findOne({ settingId: req.params.setting });
			if (setting) {
				res.status(200).send(setting.value);
			} else {
				res.status(404).send(null);
			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.get('/set/:setting/:value', isAdmin, async (req, res) => {
	if (!req.params.setting) {
		res.status(400).send({ error: 'No setting id specified!' });
	} else if (!req.params.value) {
		res.status(400).send({ error: 'No value specified!' });
	} else {
		try {
			await db.collection('settings').updateOne({ settingId: req.params.setting }, { $set: { value: req.params.value } }, { upsert: true });
			res.send();
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

export default router;
