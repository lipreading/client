'use strict';

const queue = [];
let currentVideo = null;

const loopAnalyse = setInterval(analyse, 1000);

module.exports = (client, videoPath) => {
    queue.push({
        client: client,
        videoPath: videoPath
    });
};

function checkPosition() {
    const check = (video, i) => {
        if (currentVideo && currentVideo.videoPath === video.videoPath) {
            video.client.emit('info', {
                status: 'process'
            });
        } else {
            video.client.emit('info', {
                status: 'wait',
                position: i + 1
            });
        }
    };

    if (currentVideo && queue.length === 0) {
        check(currentVideo, 0);
        return;
    }

    queue.forEach((c, i) => {
        check(c, i);
    });
}

function analyse() {
    checkPosition();
    if (currentVideo && currentVideo.client.connected) {
        return;
    }

    if (currentVideo && !currentVideo.client.connected) {
        currentVideo.reject();
        currentVideo = null;
    }

    currentVideo = queue.shift();
    if (!currentVideo) {
        return;
    }

    //TODO здесь запуск анализатора
    new Promise((resolve, reject) => {
        currentVideo.reject = reject;

        setTimeout(() => {
            currentVideo.client.emit('info', {
                status: 'ready',
                subtitles: 'subtitles'
            });

            currentVideo = null;
            resolve();
        }, 30000);
    });
}