import { ObserverType, AnonymousObserver } from './Observer';
import { Disposable } from "./Disposable";
import { RDEvent } from "../common/Event";


export interface ObservableConvertibleType<Elem> {
    asObservable(): Observable<Elem>;
}

export interface ObservableType<Elem> extends ObservableConvertibleType<Elem> {
    subscribe<T extends ObserverType<Elem>>(observer: T): Disposable;
    subscribeOn(on: (ev: RDEvent<Elem>) => void): Disposable;
    pipe<RetElem>(f: (o: ObservableType<Elem>) => ObservableType<RetElem>): ObservableType<RetElem>;
}

export abstract class Observable<Elem> implements ObservableType<Elem> {
    abstract subscribe(observer: ObserverType<Elem>): Disposable;
    asObservable(): Observable<Elem> {
        return this;
    }

    subscribeOn(on: (ev: RDEvent<Elem>) => void): Disposable {
        const anonymousObserver = new AnonymousObserver(on);
        return this.asObservable().subscribe(anonymousObserver);
    }

    pipe<RetElem>(f: (o: ObservableType<Elem>) => ObservableType<RetElem>) : ObservableType<RetElem> {
        return f(this);
    }






}

