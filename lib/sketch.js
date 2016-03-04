'use strict';
const async = require('async');
const plugin = {
	attach: function (options) { var app = this;
		app.io.use((socket, next) => {
			socket.on('user.save', (params) => {
				app.db.users.update({
					_id: socket.user._id
				}, { $set: { color: params.color } }, { multi: false, upsert: false }, (error) => {

				});
			});
			socket.on('user', (callback) => callback(socket.user))
			socket.on('move', (context, x, y, color) => {
				let movement = {
					context,
					x,
					y,
					color,
					user_id: socket.user._id
				};

				app.db.movements.save(movement);

				socket.broadcast.emit('move', context, x, y, color);
			});

			socket.on('replay', () => {
				var cursor = app.db.movements.find({
					//user_id: socket.user._id
				});

				var movement = false;
				async.until((() => movement === null), (next) => {
					cursor.next((error, $movement) => {
						movement = $movement;
						if (error || !movement)
							return next(error);

						socket.emit('move', movement.context, movement.x, movement.y, movement.color);

						next();
					});
				}, (error) => {

				});
			});

			next();
		});	
	},
	init: function (done) {  var app = this;
		done();
	},
	detach: function () {  var app = this;

	}
};
module.exports = plugin;