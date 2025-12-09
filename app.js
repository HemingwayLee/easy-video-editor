let videoLoader;
let videoCutter;

document.addEventListener('DOMContentLoaded', () => {
    videoLoader = new VideoLoader();
    videoLoader.init();

    videoCutter = new VideoCutter(videoLoader);
    videoCutter.init();
});
