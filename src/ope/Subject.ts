import { ObservableType, Observable } from '../Base/Observable';
import { ObserverType, AnonymousObserver, AnonymousObservers } from '../Base/Observer';
import { Cancelable, Disposable, Disposables, SubscriptionDisposable, UnsubscribeType } from '../Base/Disposable';
import { RDEvent, RDError } from '../common/Event';
import { Bag, BagKey } from '../common/Bag';



interface SubjectType<T> extends ObservableType<T> {
    asObserver(): ObserverType<T>;
}

export class PublishSubject<T> extends Observable<T> implements SubjectType<T>, Cancelable, ObserverType<T>, UnsubscribeType<BagKey> {

    _observers: AnonymousObservers<T> = AnonymousObservers.create();
    _isDisposed: boolean = false;
    _isStopped: boolean = false;
    _stoppedEvent: RDEvent<T> | null = null;

    get hasObservers(): boolean {
        // ..lock...
        const ret = this._observers.count() > 0;
        return ret;
    }

    isDisposed(): boolean {
        return this._isDisposed;
    }

    on(ev: import("../common/Event").RDEvent<T>): void {
        this.getObserversForEvent(ev).forEach((observer) => {
            observer(ev);
        })
    }

    private getObserversForEvent(ev: import("../common/Event").RDEvent<T>): AnonymousObservers<T> {
        // lock..
        switch (ev.kind) {
            case "next":
                if (this._isDisposed || this._isStopped) {
                    return AnonymousObservers.create<T>();
                }
                return this._observers;
            case "completed":
            case "error":
                if (this._stoppedEvent == null) {
                    this._stoppedEvent = ev;
                    this._isStopped = true;
                    const observers = this._observers;
                    this._observers = AnonymousObservers.create<T>();
                    return observers;
                }

                return AnonymousObservers.create<T>();
        }
    }

    subscribe<O extends ObserverType<T>>(observer: O): Disposable {
        if (this._stoppedEvent) {
            observer.on(this._stoppedEvent);
            return Disposables.create();
        }

        if (this._isDisposed) {
            observer.on(new RDError(new Error("Already disposed..")));
            return Disposables.create();
        }

        const key = this._observers.insert(observer.on.bind(observer));
        return new SubscriptionDisposable(this, key);
    }

    unsubscribe(key:BagKey) {
        this._observers.removeKey(key);
    }

    dispose(): void {
        this._isDisposed = true;
        this._observers.removeAll();
        this._stoppedEvent = null;
    }


    asObserver(): ObserverType<T> {
        return this;
    }


    





}