
/******************************************
                Other
******************************************/

function html5Support(){
    var audioTagSupport = !!(document.createElement('audio').canPlayType);
    const textBox = document.getElementById('textbox') as HTMLDivElement;
    var contentEditableSupport = textBox.contentEditable;
    var fileApiSupport = !!(window.FileReader);

    if (audioTagSupport && contentEditableSupport && fileApiSupport){
        return true;
    } else {
        return false;
    }
}

export default function oldBrowserCheck(){
    if ( html5Support() === false ){
        var oldBrowserWarning = document.webL10n.get('old-browser-warning');
        const oldBrowser = document.getElementById('old-browser') as HTMLDivElement;
        oldBrowser.innerHTML = oldBrowserWarning;
    }
}
