import {Emitter} from '../utils/event.js';

export enum ActionState {
    None = 0,
    Started = 1,
    Completed = 2,
    Canceled = 3,
}

export class Action {
    private readonly _name: string;

    started = new Emitter<[Action]>();
    completed = new Emitter<[Action]>();
    canceled = new Emitter<[Action]>();

    state = ActionState.None;

    constructor(name: string) {
        this._name = name;
    }

    get name() {
        return this._name;
    }

    reset() {}

    magnitudeSq() {
        return 0.0;
    }
}

/* Can have a state */
export class BooleanAction extends Action {
    value = false;

    reset() {
        this.value = false;
    }

    magnitudeSq() {
        return this.value ? 1.0 : 0.0;
    }
}

/* Doesn't have a state */
export class Axis2dAction extends Action {
    value = new Float32Array(2);

    reset() {
        this.value[0] = 0;
        this.value[1] = 0;
    }

    magnitudeSq() {
        return this.value[0] * this.value[0] + this.value[1] * this.value[1];
    }
}
