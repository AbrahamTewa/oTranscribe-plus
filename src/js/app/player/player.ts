import HTML5_AUDIO from './html5-audio';
import HTML5_VIDEO from './html5-video';
import YOUTUBE from './youtube';

/*

options:
- driver
- source
- onReady

methods & properties:
- play
- pause
- getTime
- setTime (takes time in seconds)
- skip (forwards or backwards)
- getLength
- getStatus
- getSpeed
- setSpeed
- speed
- onSpeedChange (only supports one callback)


*/

type PlayerOptions<T extends MediaDriver = MediaDriver> = {
    driver: new (
        source: string,
        onPlayPause: () => void
    ) => T;
    name?: string;
    onReady?: (player: Player<T>) => void,
    source: string;
}

class Player<T extends MediaDriver = MediaDriver> {
    onPlayPauseCallback?: OnPlayPauseCallback;

    driver: T;

    maxSpeed: number;

    minSpeed: number;

    name?: string;

    onSpeedChangeCallback?: SpeedChangeCallback;

    skipTime: number;

    speedIncrement: number;

	constructor(opts: PlayerOptions<T>, callback?: () => void){
		if (!opts) {
	        throw('Player needs options');
	    }
	    if (!opts.driver) {
	        throw('Driver not specified');
	    }
	    if (!opts.source) {
	        throw('Source not specified');
	    }

	    let source = opts.source;
	    this.driver = new opts.driver(source, () => {
            if (this.onPlayPauseCallback) {
    	        this.onPlayPauseCallback(this.getStatus());
            }
	    }) as T;
	    this.skipTime = 1.5;
	    this.speedIncrement = 0.125;
	    this.minSpeed = 0.5;
	    this.maxSpeed = 2;
        if (opts.name) {
            this.name = opts.name;
        }

	    let attempts = 0;
		let driver = this.driver;
	    if (opts.onReady) {
	        checkIfReady();
	    };

        let _player = this;
	    function checkIfReady(){
	        if (driver.isReady()) {
	            opts.onReady?.(_player);
	        } else if (attempts < 20000) {
	            setTimeout(checkIfReady,10);
				attempts++;
	        } else {
	        	throw('Error with player driver');
	        }
	    }
        
        const setPlayerHeight = () => {
            const videoEl = document.querySelector('.video-player') as HTMLVideoElement;
            if (videoEl) {
                videoEl.style.height = `${videoEl.offsetWidth * (3 / 4)}px`;
            }
        }
        setPlayerHeight();
        setInterval(setPlayerHeight, 200);

        

	}

    play(){
    	this.skip(PlayerSkipDirection.backwards);
        this.driver.play();
    }

    pause(){
    	this.driver.pause();
    }

    getTime(){
    	return this.driver.isReady() ? this.driver.getTime() : 0;
    }

    setTime(time: number){
        this.driver.setTime(time);
    }
    
    skipTo(time: number) {
        this.setTime(time);
    }

    skip(direction: PlayerSkipDirection){
        let expectedTime = this.getTime();
    	if (direction === PlayerSkipDirection.forward) {
            expectedTime += this.skipTime;
        } else if (direction === PlayerSkipDirection.backwards || direction === PlayerSkipDirection.back) {
            expectedTime -= this.skipTime;
        } else {
            throw ('Skip requires a direction: forwards or backwards')
        }
        this.setTime(expectedTime);
        
        // compensate for weird video setTime bug
        if ((expectedTime > 1) && (this.getTime() === 0)) {
            console.error('Skipped too far back');
            setTimeout(() => this.setTime(expectedTime), 50);
        }
    }

    getStatus(): MediaStatus {
    	return this.driver.isReady() ? this.driver.getStatus() : MediaStatus.inactive;
    }

    getLength(){
    	return this.driver.isReady() ? this.driver.getLength() : 0;
    }

    getSpeed(){
    	return this.driver.getSpeed();
    }

    setSpeed(speed: number){
    	if ((speed >= this.minSpeed) && (speed <= this.maxSpeed)) {
            this.driver.setSpeed(speed);
        } else {
            throw ('Speed is outside the min/max speed bounds')
        }
        this.onSpeedChangeCallback?.(speed);
    }

    speed(direction: PlayerSpeedDirection | number){
    	if (typeof direction === 'number') {
            this.driver.setSpeed( direction );
        } else if (direction === PlayerSpeedDirection.up) {
            this.setSpeed( this.getSpeed() + this.speedIncrement );
        } else if (direction === PlayerSpeedDirection.down) {
            this.setSpeed( this.getSpeed() - this.speedIncrement );
        } else {
            throw ('Speed requires a direction: up or down')
        }
    }
    
    onSpeedChange(callback: SpeedChangeCallback) {
        this.onSpeedChangeCallback = callback;
    }
    
    onPlayPause(callback: OnPlayPauseCallback) {
        this.onPlayPauseCallback = callback;
    }
    
    getName(): string {
        if (this.driver.getName) {
            return this.driver.getName();;
        }
        return this.name || '';
    }

    getTitle(): string {
        return this.getName();
    }

    destroy(): void {
        if (this.driver) {
            this.pause();
        	this.driver.destroy();
        }
    }
};

const playerDrivers = {
    HTML5_AUDIO,
    HTML5_VIDEO,
    YOUTUBE
};

let player = null as Player | null;

function getPlayer(): Player {
    if (!player) {
        throw new Error('Player not created');
    }

    return player;
};

function createPlayer<T extends MediaDriver = MediaDriver>(opts: PlayerOptions<T>): Promise<Player<T>> {
    return new Promise((res, rej) => {
        opts.onReady = res;
        player = new Player(opts);
    });
}

function isVideoFormat(file: File | string ) {
    if (typeof file === 'object') {
        return file.type.indexOf('video') > -1;
    }
    var urlSplt = file.split('.');
    var format = urlSplt[urlSplt.length-1];
    return !!format.match(/mov|mp4|avi|webm/);    
}

type OnPlayPauseCallback = (status: MediaStatus) => void;
type SpeedChangeCallback = (speed: number) => void;

enum PlayerSpeedDirection {
    up = 'up',
    down = 'down',
}

enum PlayerSkipDirection {
    forward = "forward",
    backwards = "backwards",
    back = "back",
}

export {
    PlayerSkipDirection,
    PlayerSpeedDirection,

    createPlayer,
    getPlayer,
    playerDrivers,
    isVideoFormat,
};