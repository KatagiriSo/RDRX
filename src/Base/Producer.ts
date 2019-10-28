import { Disposable, Cancelable, SinkDisposer } from "./Disposable";
import { Observable } from "./Observable";
import { ObserverType } from "./Observer";

export abstract class Producer<Elem> extends Observable<Elem> {
    subscribe<T extends ObserverType<Elem>>(observer: T): Disposable {
        // thread...
        const disposer = new SinkDisposer();
        const sinkAndSubscriotion = this.run(observer, disposer);
        disposer.setSinkAndSubscription(sinkAndSubscriotion.sink, sinkAndSubscriotion.subscription);
        return disposer;
    }

    abstract run<O extends ObserverType<Elem>>(observer: O, cancel: Cancelable): { sink: Disposable, subscription: Disposable };
}

