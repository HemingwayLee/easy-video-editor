class VideoCutter {
    constructor(videoLoader) {
        this.videoLoader = videoLoader;
        this.ffmpeg = null;
        this.isLoaded = false;
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
    }

    async init() {
        const setStartBtn = document.getElementById('setStartBtn');
        const setEndBtn = document.getElementById('setEndBtn');
        const previewBtn = document.getElementById('previewBtn');
        const cutVideoBtn = document.getElementById('cutVideoBtn');

        setStartBtn.addEventListener('click', () => {
            this.setStartTime();
        });

        setEndBtn.addEventListener('click', () => {
            this.setEndTime();
        });

        previewBtn.addEventListener('click', () => {
            this.previewCut();
        });

        cutVideoBtn.addEventListener('click', () => {
            this.cutVideo();
        });
    }

    async loadFFmpeg() {
        if (this.isLoaded) return;

        try {
            this.showProgress('Loading FFmpeg...', 0);
            const { FFmpeg } = FFmpegWASM;
            this.ffmpeg = new FFmpeg();

            this.ffmpeg.on('log', ({ message }) => {
                console.log(message);
            });

            this.ffmpeg.on('progress', ({ progress }) => {
                const percentage = Math.round(progress * 100);
                this.updateProgress(percentage);
            });

            await this.ffmpeg.load({
                coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js',
            });

            this.isLoaded = true;
            this.hideProgress();
        } catch (error) {
            console.error('Error loading FFmpeg:', error);
            alert('Failed to load FFmpeg. Please refresh and try again.');
            this.hideProgress();
        }
    }

    setStartTime() {
        const currentTime = this.videoLoader.getCurrentTime();
        document.getElementById('startTime').value = currentTime.toFixed(1);
    }

    setEndTime() {
        const currentTime = this.videoLoader.getCurrentTime();
        document.getElementById('endTime').value = currentTime.toFixed(1);
    }

    previewCut() {
        const startTime = parseFloat(document.getElementById('startTime').value);
        const endTime = parseFloat(document.getElementById('endTime').value);

        if (this.validateTimes(startTime, endTime)) {
            const videoPlayer = document.getElementById('videoPlayer');
            videoPlayer.currentTime = startTime;
            videoPlayer.play();

            const checkTime = setInterval(() => {
                if (videoPlayer.currentTime >= endTime) {
                    videoPlayer.pause();
                    clearInterval(checkTime);
                }
            }, 100);
        }
    }

    validateTimes(startTime, endTime) {
        if (isNaN(startTime) || isNaN(endTime)) {
            alert('Please enter valid time values');
            return false;
        }

        if (startTime < 0 || endTime < 0) {
            alert('Times cannot be negative');
            return false;
        }

        if (startTime >= endTime) {
            alert('Start time must be less than end time');
            return false;
        }

        const videoDuration = document.getElementById('videoPlayer').duration;
        if (endTime > videoDuration) {
            alert('End time cannot exceed video duration');
            return false;
        }

        return true;
    }

    async cutVideo() {
        const startTime = parseFloat(document.getElementById('startTime').value);
        const endTime = parseFloat(document.getElementById('endTime').value);

        if (!this.validateTimes(startTime, endTime)) {
            return;
        }

        const videoFile = this.videoLoader.getVideoFile();
        if (!videoFile) {
            alert('Please load a video first');
            return;
        }

        try {
            await this.loadFFmpeg();
            this.showProgress('Processing video...', 0);

            const inputFileName = 'input.mp4';
            const outputFileName = 'output.mp4';

            const arrayBuffer = await videoFile.arrayBuffer();
            await this.ffmpeg.writeFile(inputFileName, new Uint8Array(arrayBuffer));

            const duration = endTime - startTime;
            await this.ffmpeg.exec([
                '-i', inputFileName,
                '-ss', startTime.toString(),
                '-t', duration.toString(),
                '-c', 'copy',
                outputFileName
            ]);

            const data = await this.ffmpeg.readFile(outputFileName);
            const blob = new Blob([data.buffer], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `cut_${videoFile.name}`;
            a.click();

            await this.ffmpeg.deleteFile(inputFileName);
            await this.ffmpeg.deleteFile(outputFileName);

            this.hideProgress();
            alert('Video cut successfully and downloaded!');

        } catch (error) {
            console.error('Error cutting video:', error);
            alert('Failed to cut video. Please try again.');
            this.hideProgress();
        }
    }

    showProgress(text, percentage) {
        this.progressSection.style.display = 'block';
        this.progressText.textContent = text;
        this.progressFill.style.width = percentage + '%';
    }

    updateProgress(percentage) {
        this.progressFill.style.width = percentage + '%';
        this.progressText.textContent = `Processing: ${percentage}%`;
    }

    hideProgress() {
        this.progressSection.style.display = 'none';
        this.progressFill.style.width = '0%';
    }
}
