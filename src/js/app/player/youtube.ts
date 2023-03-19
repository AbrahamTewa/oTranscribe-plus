import $ from 'jquery';

export default class YOUTUBE implements MediaDriver {
    duration?: number;

    element?: HTMLDivElement;

    status: MediaStatus = MediaStatus.inactive;

    _isReady = false;

    _ytEl?: YouTubePlayer;

    constructor (source: string, playPauseCallback: () => void){
        
        this.element = document.createElement('div');
        this.element.setAttribute('id','oTplayerEl');
        this.element.className = 'video-player';
        document.body.appendChild(this.element); 
        
        
        loadScriptTag(() => {
            var videoId = parseYoutubeURL(source);

            if (!videoId) {
                throw new Error('Invalid video url');
            }

            this._ytEl = new YT.Player('oTplayerEl', {
                width: '100%',
                videoId: videoId,
                playerVars: {
                    // controls: 0,
                    disablekb: 1,
                    fs: 0,
                    rel: 0,
                    modestbranding: 1
                },
                events: {
                    'onReady': onYTPlayerReady.bind(this),
                    'onStateChange': onStateChange.bind(this)
                }
            });
        
            function onStateChange(this: YOUTUBE, ev: { data: number }){
                var status = ev.data;
                if (status === 1) {
                    this.status = MediaStatus.playing;
                } else {
                    this.status = MediaStatus.paused;
                }
                playPauseCallback();
            }
            function onYTPlayerReady(this: YOUTUBE) {
                if (!this._ytEl) {
                    return;
                }

                // fix non-responsive keyboard shortcuts bug
                $('input.speed-slider').val(0.5).change().val(1).change();
    
                // Some YouTube embeds only support normal speed
                if (this._ytEl.getAvailablePlaybackRates()[0] === 1) {
                    $('.speed-box').html('This media only supports 1x playback rate. Sorry.');
                }
    
                this.duration = this._ytEl.getDuration();
                
                setTimeout(() => {
                    // kickstart youtube
                    this.play();
                    setTimeout(() => {
                        this.pause();
                        
                        this._isReady = true;
                        window._ytEl = this._ytEl as YouTubePlayer;

                        
                        
                    },500);
        
                },1000);

            
            }
        });
        
        function loadScriptTag(callback: () => void) {
            // import YouTube API
            if ( window.YT === undefined ) {
                var tag = document.createElement('script');
                tag.setAttribute('id','youtube-script');
                tag.src = "https://www.youtube.com/iframe_api";
                var firstScriptTag = document.getElementsByTagName('script')[0] as HTMLScriptElement;
                firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
            } else {
                callback();
            }
            window.onYouTubeIframeAPIReady = callback;
        }        
        
    }
    play(): void {
        if (!this._ytEl) {
            throw new Error('Driver not initialized');
        }

        this._ytEl.playVideo();
    }
    pause(): void {
        if (!this._ytEl) {
            throw new Error('Driver not initialized');
        }

        this._ytEl.pauseVideo();
    }
    getTime(): number {
        if (!this._ytEl) {
            throw new Error('Driver not initialized');
        }

        return this._ytEl.getCurrentTime();
    }
    setTime(time: number): void {
        if (!this._ytEl) {
            throw new Error('Driver not initialized');
        }

        this._ytEl.seekTo( time );
    }
    getStatus(): MediaStatus {
        return this.status;
    }
    getLength(): number {
        if (!this._ytEl) {
            throw new Error('Driver not initialized');
        }

        return this.duration as number;
    }
    isReady(): boolean {
        return this._isReady;
    }
    getSpeed(): number {
        if (!this._ytEl) {
            throw new Error('Driver not initialized');
        }

        if ('getPlaybackRate' in this._ytEl) {
            return this._ytEl.getPlaybackRate();
        } else {
            return 1;
        }
    }
    setSpeed(speed: number): void {
        if (!this._ytEl) {
            throw new Error('Driver not initialized');
        }

        if ('setPlaybackRate' in this._ytEl) {
            this._ytEl.setPlaybackRate(speed);
        }
    }
    getName(): string {
        return '';
        
        // oTplayer.prototype._setYoutubeTitle = function(id){
        //     var url = 'http://gdata.youtube.com/feeds/api/videos/'+id+'?v=2&alt=json-in-script&callback=?';
        //     $.ajax({
        //        type: 'GET',
        //         url: url,
        //         async: false,
        //         jsonpCallback: 'jsonCallback',
        //         contentType: "application/json",
        //         dataType: 'jsonp',
        //         success: function(d) {
        //             var title = '[YouTube] '+d.entry.title.$t;
        //             this.title = title;
        //             $('#player-hook').html(title).addClass('media-title');
        //         },
        //         error: function(e){
        //             console.log(e);
        //         }
        //     });
        // };
        
    }
    destroy(): void {
        $('#oTplayerEl').remove();
        delete this.element; 
    }
}

function parseYoutubeURL(url: string){
    if (url.match) {
        var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        var match = url.match(regExp);
        if (match&&match[2].length===11){
            return match[2];
        }
    }
    return false;
};