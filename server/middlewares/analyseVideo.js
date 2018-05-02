'use strict';

const queue = [];
let currentVideo = null;

const loopCheckPosition = setInterval(checkPosition, 5000);
const loopAnalyse = setInterval(analyse, 5000);

module.exports = (client, videoPath) => {
    queue.push({
        client: client,
        videoPath: videoPath
    });
};

function checkPosition() {
    queue.forEach((c, i) => {
        if (currentVideo && currentVideo.videoPath === c.videoPath) {
            c.client.emit('info', {
                status: 'process'
            });
        } else {
            c.client.emit('info', {
                status: 'wait',
                position: i + 1
            });
        }
    });
}

function analyse() {
    if (currentVideo && currentVideo.client.connected) {
        return;
    }

    currentVideo = queue.shift();
    if (!currentVideo) {
        return;
    }

    //TODO здесь запуск анализатора
    new Promise(resolve => setTimeout(() => {
        currentVideo.client.emit('info', {
            status: 'ready',
            subtitles: 'subtitles'
        });

        currentVideo = null;
    }, 20000));
}