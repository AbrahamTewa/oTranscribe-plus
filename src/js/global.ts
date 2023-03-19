declare global {
  const localStorageManager: LocalStorageManager;
  var currentFile: File | undefined;

  const processYoutube: (source: string) => void;

  const gapi: {
    auth: {
      authorize: (param: object, fn?: (authResult: {error?: string}) => void) => void;
    },
    auth2: {
      authorize: (param: object, fn: (authResult: {error?: string}) => void) => void;
    },
    client: {
      request: (opts: object) => { execute: (cb: (file: { alternateLink: string }) => void) => void };
    }
  };

  const insertGoogleDriveFile: () => void;

  const oTinput: {
    new(opts: OTInputOptions): OTInput,
    getSupportedFormats: () => { audio: string[], video: string[] };
  }

  const YT: {
    Player: {
      new(id: string, options: YouTubePlayerOptions) : YouTubePlayer;
    }
  };

  interface Document {
    webL10n: {
      get(str: string, opts?: {n: number}): string,
      getLanguage(): string;
      getReadyState(): 'complete';
      setLanguage(language: string): void;
    };
  }

  interface Window {
    localStorageManager: LocalStorageManager;

    activateTimestamps: () => void;
    createSilentAudio: (time: number, freq: number) => void;
    createTimestampEl: (time: TimeRepresentation) => HTMLSpanElement;
    formatMilliseconds: (time: TimeInMilliseconds) => string;
    insertTimestamp: (givenTime?: TimeRepresentation) => void;
    insertGoogleDriveFile: () => void;
    googleDriveStartLoad: () => void;
    onYouTubeIframeAPIReady: () => void;
    webkitAudioContext: AudioContext;
    mozAudioContext: AudioContext;

    _ytEl: YouTubePlayer;

    YT: {
      Player: {
        new() : YouTubePlayer;
      }
    }
  }

  interface MediaDriver {
    destroy: () => void;
    isReady: () => boolean;
    getLength: () => number;
    getName?: () => string;
    getSpeed: () => number;
    getStatus: () => MediaStatus;
    getTime: () => number;
    pause: () => void;
    play: () => void;
    setSpeed: (speed: number) => void;
    setTime: (time: number) => void;
  }

  enum MediaStatus {
    inactive = 'inactive',
    playing = 'playing',
    paused = 'paused',
  }

  type OTInputOptions = {
    element: string;
    onDragover: () => void;
    onDragleave: () => void;
    onFileChange: (file: File) => void;
    onFileError: (err: Error, file: File) => void;
    onURLError: (error: Error) => void
    onURLSubmit: (url: string) => void;
    text: Record<string, string>;
  };

  type TimeInMilliseconds = number;

  type TimeRepresentation = {
    formatted: string,
    raw: TimeInMilliseconds,
  }

  type YouTubePlayer = {
    getAvailablePlaybackRates: () => number[];
    getCurrentTime: () => number;
    getDuration: () => number;
    getPlaybackRate: () => number;
    playVideo: () => void;
    pauseVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
    setPlaybackRate: (suggestedRate: number) => void;
    status: number;
  };

  type YouTubePlayerOptions = {
    width: string,
    videoId: string,
    playerVars: object,
    events: {
        onReady?: () => void,
        onStateChange?: (this: YouTubePlayer, event: { data: number }) => void,
    }
  };

  type KeyboardKey = string;

  enum KeyFn {
    playPause = 'playPause',
    backwards = 'backwards',
    forwards = 'forwards',
    returnToStart = 'returnToStart',
    timeSelection = 'timeSelection',
    speedDown = 'speedDown',
    speedUp = 'speedUp',
    addTimestamp = 'addTimestamp',
    bold = 'bold',
    italic = 'italic',
    underline = 'underline',
  }

  type keyboardShortcuts = {
    [key in KeyFn]: KeyboardKey[]
  }

  type AppSettings = {
      keyboardShortcuts: {
          shortcuts: keyboardShortcuts,
      }
  };
}

interface OTInput {
  showURLInput(): void;
}

export {};
