/******************************************
             User Interaction
******************************************/

import $ from 'jquery';
import Mousetrap from 'mousetrap';
const Progressor = require('progressor.js');
import { getPlayer, PlayerSkipDirection, PlayerSpeedDirection } from './player/player';
import { insertTimestamp } from './timestamps';
import timeSelectionModal from './time-selection-modal';
import { getSettings } from './settings/settings.jsx';

export function bindPlayerToUI(filename = '') {
    
    const shortcuts = getSettings().keyboardShortcuts.shortcuts;

    const player = getPlayer();
    if (!player) {
        return;
    }

    const $playPauseButton = $('.play-pause');
    
    var skippingButtonInterval: NodeJS.Timer;
    addKeyboardShortcut(shortcuts.backwards, player.skip.bind(player, PlayerSkipDirection.backwards));
    addKeyboardShortcut(shortcuts.forwards, player.skip.bind(player, PlayerSkipDirection.forward));
    
    $('.skip-backwards').off().mousedown(function(){
        player.skip(PlayerSkipDirection.backwards);
        skippingButtonInterval = setInterval(() => {
            player.skip(PlayerSkipDirection.backwards);
        },100);
    }).mouseup(function(){
        clearInterval(skippingButtonInterval);
    });
    $('.skip-forwards').off().mousedown(function(){
        player.skip(PlayerSkipDirection.forward);    
        skippingButtonInterval = setInterval(() => {
            player.skip(PlayerSkipDirection.forward);
        },100);
    }).mouseup(function(){
        clearInterval(skippingButtonInterval);
    });
    
    $playPauseButton.off().click(playPause);
    addKeyboardShortcut(shortcuts.playPause, playPause)
    
    addKeyboardShortcut(shortcuts.timeSelection, timeSelectionModal.toggle);
    $('.player-time').off().click(timeSelectionModal.toggle);
    
    let changingSpeed = false;
    $('.speed-slider')
        .attr('min', player.minSpeed)
        .attr('max', player.maxSpeed)
        .attr('step', player.speedIncrement)
        .off()
        .on('change', function(this: HTMLInputElement) {
            player.setSpeed(this.valueAsNumber);
        });

    player.onSpeedChange((speed) => {
        $('.speed-slider').val( speed );            
    });

    addKeyboardShortcut(shortcuts.speedDown, () => {
        player.speed(PlayerSpeedDirection.down);
    });
    addKeyboardShortcut(shortcuts.speedUp, () => {
        player.speed(PlayerSpeedDirection.up);
    });

    // make speed box sticky if button is clicked
    $( ".speed" ).off().mousedown(function(this: HTMLElement) {
        if ($('.speed-box').not(':hover').length) {
            $(this).toggleClass('fixed');
        }    
    });

    const playerHook = document.querySelector('#player-hook') as HTMLDivElement;
    playerHook.innerHTML = '';
    const divElement = document.querySelector('.player-time') as HTMLDivElement;
    if (document.querySelector('audio, video')) {
        var progressBar = new Progressor({
            media : document.querySelector('audio:not(#audio-ref), video'),
            bar : playerHook,
            text : filename,                       
            time : divElement,
            hours: true
        });
        divElement.style.display = 'block';
    } else {
        divElement.style.display = 'none';
    }
    
    player.onPlayPause(status => {
        if (status === 'playing'){
            $playPauseButton.addClass('playing');
        } else {
            $playPauseButton.removeClass('playing');
        }
    });
    
    setKeyboardShortcutsinUI();
    
    function playPause() {
        if (player.getStatus() !== 'playing'){
            player.play();
            $playPauseButton.addClass('playing');
        } else {
            player.pause();
            $playPauseButton.removeClass('playing');
        }
    };
    
}

export function addKeyboardShortcut(key: string | string[], fn: () => void) {
    Mousetrap.unbind(key);
    Mousetrap.bind(key, function(e) {
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            // internet explorer
            e.returnValue = false;
        }
        fn();
        return false;
    });
    
}

export function keyboardShortcutSetup() {

    const shortcuts = getSettings().keyboardShortcuts.shortcuts;
    
    addKeyboardShortcut( shortcuts.bold,      () => document.execCommand('bold',false,undefined)       );
    addKeyboardShortcut( shortcuts.italic,    () => document.execCommand('italic',false,undefined)     );
    addKeyboardShortcut( shortcuts.underline, () => document.execCommand('underline',false,undefined)  );
    addKeyboardShortcut( shortcuts.addTimestamp, () => insertTimestamp()                             );
    addKeyboardShortcut( shortcuts.returnToStart, () => {
        const player = getPlayer();

        if (!player) {
            return;
        }

        player.skipTo( 0 );
    });
    setKeyboardShortcutsinUI();
}

export const correctModKey = (binding: string) => {
    const isMac = window.navigator.platform.indexOf('Mac') > -1;
    const modKey = isMac? '⌘' : 'Ctrl';
    return binding.replace(/mod/g, modKey);
}

export const getFormattedShortcutFor = (shortcut: KeyFn, shortcuts: keyboardShortcuts) => {
    if (!shortcuts) {
        shortcuts = getSettings().keyboardShortcuts.shortcuts;
    }
    if ((shortcut in shortcuts) && shortcuts[shortcut].length > 0) {
        let text = shortcuts[shortcut][0];
        if (text === 'escape') {
            text = 'esc';
        }
        return correctModKey(text);
    }
    return '';
}

function setKeyboardShortcutsinUI() {
    const shortcuts = getSettings().keyboardShortcuts.shortcuts;
    $('[data-shortcut]').each(function() {
        const shortcut = $(this).attr('data-shortcut') as KeyFn;
        $(this).text(getFormattedShortcutFor(shortcut, shortcuts));
    });
}