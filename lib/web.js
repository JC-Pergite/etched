'use strict';

const express = require('express');
const http = require('http');
const Server = http.Server;

const plugin = {
	attach: function (options) { var app = this;
		app.web = express();
		app.http = new Server(app.web);
		app.io = require('socket.io')(app.http);

		app.web.use(require('cookie-parser')());
		app.web.use(require('body-parser').urlencoded({ extended: true }));
		app.web.use(require('express-session')({ secret: app.config.get('web').secret, resave: true, saveUninitialized: true }));

		app.io.use((socket, next) => {
			let query = socket.handshake.query;
			if (query.session_token) {
				app.db.users.find({
					session_token: (new Buffer(query.session_token, 'base64'))
				}, {
					password_digest: 0,
					session_token: 0
				})
				.limit(1)
				.next((err, user) => {
					if (!user){
						next(new Error('Invalid session token'));
					}
					else{
						//user.password_digest = void(0);
						socket.user = user;
						next();
					}
				});				
			} else {
				next(new Error('No session token passed'));
			}
		});	

		app.web.use((req, res, next) => {
			if (!req.cookies.session_token)
				return next();
			app.db.users.find({
				session_token: (new Buffer(req.cookies.session_token, 'base64'))
			})
			.limit(1)
			.next((err, user) => {
				req.user = user;
				next();
			});
		});

		app.web.get('/', (req, res,next) => {
			if (!req.user) {
				res.redirect('/signup.html')
			} else {
				next();
			}
		});

		app.web.use('/', express.static(`${__dirname}/../public`));

	},
	init: function (done) {  var app = this;
		var port = parseFloat(process.env.PORT) || 3000;
		app.http.listen(port, (error) => {
			if (!error) {
				app.log.info(`listening on port ${port}`);
			}
			done(error);
		})
	},
	detach: function () {  var app = this;

	}
};

module.exports = plugin;