const $ = require('jquery');
const Mustache = require('mustache');
const toMarkdown = require('to-markdown');
import template from '../../html/export-panel.ms';
import googleDriveSetup from './export-formats/google-drive';
import { getPlayer } from './player/player';
const sanitizeHtml = require('sanitize-html');
import { cleanHTML } from './clean-html';

function getTexteditorContents() {
    const textBox = document.querySelector('#textbox') as HTMLDivElement;
    return textBox.innerHTML;
}

function getFilename() {
    return document.webL10n.get('file-name') + " " + (new Date()).toUTCString();
}

type FormatSend = {
    name: string,
    setup: (cb: () => void) => void;
    checkGoogleAuth?: (opts: { text: string, filename: string }) => void,
    fn: (opts: { text: string, filename: string }) => void;
    ready?: boolean,
};

type FormatDownload = {
    extension: string,
    ready?: boolean,
    fn: (txt: string) => string;
};

let exportFormats: { 
    download: FormatDownload[],
    send: FormatSend[],
} = {
    download: [],
    send: []
};

exportFormats.download.push({
    name: 'Markdown',
    extension: 'md',
    fn: (txt) => {
        const fullyClean = sanitizeHtml(txt, {
            allowedTags: [ 'p', 'em', 'strong', 'i', 'b', 'br' ]
        });
        const md = toMarkdown( fullyClean );
        return md.replace(/\t/gm,"");           
    }
});

exportFormats.download.push({
    name: 'Plain text',
    extension: 'txt',
    fn: (txt) => {
        const fullyClean = sanitizeHtml(txt, {
            allowedTags: [ 'p' ]
        });
        const md = toMarkdown( fullyClean );
        return md.replace(/\t/gm,"");           
    }
});

exportFormats.download.push({
    name: 'oTranscribe format',
    extension: 'otr',
    fn: (txt) => {
        const player = getPlayer();

        let result = {
            media: player?.getName() ?? '',
            'media-source': '',
            'media-time': player?.getTime() ?? '',
            text: txt.replace('\n',''),
        };

        return JSON.stringify(result);
    }
});

exportFormats.send.push({
    name: 'Google Drive',
    setup: function(cb: () => void) {
        this.checkGoogleAuth = googleDriveSetup(cb);
    },
    fn: function(opts: { text: string, filename: string }) {
        this.checkGoogleAuth?.(opts);
    }
})

function generateButtons() {
    
    const downloadData = exportFormats.download.map(format => {
        const clean = cleanHTML( getTexteditorContents() );
        const file = format.fn(clean);
        const blob = new Blob([file], {type: 'data:text/plain'});
        const href = window.URL.createObjectURL(blob);
        
        return {
            format: format,
            file: file,
            href: href,
            filename: getFilename()
        };
    });    

    if (checkDownloadAttrSupport() === false) {
        downloadData.forEach(format => {
            format.href = convertToBase64(format.file);
        });
    }    
    return Mustache.render(template, {
        downloads: downloadData
    });
    
}

export function exportSetup(){
    
    $('.textbox-container').click(function(e: Event) {
        if(
            $(e.target).is('#icon-exp') ||
            $(e.target).is('.export-panel') ||
            $(e.target).is('.sbutton.export')
        ){
            e.preventDefault();
            return;
        }
        hideExportPanel();
    });    
    
    $(".export-panel").click(function(e: Event) {
         e.stopPropagation();
    });
    
    $('.sbutton.export').click(function() {
        // document.querySelector('.container').innerHTML = downloadButtons;
        const iDiv = $('#icon-exp') as JQuery<HTMLDivElement>
        var origin = iDiv.offset() as JQuery.Coordinates;
        const bodyWidth = ($('body') as JQuery<HTMLBodyElement>).width() as number;
        var right = bodyWidth - origin.left + 25;
        var top = origin.top - 50;
        
        const textBox = document.querySelector('#textbox') as HTMLDivElement;
        const filename = getFilename();
        const data = {
            text: textBox.innerHTML,
            filename: filename
        };
        
        $('.export-panel')
            .html(generateButtons());

        exportFormats.send.forEach(format => {
            if (format.ready) {
                format.fn(data);
            } else {
                format.setup(() => {
                    format.ready = true;
                    setTimeout(() => {
                        format.fn(data)
                    }, 500);
                });
            }
        });

        $('.export-panel')
            .css({'right': right,'top': top})
            .addClass('active'); 
        
    });
}

function hideExportPanel(){
    $('.export-panel').removeClass('active');
}

function checkDownloadAttrSupport() {
    var a = document.createElement('a');
    return (typeof a.download != "undefined");
}

function convertToBase64(str: string) {
    return "data:application/octet-stream;base64," + btoa(str);
}