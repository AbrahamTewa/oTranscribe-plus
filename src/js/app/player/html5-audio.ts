export default class HTML5_AUDIO implements MediaDriver {
    destroyed = false;

    element?: HTMLAudioElement;

    status: MediaStatus;

    constructor(source: string) {
        this.element = document.createElement( 'audio' );
        this.element.src = source;
    	this.element.style.display = 'none';
    	document.body.appendChild(this.element);
        this.status = MediaStatus.inactive;
    }

    play() {
        if (!this.element) {
            throw new Error('Driver destroyed');
        }
        this.element.play();
        this.status = MediaStatus.playing;
    }
    pause() {
        if (!this.element) {
            throw new Error('Driver destroyed');
        }
        this.element.pause();
        this.status = MediaStatus.paused;
    }
    getTime() {
        if (!this.element) {
            throw new Error('Driver destroyed');
        }
        return this.element.currentTime;
    }
    setTime(time: number) {
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
    isReady() {
        if (!this.element) {
            return false;
        }

        return (!this.destroyed && (!isNaN(this.element.duration)) && (this.element.readyState === 4));
    }
    getSpeed() {
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
