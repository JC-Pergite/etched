'use strict';

const App = require('broadway').App;
const app = new App();

process.title = 'etched';


process.on('uncaughtException', function (err) {
	console.error(`a fatal error occured\n${err.stack}`);
	process.exit(1);
});

app.config.defaults(
	JSON.parse(require('fs').readFileSync(`${__dirname}/../config/${ process.env.NODE_ENV || 'default' }.json`, 'utf8'))
);


app.use(require('./web'), app.config.get('web'));
app.use(require('./database'), app.config.get('database'));
app.use(require('./users'), app.config.get('users'));
app.use(require('./sketch'), app.config.get('sketch'));

app.init(function (error) {
	if (error) {
		app.log.error(`error starting ${process.title}:\n${error.stack}`);
		process.exit(1);
	} else {
		app.log.info(`${process.title} has started`);
	}
});
