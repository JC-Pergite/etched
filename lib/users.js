'use strict';
const passport = require('passport');	
const async = require('async');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

const plugin = {
	attach: function (options) { var app = this;
		passport.serializeUser((user, done) => done(null, user._id));
		passport.deserializeUser((_id, done) => app.db.users.find({ _id: _id }).limit(1).next(done));

		passport.use(new LocalStrategy(
			function (username, password, done) {
				/* Check login */
				async.waterfall([
					(callback) => {
						app.db.users.find({
							username: username
						})
						.limit(1)
						.next(callback);
					},
					(user, callback) => {
						if (user) {
							bcrypt.compare(password, user.password_digest, function (err, res) {
								callback(err, user, res);
							});
						} else {
							callback(null, false, false);
						}
					}
				], (error, user, passwordCorrect) => {
					if (user && passwordCorrect)
						done(error, user);
					else 
						done(error, false);
				});
			}
		));	

		app.web.use(passport.initialize());
		app.web.use(passport.session());

		app.web.post('/login', passport.authenticate('local', { failureRedirect: '/login.html' }), (req, res) => {
			var buffer = new Array(16);
			uuid.v4(null, buffer, 0);
			let session_token = Buffer(buffer)
			var user = req.user;
			user.session_token = session_token;
			app.db.users.save(user, () => {
				res.cookie('session_token', session_token.toString('base64'));
				res.redirect('/')
			});
		});
	
		app.web.post('/signup', bodyParser.urlencoded({ extended: false }), (req, res) => {
			async.waterfall([
				($next) => {
					app.db.users
						.find({ username: req.body.username }, { username: 1 })
						.limit(1)
						.next((error, user) => {
							if (user) {
								res.redirect('/login');
								$next(new Error('User already exists'));
							} else {
								$next(null);
							}
						});
				},
				($next) => {
					bcrypt.genSalt(10, function(err, salt) {
						bcrypt.hash(req.body.password, salt, function(err, password_digest) {
							let user = {
								username: req.body.username,
								password_digest: password_digest
							};					

							app.db.users.save(user, (err) => {
								if (err) {
									res.set('content-type', 'text/html').status(500).end(''); // .sendFile(`${__dirname}/../public/error_page.html`);
								} else {
									res.redirect('/');
								}
								$next();
							}); 
						});
					});
				}
			], (error) => {

			});
		});

		app.web.get('/logout', (req, res) => {
			res.cookie('session_token', '')
			res.redirect('/')
		})
	},
	init: function (done) {  var app = this;
		app.on('db.ready', () => {
			app.db.users.ensureIndex({ username: 1 }, { unique: true });
		})
		done();
	},
	detach: function () {  var app = this;

	}
};

module.exports = plugin;