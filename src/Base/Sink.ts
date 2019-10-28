import { ObserverType } from "./Observer";
import { Disposable, Cancelable } from "./Disposable";
import { RDEvent } from '../common/Event';
import {  BooleanFlag } from '../common/Flag';



export class Sink<Observer extends ObserverType<Elem>, Elem> implements Disposable {
    observer: Observer;
    cancel: Cancelable;
    private m_disposed: BooleanFlag = new BooleanFlag(false);
    constructor(observer: Observer, cancel: Cancelable) {
        this.observer = observer;
        this.cancel = cancel;
    }

    forwardOn(RDEvent: RDEvent<Elem>) {
        if (this.m_disposed.get()) {
            return;
        }
        this.observer.on(RDEvent);
    }

    forwarder(): SinkForward<Observer, Elem> {
        return new SinkForward(this);
    }

    disposed(): boolean {
        return this.m_disposed.get();
    }

    dispose() {
        this.m_disposed.fetchOr(true);
        this.cancel.dispose();
    }




}

class SinkForward<Observer extends ObserverType<Elem>, Elem> implements ObserverType<Elem> {
    private forward: Sink<Observer, Elem>;
    constructor(forward: Sink<Observer, Elem>) {
        this.forward = forward;
    }

    on(RDEvent: RDEvent<Elem>) {
        switch (RDEvent.kind) {
            case "next":
                this.forward.observer.on(RDEvent);
                return;
            case "error":
            case "completed":
                this.forward.observer.on(RDEvent);
                this.forward.cancel.dispose();

        }
    }




}



