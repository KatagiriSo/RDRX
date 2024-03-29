import { Observable } from "../Base/Observable";
import { Producer } from "../Base/Producer";
import { ObserverType } from "../Base/Observer";
import { Disposable, Disposables, Cancelable } from "../Base/Disposable";
import { Next, Completed } from "../common/Event";

export function list<Elem>(elems: Elem[]): Observable<Elem> {
    return new List(elems);
}


export class List<Elem> extends Producer<Elem> {
    private elems: Elem[];
    constructor(elems: Elem[]) {
        super();
        this.elems = elems;
    }

    subscribe<T extends ObserverType<Elem>>(observer: T): Disposable {
        // thread...
        for (let el of this.elems) {
            observer.on(new Next(el));
        }
        observer.on(new Completed());
        return Disposables.create();
    }

    run<O extends ObserverType<Elem>>(observer: O, cancel: Cancelable): { sink: Disposable, subscription: Disposable } {
        return { sink: Disposables.create(), subscription: Disposables.create() };
    }

}

