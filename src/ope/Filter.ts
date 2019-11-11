import { ObserverType } from "../Base/Observer";
import { Sink } from "../Base/Sink";
import { Cancelable, Disposable } from "../Base/Disposable";
import { Next, Completed } from "../common/Event";
import { Producer } from "../Base/Producer";
import { Observable, ObservableType } from "../Base/Observable";
import { RDEvent, RDError } from "../common/Event";


export class FilterSink<SourceType, Observer extends ObserverType<SourceType>, ResultType> extends Sink<Observer, SourceType> implements ObserverType<SourceType> {
    private m_predicate: (source: SourceType) => boolean
    constructor(predicate: (source: SourceType) => boolean, observer: Observer, cancel: Cancelable) {
        super(observer, cancel);
        this.m_predicate = predicate;
    }
    on(ev: RDEvent<SourceType>): void {
        switch (ev.kind) {
            case "next":
                if (this.m_predicate(ev.next)) {
                    this.forwardOn(ev);
                }
                return;
            case "error":
                this.forwardOn(ev)
                this.dispose();
                return;
            case "completed":
                this.forwardOn(ev);
                this.dispose();
                return;
        }
    }
}

export class Filter<SourceType> extends Producer<SourceType> {
    private source: Observable<SourceType>
    private predicate: (s: SourceType) => boolean;

    constructor(source: Observable<SourceType>, predicate: (s: SourceType) => boolean) {
        super();
        this.source = source;
        this.predicate = predicate;
    }

    run<O extends ObserverType<SourceType>>(observer: O, cancel: Cancelable): { sink: Disposable, subscription: Disposable } {
        const sink = new FilterSink(this.predicate, observer, cancel);
        const subscription = this.source.subscribe(sink);
        return { sink: sink, subscription: subscription };
    }

}


export function filter<Elem>(predicate: (elm: Elem) => boolean): (ob: ObservableType<Elem>) => Observable<Elem> {
    return (ob) => new Filter(ob, predicate);
}