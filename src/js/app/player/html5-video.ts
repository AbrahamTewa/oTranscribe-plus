export default class HTML5_VIDEO implements MediaDriver {
    destroyed = false;

    element?: HTMLVideoElement;

    status: MediaStatus = MediaStatus.inactive;

    constructor(source: string) {
        this.element = document.createElement( 'video' );
        this.element.src = source;
        this.element.className = 'video-player';
    	document.body.appendChild(this.element);
    }
    play(): void {
        if (!this.element) {
            throw new Error('Driver destroyed');
        }

        this.element.play();
        this.status = MediaStatus.playing;
    }
    pause(): void {
        if (!this.element) {
            throw new Error('Driver destroyed');
        }

        this.element.pause();
        this.status = MediaStatus.paused;
    }
    getTime(): number {
        if (!this.element) {
            throw new Error('Driver destroyed');
        }

        return this.element.currentTime;
    }
    setTime(time: number): void {
        if (!this.element) {
            throw new Error('Driver destroyed');
        }

        this.element.currentTime = time;
    }
    getStatus(): MediaStatus {
        return this.status;
    }
    getLength(): number {
        if (!this.element) {
            throw new Error('Driver destroyed');
        }

        return this.element.duration;
    }
    isReady(): boolean {
        if (!this.element) {
            return false;
        }
        return (!this.destroyed && (!isNaN(this.element.duration)) && (this.element.readyState === 4));
    }
    getSpeed(): number {
        if (!this.element) {
            throw new Error('Driver destroyed');
        }

        return this.element.playbackRate;
    }
    setSpeed(speed: number){
        if (!this.element) {
            throw new Error('Driver destroyed');
        }

        return this.element.playbackRate = speed;
    }
    destroy(){
        if (!this.element) {
            return;
        }
        this.element.remove();
    	delete this.element;
    	this.destroyed = true;
    }
}
