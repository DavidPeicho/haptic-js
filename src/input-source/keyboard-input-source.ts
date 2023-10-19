import {Emitter} from '../utils/event.js';
import {InputSource} from './input.js';

export enum KeyboardBinding {
    KeyA = 0x1,
    KeyS = 0x2,
    KeyD = 0x3,
    KeyF = 0x4,
    KeyH = 0x5,
    KeyG = 0x6,
    KeyZ = 0x7,
    KeyX = 0x8,
    KeyC = 0x9,
    KeyV = 0xa,
    IntlBackslash = 0xb,
    KeyB = 0xc,
    KeyQ = 0xd,
    KeyW = 0xe,
    KeyE = 0xf,
    KeyR = 0x10,
    KeyY = 0x11,
    KeyT = 0x12,
    Digit1 = 0x13,
    Digit2 = 0x14,
    Digit3 = 0x15,
    Digit4 = 0x16,
    Digit6 = 0x17,
    Digit5 = 0x18,
    Equal = 0x19,
    Digit9 = 0x1a,
    Digit7 = 0x1b,
    Minus = 0x1c,
    Digit8 = 0x1d,
    Digit0 = 0x1e,
    BracketRight = 0x1f,
    KeyO = 0x20,
    KeyU = 0x21,
    BracketLeft = 0x22,
    KeyI = 0x23,
    KeyP = 0x24,
    Enter = 0x25,
    KeyL = 0x26,
    KeyJ = 0x27,
    Quote = 0x28,
    KeyK = 0x29,
    Semicolon = 0x2a,
    Backslash = 0x2b,
    Comma = 0x2c,
    Slash = 0x2d,
    KeyN = 0x2e,
    KeyM = 0x2f,
    Period = 0x30,
    Tab = 0x31,
    Space = 0x32,
    Backquote = 0x33,
    Backspace = 0x35,
    Escape = 0x36,
    MetaRight = 0x37,
    MetaLeft = 0x38,
    ShiftLeft = 0x39,
    CapsLock = 0x3a,
    AltLeft = 0x3b,
    ControlLeft = 0x3c,
    ShiftRight = 0x3d,
    AltRight = 0x3e,
    ControlRight = 0x40,
    F17 = 0x41,
    NumpadDecimal = 0x43,
    NumpadMultiply = 0x45,
    NumpadAdd = 0x47,
    NumLock = 0x4b,
    /*
        VolumeUp = 0x48, // Not the same on Chrome/Firefox
        VolumeDown = 0x49, // Not the same on Chrome/Firefox
        VolumeMute = 0x4A, // Not the same on Chrome/Firefox
    */
    NumpadDivide = 0x4c,
    NumpadEnter = 0x4e,
    NumpadSubtract = 0x4f,
    F18 = 0x50,
    F19 = 0x51,
    NumpadEqual = 0x52,
    Numpad0 = 0x53,
    Numpad1 = 0x54,
    Numpad2 = 0x55,
    Numpad3 = 0x56,
    Numpad4 = 0x57,
    Numpad5 = 0x58,
    Numpad6 = 0x59,
    Numpad7 = 0x5a,
    F20 = 0x5b,
    Numpad8 = 0x5c,
    Numpad9 = 0x5d,
    IntlYen = 0x5e,
    IntlRo = 0x5f,
    NumpadComma = 0x60,
    F5 = 0x61,
    F6 = 0x62,
    F7 = 0x63,
    F3 = 0x64,
    F8 = 0x65,
    F9 = 0x67,
    F11 = 0x69,
    F13 = 0x6a,
    F16 = 0x6b,
    F14 = 0x6d,
    F10 = 0x6e,
    ContextMenu = 0x6f,
    F12 = 0x71,
    /* Help = 0x72, */ // Not the same on Chrome/Firefox
    F15 = 0x73,
    Home = 0x74,
    PageUp = 0x75,
    Delete = 0x76,
    F4 = 0x77,
    End = 0x78,
    F2 = 0x79,
    PageDown = 0x7a,
    F1 = 0x7b,
    ArrowLeft = 0x7c,
    ArrowRight = 0x7d,
    ArrowDown = 0x7e,
    ArrowUp = 0x7f,
}

function convertKeyCode(code: string): number {
    const value = KeyboardBinding[code as keyof typeof KeyboardBinding];
    return value !== undefined ? value : 0;
}

function toBitSetIndex(value: number): number {
    return value >> 5;
}

function toBit32(bit128: number) {
    return 1 << bit128 % 32;
}

export class KeyboardInputSource implements InputSource {
    static get TypeName() {
        return 'keyboard';
    }

    /** No more than 4 * 32 keys. */
    bitset: Int32Array = new Int32Array(4);

    #element: HTMLElement | Window = window;

    #onPress = new Emitter<[KeyboardEvent]>();
    #onRelease = new Emitter<[KeyboardEvent]>();

    #onKeyPress = (e: KeyboardEvent) => {
        const bit128 = convertKeyCode(e.code);
        const index = toBitSetIndex(bit128);
        this.bitset[index] |= toBit32(bit128);
        this.#onPress.notify(e);
    };
    #onKeyRelease = (e: KeyboardEvent) => {
        const bit128 = convertKeyCode(e.code);
        const index = toBitSetIndex(bit128);
        this.bitset[index] &= ~toBit32(bit128);
        this.#onRelease.notify(e);
    };

    enable(element: HTMLElement | Window = window) {
        this.#element = element as HTMLElement;
        this.#element.addEventListener('keydown', this.#onKeyPress);
        this.#element.addEventListener('keyup', this.#onKeyRelease);
    }

    disable() {
        const elt = this.#element as HTMLElement;
        elt.removeEventListener('keydown', this.#onKeyPress);
        elt.removeEventListener('keyup', this.#onKeyRelease);
        this.#element = window;
    }

    pressed(buttons: Uint8Array): boolean {
        /* @todo: Unroll */
        for (let i = 0; i < buttons.length; ++i) {
            if (!buttons[i]) continue;
            const index = toBitSetIndex(buttons[i]);
            if (!(this.bitset[index] & toBit32(buttons[i]))) return false;
        }
        return true;
    }

    get onPress() {
        return this.#onPress;
    }

    get onRelease() {
        return this.#onRelease;
    }
}
