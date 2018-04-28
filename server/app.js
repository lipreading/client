'use strict';
const PORT = Number(process.env.NODE_BOT_PORT) || 8000;
const isProd = process.env.NODE_ENV === 'production';

const express = require('express');
const bodyParser = require('body-parser');
const mustache = require('mustache');
const mustacheExpress = require('mustache-express');

const buildPageMiddleware = require('./middlewares/build-page');

mustache.tags = ['{template:"', '"}'];
const paths = [
    '/'
];

const app = express()
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({extended: true}))
    .get('/ping', (req, res) => {
        res.end();
    })
    .engine('mustache', mustacheExpress())
    .set('view engine', 'mustache')
    .set('views', __dirname + '/../pages/');

app
    .use('/build', express.static('build'))
    .get(paths, [buildPageMiddleware])
    .use((req, res) => {
        res.sendStatus(404);
    })
    .use((err, req, res, next) => {
        console.log(err);
        res.sendStatus(500);
    });

const server = app.listen(PORT, () => {
    console.log(`Server listen ${PORT} port`);
});

module.exports = server;