export namespace RDRX {
    export class Boolean {
        private value: boolean;
        constructor(value: boolean) {
            this.value = value;
        }
        set(value: boolean) {
            const old = this.value;
            this.value = value;
            return old;
        }
        fetchOr(value: boolean) {
            const old = this.value;
            this.value = this.value || value;
            return old;
        }
        get():boolean {
            return this.value;
        }
    }

    export class BitFlag<T> {
        private value: number;
    
        constructor(value: number) {
            this.value = value;
        }
        set(value: number):number {
            const old = this.value;
            this.value = value;
            return old;
        }
        fetchOr(value: number):number {
            const old = this.value;
            this.value = this.value|value;
            return old;
        }
        get(): number {
            return this.value;
        }

        isFlagSet(mask: number): boolean {
            return (this.get() & mask) != 0;
        }
    }
}

export namespace RDRX {
    export interface Error {

    }

    export type Event<Element> = Next<Element> | Error | Completed;

    export class Next<Element> {
        kind: "next" = "next"
        next: Element
        constructor(element: Element) {
            this.next = element;
        }
    }

    export class Error {
        kind: "error" = "error"
        error: RDRX.Error
        constructor(error: Error) {
            this.error = error;
        }
    }

    export class Completed {
        kind: "completed" = "completed"
    }
}

export namespace RDRX {
    export function fatalError(message: string) {
        console.log(message);
        // exception;
    }
}

export namespace RDRX {
    export interface Disposable {
        dispose():void;
    }

    export interface Cancelable extends Disposable {
        isDisposed(): boolean;
    }

    export enum DispoaseState {
        disposed = 1,
        sinkAndSubscriptionSet = 1 << 1
    }

    export class Disposables {
        static create():NonDisposable {
            return noOp;
        }
    }

    class NonDisposable implements Disposable {
        dispose() {

        }
    }
    const noOp: Disposable = new NonDisposable();


     

    export class SinkDisposer implements Disposable, Cancelable {
        state: RDRX.BitFlag<RDRX.DispoaseState> = new RDRX.BitFlag<RDRX.DispoaseState>(0);
        sink?: Disposable;
        subscription?: Disposable;
        
        isDisposed(): boolean {
            return this.state.isFlagSet(RDRX.DispoaseState.disposed);
        }

        setSinkAndSubscription(sink: Disposable, subscription: Disposable) {
            this.sink = sink;
            this.subscription = subscription;

            const prevState = this.state.fetchOr(RDRX.DispoaseState.sinkAndSubscriptionSet);
            if ((prevState & RDRX.DispoaseState.sinkAndSubscriptionSet) != 0) {
                RDRX.fatalError("Sink and subscription were already set")
                return;
            }

            if ((prevState & RDRX.DispoaseState.sinkAndSubscriptionSet) != 0) {
                sink.dispose();
                subscription.dispose();
                this.sink = undefined;
                this.subscription = undefined;
            }
        }

        dispose() {
            const prevState = this.state.fetchOr(RDRX.DispoaseState.disposed);
            if ((prevState & RDRX.DispoaseState.disposed) != 0) {
                return;
            }

            if ((prevState & RDRX.DispoaseState.sinkAndSubscriptionSet) != 0) {
                if (!this.sink) {
                    RDRX.fatalError("Sink not set")
                    return;
                }
                if (!this.subscription) {
                    RDRX.fatalError("Subscription not set")
                    return;
                }

                this.sink.dispose();
                this.subscription.dispose();
                this.sink = undefined;
                this.subscription = undefined;
            }
        }
    }
}

export namespace RDRX {

    export interface ObserverType<Element> {
        on(ev: RDRX.Event<Element>):void
    }

    export class ObserverBase<Element> implements ObserverType<Element>, Disposable {
        private isStopped: RDRX.Boolean = new RDRX.Boolean(false);
        on(ev: RDRX.Event<Element>) {
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




        onCore(ev: RDRX.Event<Element>) {
            // abst
        }

        dispose() {
            this.isStopped.fetchOr(true);
        }
    }

    type EventHandler<Element> = (ev: Event<Element>) => void;

    export class AnonymousObserver<Element> extends ObserverBase<Element> {
        private eventHandler: EventHandler<Element>;
        constructor(eventHandler: EventHandler<Element>) {
            super();
            this.eventHandler = eventHandler;
        }

        onCore(ev: Event<Element>) {
            this.eventHandler(ev);
        }
        
    }
}

export namespace RDRX {

    export interface ObservableConvertibleType<Element> {
        asObservable(): Observable<Element>;
    }

    export interface ObservableType<Element> extends ObservableConvertibleType<Element> {
        subscribe<T extends RDRX.ObserverType<Element>>(observer: T): RDRX.Disposable;
        subscribeOn(on: (event: Event<Element>) => void): RDRX.Disposable;
        map<Result>(transform: (element: Element) => Result): Observable<Result>;
    }

export abstract class Observable<Element> implements ObservableType<Element> {
    abstract subscribe(observer: RDRX.ObserverType<Element>): RDRX.Disposable;
    asObservable(): Observable<Element> {
        return this;
    }
    
    subscribeOn(on: (event: Event<Element>) => void): RDRX.Disposable {
        const anonymousObserver = new AnonymousObserver(on);
        return this.asObservable().subscribe(anonymousObserver);
    }


        map<Result>(transform: (element: Element) => Result): Observable<Result> {
            return new Map(this.asObservable(), transform);
        }


        
    }

}

export namespace RDRX {
    export class Sink<Observer extends RDRX.ObserverType<Element>, Element> implements RDRX.Disposable {
        observer: Observer;
        cancel: Cancelable;
        private m_disposed: RDRX.Boolean = new RDRX.Boolean(false);
        constructor(observer: Observer, cancel: Cancelable) {
            this.observer = observer;
            this.cancel = cancel;
        }

        forwardOn(event: Event<Element>) {
            if (this.m_disposed.get()) {
                return;
            }
            this.observer.on(event);
        }

        forwarder(): SinkForward<Observer, Element> {
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

    class SinkForward<Observer extends RDRX.ObserverType<Element>, Element> implements RDRX.ObserverType<Element> {
        private forward: Sink<Observer, Element>;
        constructor(forward: Sink<Observer, Element>) {
            this.forward = forward;
        }

        on(event: Event<Element>) {
            switch (event.kind) {
                case "next":
                    this.forward.observer.on(event);
                    return;
                case "error":
                case "completed":
                    this.forward.observer.on(event);
                    this.forward.cancel.dispose();

            }
        }




    }
}

export namespace RDRX {
    export abstract class Producer<Element> extends Observable<Element> {
        subscribe<T extends RDRX.ObserverType<Element>>(observer: T): RDRX.Disposable {
            // thread...
            const disposer = new SinkDisposer();
            const sinkAndSubscriotion = this.run(observer, disposer);
            disposer.setSinkAndSubscription(sinkAndSubscriotion.sink, sinkAndSubscriotion.subscription);
            return disposer;
        }

        abstract run<O extends ObserverType<Element>>(observer: O, cancel: Cancelable): { sink: Disposable, subscription: Disposable };
    }
}

export namespace RDRX {


    class MapSink<SourceType, Observer extends RDRX.ObserverType<ResultType>, ResultType> extends RDRX.Sink<Observer, ResultType> implements ObserverType<SourceType> {
        private m_tansform: (source: SourceType) => ResultType
        constructor(transform: (source: SourceType) => ResultType, observer:Observer, cancel: Cancelable) {
            super(observer, cancel);
            this.m_tansform = transform;
        }

        on(event: Event<SourceType>):void {
            switch (event.kind) {
                case "next":
                    const mappedElement = this.m_tansform(event.next);
                    this.forwardOn(new RDRX.Next(mappedElement));
                    return;
                case "error":
                    this.forwardOn(new RDRX.Error(event.error))
                    this.dispose();
                    return;
                case "completed":
                    this.forwardOn(new RDRX.Completed());
                    this.dispose();
                    return;
            }
        }
    }

    export class Map<SourceType, ResultType> extends Producer<ResultType> {
        private source: RDRX.Observable<SourceType>
        private transform: (s: SourceType) => ResultType;

        constructor(source: RDRX.Observable<SourceType>, transform: (s: SourceType) => ResultType) {
            super();
            this.source = source;
            this.transform = transform;
        }

        run<O extends ObserverType<ResultType>>(observer: O, cancel: Cancelable): { sink: Disposable, subscription: Disposable } {
            const sink = new MapSink(this.transform, observer, cancel);
            const subscription = this.source.subscribe(sink);
            return { sink: sink, subscription: subscription };
        }

    }
}

export namespace RDRX {
    export namespace ObservableType {
        export function just<Element>(element: Element): Observable<Element> {
            return new Just(element);
        }
    }

    class Just<Element> extends Producer<Element> {
        private element: Element;
        constructor(element: Element) {
            super();
            this.element = element;
        }

        subscribe<T extends RDRX.ObserverType<Element>>(observer: T): RDRX.Disposable {
            // thread...
            observer.on(new Next(this.element));
            observer.on(new Completed());
            return Disposables.create();
        }

        run<O extends ObserverType<Element>>(observer: O, cancel: Cancelable): { sink: Disposable, subscription: Disposable } {
            return { sink: Disposables.create(), subscription: Disposables.create() };
        }

    }
}