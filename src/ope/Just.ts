import { Observable } from "../Base/Observable";
import { Producer } from "../Base/Producer";
import { ObserverType } from "../Base/Observer";
import { Disposable, Disposables, Cancelable } from "../Base/Disposable";
import { Next, Completed } from "../common/Event";




    export function just<Elem>(elem: Elem): Observable<Elem> {
        return new Just(elem);
    }
    

    class Just<Elem> extends Producer<Elem> {
        private elem: Elem;
        constructor(elem: Elem) {
            super();
            this.elem = elem;
        }

        subscribe<T extends ObserverType<Elem>>(observer: T): Disposable {
            // thread...
            observer.on(new Next(this.elem));
            observer.on(new Completed());
            return Disposables.create();
        }

        run<O extends ObserverType<Elem>>(observer: O, cancel: Cancelable): { sink: Disposable, subscription: Disposable } {
            return { sink: Disposables.create(), subscription: Disposables.create() };
        }

    }
