import express from 'express';
import bcrypt from 'bcrypt';

const router = express.Router();

let db;

export function init(database) {
	db = database;
}

export function isValid(req, res, next) {
	if (req.session.user) {
		next();
	} else {
		res.status(403).send({ error: 'User is not logged in!' });
	}
};

export function isAdmin(req, res, next) {
	if (req.session.user && req.session.user.admin) {
		next();
	} else {
		res.status(403).send({ error: 'User is not an administrator!' });
	}
};

export async function addAdminUser() {
	try {
		const existingUser = await db.collection('accounts').findOne({ admin: true });
		if (!existingUser) {
			const user = {
				name: 'Admin',
				mail: '',
				admin: true,
				hash: await bcrypt.hash('admin', 10)
			}

			const result = await db.collection('accounts').insertOne(user);
			const createdUser = await db.collection('accounts').findOne({ _id: result.insertedId });

			console.log('Admin user created', createdUser);
		} else {
			console.log('Admin user exists, skipping creation.')
		}
	} catch (err) {
		console.log('Creating Admin user failed', err);
	}
};

router.get('/isLoggedIn', (req, res) => {
	if (req.session.user) {
		res.status(200).send({ loggedIn: true, name: req.session.user.name });
	} else {
		res.status(200).send({ loggedIn: false });
	}
});

router.get('/isLoggedInAsAdmin', (req, res) => {
	if (req.session.user) {
		if (req.session.user.admin) {
			res.send({ loggedIn: true, isAdmin: true, name: req.session.user.name });
		} else {
			res.send({ loggedIn: true, isAdmin: false, name: req.session.user.name });
		}
	} else {
		res.send({ loggedIn: false, isAdmin: false });
	}
});

router.get('/getAllUsers', isAdmin, async (req, res) => {
	try {
		const users = await db.collection('accounts').find({}).toArray();
		res.send({ users: users });
	} catch (err) {
		console.log('ERR', err);
		res.status(500).send({ message: 'An unknown error occurred!' });
	}
});

router.post('/register', async (req, res) => {
	if (!req.body.name || !req.body.password || !req.body.mail) {
		res.status(400).send({ error: 'User name, password or email missing!' });
	} else {
		try {
			const existingUser = await db.collection('accounts').findOne({ name: req.body.name });
			if (existingUser) {
				res.status(409).send({ error: 'User already exists!' });
			} else {
				const user = {
					name: req.body.name,
					mail: req.body.mail,
					hash: await bcrypt.hash(req.body.password, 10),
				};

				const result = await db.collection('accounts').insertOne(user);
				const createdUser = await db.collection('accounts').findOne({ _id: result.insertedId });

				console.log('User created', createdUser);

				req.session.regenerate(() => {
					req.session.user = createdUser;
					res.status(201).send(createdUser);
				});

			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.post('/login', async (req, res) => {
	if (!req.body.name || !req.body.password) {
		res.status(400).send({ error: 'User name or password missing!' });
	} else {
		try {
			const user = await db.collection('accounts').findOne({ name: req.body.name });

			if (user) {
				const match = await bcrypt.compare(req.body.password, user.hash);

				if (match) {
					req.session.regenerate(() => {
						req.session.user = user;
						res.send(user);
					});
				} else {
					res.status(403).send({ error: 'Password invalid!' });
				}
			} else {
				res.status(404).send({ error: 'User not found!' });
			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

router.post('/logout', isValid, (req, res) => {
	req.session.destroy(() => {
		res.send({ message: 'User logged out!' });
	});
});

router.post('/updateUser', isValid, async (req, res) => {
	if (!req.body.password) {
		res.status(403).send({ error: 'Password missing!' });
	} else {

		try {
			const user = await db.collection('accounts').findOne({ name: req.body.name });

			if (user) {
				const match = await bcrypt.compare(req.body.password, user.hash);

				if (match) {
					const update = {
						$set: {
							mail: req.body.mail || user.mail,
							hash: await bcrypt.hash(req.body.newPassword, 10),
						}
					};

					const result = await db.collection('accounts').updateOne({ _id: user._id }, update);
					const updatedUser = await db.collection('accounts').findOne({ _id: user._id });

					console.log('User updated', updatedUser);

					req.session.regenerate(() => {
						req.session.user = updatedUser;
						res.send(updatedUser);
					});

				} else {
					res.status(403).send({ error: 'Password invalid!' });
				}
			} else {
				res.status(404).send({ error: 'User not found!' });
			}
		} catch (err) {
			console.log('ERR', err);
			res.status(500).send({ message: 'An unknown error occurred!' });
		}
	}
});

export default router;
