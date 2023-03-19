import { h, render, Component } from 'preact';
import { useState, useCallback } from 'preact/hooks';
import KeyboardShortcuts from './KeyboardShortcuts.js';
import { bindPlayerToUI, keyboardShortcutSetup } from '../ui';
const localStorageManager = require('local-storage-manager');
import defaultSettings from './defaults.json';

export function getSettings(): AppSettings {
    const savedSettings = localStorageManager.getItem('oTranscribe-settings');
    let settings = Object.assign({}, defaultSettings);
    if (savedSettings) {
        settings = Object.assign({}, defaultSettings, savedSettings);
    }
    return settings;
}

const refreshApp = {
    keyboardShortcuts(state: AppSettings, prevState: AppSettings) {
        bindPlayerToUI();
        keyboardShortcutSetup();
        // TODO: check if any keyboard shortcuts are no longer present in current state
        const shortcuts = state.keyboardShortcuts.shortcuts;
        const prevShortcuts = prevState.keyboardShortcuts.shortcuts;
    }
};

class Settings extends Component<Record<never, string>, AppSettings> {
    constructor(props: Record<string, never>) {
        super(props);
        this.state = getSettings();
    }
    componentDidUpdate(prevProps: any, prevState: AppSettings) {
        localStorageManager.setItem('oTranscribe-settings', this.state);
        refreshApp.keyboardShortcuts(this.state, prevState);
    }
    render() {
        const update = (key: string, value: AppSettings['keyboardShortcuts']) => {
            this.setState({
                [key]: Object.assign({}, value)
            });
        }
        const reset = (key: keyof AppSettings) => {
            this.setState({
                [key]: defaultSettings[key],
            });
        }
        return (
            <div>
                <h2 class="panel-title">Settings</h2>
                <KeyboardShortcuts
                    settings={this.state.keyboardShortcuts}
                    reset={reset.bind(this, 'keyboardShortcuts')}
                    onChange={update.bind(this, 'keyboardShortcuts')}
                />
            </div>
        );
    }
}

export function showSettings(el: HTMLDivElement) {
    render(<Settings />, el);    
}
