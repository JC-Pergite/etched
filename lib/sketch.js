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

			socket.on('user.remove', (callback) => {
				app.db.movements.remove({ user_id: socket.user._id }, callback);
				socket.broadcast.emit('reload');
			});

			socket.on('user', (callback) => callback(socket.user))
			socket.on('move', (context, x, y, color) => {
				let movement = {
					context,
					x,
					y,
					color,
					user_id: socket.user._id,
					date: new Date()
				};

				app.db.movements.save(movement);

				socket.broadcast.emit('move', context, x, y, color);
			});

			socket.on('reverse', (callback) => {
				var cursor = app.db.movements.find({
					user_id: socket.user._id
				});

				// Mirror
				// var movement = false;
				// async.until((() => movement === null), (next) => {
				// 	cursor.next((error, $movement) => {
				// 		movement = $movement;
				// 		if (error || !movement)
				// 			return next(error);

						
				// 		movement.x = movement.x * -1;
				// 		movement.y = movement.y * -1;

				// 		console.log()

				// 		app.db.movements.save(movement, next);

				// 	});
				// }, (error) => {
				// 	callback(error);
				// });		

				app.db.movements
					.find({}, { _id: 1 })
					.sort({ date: -1 })
					.limit(1) // <-- Change to change the amount of steps to remove
					.toArray((error, arr) => {
						async.each(arr, (move, next) => {
							app.db.movements.remove({ _id: move._id }, next)
						}, callback);
					});
			});

			socket.on('replay', (delay) => {
				delay = delay || 0;
				var cursor = app.db.movements.find({
					//user_id: socket.user._id
				});

				var movement = false;
				const clearReplay = () => { 
					movement = null;
					app.db.movements.remove({ user_id: socket.user._id }, () => {
						socket.emit('refresh');
					});
				};
				socket.once('move', clearReplay);
				async.until((() => movement === null), (next) => {
					cursor.next((error, $movement) => {
						movement = $movement;
						if (error || !movement)
							return next(error);

						socket.emit('move', movement.context, movement.x, movement.y, movement.color);
						
						if (movement.user_id.toString() === socket.user._id.toString()){
							setTimeout(next, delay);
						}
						else {
							next();
						}
					});
				}, (error) => {
					socket.removeListener('move', clearReplay)
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