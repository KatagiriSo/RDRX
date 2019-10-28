import { ObserverType } from '../Base/Observer';
import { Sink } from "../Base/Sink";
import { Cancelable, Disposable } from "../Base/Disposable";
import { Next, Completed } from "../common/Event";
import { Producer } from "../Base/Producer";
import { Observable, ObservableType } from "../Base/Observable";
import { RDEvent, RDError } from "../common/Event";


export class FlatMapSink<SourceType, Observer extends ObserverType<ResultType>, ResultType> extends Sink<Observer, ResultType> implements ObserverType<SourceType> {
    private m_tansform: (source: SourceType) => ObservableType<ResultType>
    constructor(transform: (source: SourceType) => Observable<ResultType>, observer: Observer, cancel: Cancelable) {
        super(observer, cancel);
        this.m_tansform = transform;
    }
    on(ev: RDEvent<SourceType>): void {
        // console.log("on!");
        switch (ev.kind) {
            case "next":
                const mappedElem = this.m_tansform(ev.next);
                mappedElem.subscribeOn((ev) => {
                    switch (ev.kind) {
                        case "next":
                            this.forwardOn(ev);
                            return;
                        case "error":
                            this.forwardOn(new RDError(ev.error));
                            return;
                        case "completed":
                            return;
                    }
                });
                return;
            case "error":
                this.forwardOn(new RDError(ev.error))
                this.dispose();
                return;
            case "completed":
                this.forwardOn(new Completed());
                this.dispose();
                return;
        }
    }
}

export class FlatMap<SourceType, ResultType> extends Producer<ResultType> {
    private source: Observable<SourceType>
    private transform: (s: SourceType) => ObservableType<ResultType>;

    constructor(source: Observable<SourceType>, transform: (s: SourceType) => Observable<ResultType>) {
        super();
        this.source = source;
        this.transform = transform;
    }

    run<O extends ObserverType<ResultType>>(observer: O, cancel: Cancelable): { sink: Disposable, subscription: Disposable } {
        const sink = new FlatMapSink(this.transform, observer, cancel);
        const subscription = this.source.subscribe(sink);
        return { sink: sink, subscription: subscription };
    }

}


export function flatMap<Elem, Result>(transform: (elm: Elem) => Observable<Result> ): (ob: ObservableType<Elem>) => Observable<Result> {
    return (ob) => new FlatMap(ob, transform);
}