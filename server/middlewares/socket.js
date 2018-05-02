'use strict';

const fs = require('fs');
const analyseVideo = require('./analyseVideo');
const tempPath = __dirname + '/../temp/';
const PART = 524288;

module.exports = (io) => {
    this._files = {};

    io.on('connection', client => {
        client.on('start', data => {
            const name = data.name;

            this._files[name] = {
                fileSize: data.size,
                data: '',
                downloaded: 0
            };

            let place = 0;
            try {
                const stat = fs.statSync(tempPath + name);
                if (stat.isFile()) {
                    this._files[name].downloaded = stat.size;
                    place = stat.size / PART;
                }
            } catch (err) {}

            fs.open(tempPath + name, 'a', 755, (err, fd) => {
                if (err) {
                    console.log(err);
                } else {
                    this._files[name].handler = fd;
                    client.emit('moreData', {
                        place: place, percent: 0
                    });
                }
            });
        });


        client.on('upload', data => {
            const name = data.name;
            this._files[name].downloaded += data.data.length;
            this._files[name].data += data.data;

            if (this._files[name].downloaded === this._files[name].fileSize) {
                client.emit('finishUpload', {});
                fs.write(this._files[name].handler, this._files[name].data, null, 'Binary', (err, written) => {});
                analyseVideo(client, tempPath + name);
            } else if (this._files[name].data.length > 10485760) {
                fs.write(this._files[name].handler, this._files[name].data, null, 'Binary', (err, written) => {
                    this._files[name].data = '';
                    const place = this._files[name].downloaded / PART;
                    const percent = (this._files[name].downloaded / this._files[name].fileSize) * 100;
                    client.emit('moreData', {
                            place: place,
                            percent: percent
                        }
                    );
                });
            } else {
                const place = this._files[name].downloaded / PART;
                const percent = (this._files[name].downloaded / this._files[name].fileSize) * 100;
                client.emit('moreData', {
                    place: place,
                    percent: percent
                });
            }
        });
    });
};