'use strict';

const async = require('async');
const mongodb = require('mongodb');
const mongojs = require('mongojs');
const MongoClient = require('mongodb').MongoClient;

const plugin = {
	attach: function (options) { var app = this;
	},
	init: function (done) {  var app = this;
		const options = app.config.get('database');

		async.waterfall([
			((callback) => MongoClient.connect(options.url, callback)),
			(Db, callback) => {
				app.Db = Db;
				app.db = mongojs(Db, [ 'users', 'movements' ]);
				callback();
			},
		], (error) => {
			if (!error)
				app.emit('db.ready')
			done(error);
		})
	},
	detach: function () {  var app = this;

	}
};

module.exports = plugin;
