class VideoLoader {
    constructor() {
        this.videoFile = null;
        this.videoPlayer = document.getElementById('videoPlayer');
        this.fileNameDisplay = document.getElementById('fileName');
        this.videoSection = document.getElementById('videoSection');
        this.videoDuration = document.getElementById('videoDuration');
        this.currentTimeDisplay = document.getElementById('currentTime');
        this.endTimeInput = document.getElementById('endTime');
    }

    init() {
        const loadBtn = document.getElementById('loadVideoBtn');
        const videoInput = document.getElementById('videoInput');

        loadBtn.addEventListener('click', () => {
            videoInput.click();
        });

        videoInput.addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        this.videoPlayer.addEventListener('loadedmetadata', () => {
            this.onVideoLoaded();
        });

        this.videoPlayer.addEventListener('timeupdate', () => {
            this.updateCurrentTime();
        });
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type === 'video/mp4') {
            this.videoFile = file;
            this.loadVideo(file);
        } else {
            alert('Please select a valid MP4 file');
        }
    }

    loadVideo(file) {
        const url = URL.createObjectURL(file);
        this.videoPlayer.src = url;
        this.fileNameDisplay.textContent = file.name;
        this.videoSection.style.display = 'block';
    }

    onVideoLoaded() {
        const duration = this.videoPlayer.duration;
        this.videoDuration.textContent = this.formatTime(duration);
        this.endTimeInput.value = duration.toFixed(1);
        this.endTimeInput.max = duration;
        document.getElementById('startTime').max = duration;
    }

    updateCurrentTime() {
        const currentTime = this.videoPlayer.currentTime;
        this.currentTimeDisplay.textContent = this.formatTime(currentTime);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    getVideoFile() {
        return this.videoFile;
    }

    getCurrentTime() {
        return this.videoPlayer.currentTime;
    }
}
