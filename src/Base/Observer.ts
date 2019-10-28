import { RDEvent } from '../common/Event';
import { Disposable } from "./Disposable";
import { BooleanFlag } from "../common/Flag";
import { Bag } from '../common/Bag';
import { create } from 'domain';

export interface ObserverType<Elem> {
    on(ev: RDEvent<Elem>): void;
}

export class ObserverBase<Elem> implements ObserverType<Elem>, Disposable {
    private isStopped: BooleanFlag = new BooleanFlag(false);
    on(ev: RDEvent<Elem>) {
        switch (ev.kind) {
            case "next":
                if (!this.isStopped.get()) {
                    this.onCore(ev);
                }
                break;
            case "error":
            case "completed":
                if (!this.isStopped.fetchOr(true)) {
                    this.onCore(ev);
                }
                break;
        }
    }




    onCore(ev: RDEvent<Elem>) {
        // abst
    }

    dispose() {
        this.isStopped.fetchOr(true);
    }
}

type EventHandler<Elem> = (ev: RDEvent<Elem>) => void;

export class AnonymousObserver<Elem> extends ObserverBase<Elem> {
    private eventHandler: EventHandler<Elem>;
    constructor(eventHandler: EventHandler<Elem>) {
        super();
        this.eventHandler = eventHandler;
    }

    onCore(ev: RDEvent<Elem>) {
        this.eventHandler(ev);
    }
}

export type AnonymousObservers<Elem> = Bag<(ev:RDEvent<Elem>)=>void>

export namespace AnonymousObservers {
    export function create<Elem>(): AnonymousObservers < Elem > {
        return new Bag<(ev: RDEvent<Elem>) => void>();
    }
}
