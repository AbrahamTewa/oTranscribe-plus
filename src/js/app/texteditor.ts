import { cleanHTML } from './clean-html';
import { activateTimestamps } from './timestamps';
import $ from 'jquery';

function countWords(str: string){
    var trimmedStr = str.trim();
    if (trimmedStr){
        return trimmedStr.match(/\S+/gi)?.length ?? 0;
    }
    return 0;
}

function countTextbox(){
    var textboxElement = document.getElementById('textbox') as HTMLDivElement;
    var textboxText = textboxElement.innerText || textboxElement.textContent;
    var count = countWords(textboxText || '');
      
    var wordcountText = document.webL10n.get('wordcount', {n: count});
    wordcountText = wordcountText.replace(/(\d+)/, (n) => {
        return `<span class="word-count-number">${n}</span>`;
    });

    const worldCount = document.querySelector('.wc-text') as HTMLSpanElement;
    worldCount.innerHTML = wordcountText;
}

function initWordCount(){
    countTextbox();
    setInterval(function(){
        countTextbox();
    }, 1000);
    
}


function watchFormatting(){
    var b = document.queryCommandState("Bold");
    var bi = document.getElementById("icon-b") as HTMLElement;
    var i = document.queryCommandState("italic");
    var ii = document.getElementById("icon-i") as HTMLElement;
    
    if (b === true){
        bi.className = "fa fa-bold active"
    } else {
        bi.className = "fa fa-bold"
    }
    if (i === true){
        ii.className = "fa fa-italic active"
    } else {
        ii.className = "fa fa-italic"
    }
}

function initWatchFormatting(){
    setInterval(function(){
        watchFormatting();
    }, 100);
}

function setEditorContents( dirtyText: string, opts: {transition?: boolean} = {} ) {
    
    const newText = cleanHTML(dirtyText);

    var $textbox = $("#textbox");
    
    function replaceText() {
        if (typeof newText === 'string') {
            $textbox[0].innerHTML = newText;
        } else {
            $textbox[0].innerHTML = '';
            $textbox[0].appendChild(newText);    
        }
        activateTimestamps();
        $('.textbox-container').scrollTop(0);
    }
    
    if (opts.transition) {
        $textbox.fadeOut(300,function(){
            replaceText();
            $(this).fadeIn(300);
        });        
    } else {
        replaceText();
    }

}

function initAutoscroll() {
  var isScrolledToBottom = false;

  var container = document.querySelector('.textbox-container') as HTMLDivElement;
  var textbox = document.querySelector('#textbox') as HTMLDivElement;

  // update isScrolledToBottom on scroll event (true within 50px of the bottom of container)
  container.addEventListener('scroll', function() {
    isScrolledToBottom = container.scrollHeight - container.clientHeight - container.scrollTop <= 50;
  });

  // scroll to bottom on the input event, if isScrolledToBottom is true
  textbox.addEventListener('input', function() {
    if(isScrolledToBottom) {
      container.scrollTop = container.scrollHeight;
    }
  });
}

export {
    initWatchFormatting as watchFormatting,
    initWordCount as watchWordCount,
    setEditorContents as setEditorContents,
    initAutoscroll as initAutoscroll
};
