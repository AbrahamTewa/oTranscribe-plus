import {getPlayer} from './player/player';

function getTime(): TimeRepresentation {
    // get timestamp
    const player = getPlayer();
    let time = 0;
    if (player) {
        time = player.getTime();
    }

    return {
        formatted: formatMilliseconds(time),
        raw: time
    };
};

function formatMilliseconds(time: TimeInMilliseconds): string {
    const hours = Math.floor(time / 3600).toString();
    const minutes = ("0" + Math.floor(time / 60) % 60).slice(-2);
    const seconds = ("0" + Math.floor( time % 60 )).slice(-2);
    let formatted = minutes+":"+seconds;
    if (hours !== '0') {
        formatted = hours + ":" + minutes + ":" + seconds;
    }
    formatted = formatted.replace(/\s/g,'');
    return formatted;
}

// http://stackoverflow.com/a/25943182
function insertHTML(newElement: Node): void {
    var sel, range;
    if (!window.getSelection) {
        return;
    }

    sel = window.getSelection();

    if (!sel?.rangeCount) {
        return;
    }

    range = sel.getRangeAt(0);
    range.collapse(true);
    range.insertNode(newElement);

    // Move the caret immediately after the inserted span
    range.setStartAfter(newElement);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
}


function insertTimestamp(givenTime?: TimeRepresentation): void {
    var time = givenTime || getTime();
    if (time) {
        const space = document.createTextNode("\u00A0");
        insertHTML(createTimestampEl(time));
        insertHTML(space);
        activateTimestamps();
    }
}

function createTimestampEl(time: TimeRepresentation): HTMLSpanElement {
    const timestamp = document.createElement('span');
    timestamp.innerText = time.formatted;
    timestamp.className = 'timestamp';
    timestamp.setAttribute('contenteditable', 'false');
    timestamp.setAttribute('data-timestamp', String(time.raw));
    return timestamp;
}

function activateTimestamps(): void {
    const list : NodeListOf<HTMLSpanElement> = document.querySelectorAll('.timestamp');
    Array.from(list).forEach(el => {
        el.contentEditable = "false";
        el.removeEventListener('click', onClick);
        el.addEventListener('click', onClick);
    });
}

function onClick(this: HTMLSpanElement): void {
    const player = getPlayer();
    var time = this.dataset.timestamp;
    if (player) {
        if (typeof time === 'string' && time.indexOf(':') > -1) {
            // backwards compatibility, as old timestamps have string rather than number
            player.setTime(convertTimestampToSeconds(time));
        } else {
            player.setTime(Number(time));
        }
    }    
}

function convertTimestampToSeconds(hms: string): number {
    var a = hms.split(':');
    if (a.length === 3) {
        return ((+a[0]) * 60 * 60) + (+a[1]) * 60 + (+a[2]);
    }
    return (+a[0]) * 60 + (+a[1]);
}

export {activateTimestamps, insertTimestamp, convertTimestampToSeconds, formatMilliseconds, createTimestampEl};
