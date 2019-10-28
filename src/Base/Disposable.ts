import { BitFlag } from "../common/Flag";

import { fatalError } from "../common/Logger";
import { Bag, BagKey } from "../common/Bag";


export interface UnsubscribeType<DisposeKey> {
    unsubscribe(disposeKey: DisposeKey):void;
}


export interface Disposable {
    dispose(): void;
};

export interface Cancelable extends Disposable {
    isDisposed(): boolean;
};

export enum DispoaseState {
    disposed = 1,
    sinkAndSubscriptionSet = 1 << 1
};

export class Disposables {
    static create(): NonDisposable {
        return noOp;
    }
};

class NonDisposable implements Disposable {
    dispose() {

    }
};

const noOp: Disposable = new NonDisposable();


export class SinkDisposer implements Disposable, Cancelable {
    state: BitFlag<DispoaseState> = new BitFlag<DispoaseState>(0);
    sink?: Disposable;
    subscription?: Disposable;

    isDisposed(): boolean {
        return this.state.isFlagSet(DispoaseState.disposed);
    }

    setSinkAndSubscription(sink: Disposable, subscription: Disposable) {
        this.sink = sink;
        this.subscription = subscription;

        const prevState = this.state.fetchOr(DispoaseState.sinkAndSubscriptionSet);
        if ((prevState & DispoaseState.sinkAndSubscriptionSet) != 0) {
            fatalError("Sink and subscription were already set")
            return;
        }

        if ((prevState & DispoaseState.sinkAndSubscriptionSet) != 0) {
            sink.dispose();
            subscription.dispose();
            this.sink = undefined;
            this.subscription = undefined;
        }
    }

    dispose() {
        const prevState = this.state.fetchOr(DispoaseState.disposed);
        if ((prevState & DispoaseState.disposed) != 0) {
            return;
        }

        if ((prevState & DispoaseState.sinkAndSubscriptionSet) != 0) {
            if (!this.sink) {
                fatalError("Sink not set")
                return;
            }
            if (!this.subscription) {
                fatalError("Subscription not set")
                return;
            }

            this.sink.dispose();
            this.subscription.dispose();
            this.sink = undefined;
            this.subscription = undefined;
        }
    }
};


export class SubscriptionDisposable implements Disposables {
    private _key: BagKey;
    private _owner: Bag<UnsubscribeType<BagKey>> = new Bag();
    constructor(owner: UnsubscribeType<BagKey>, key: BagKey) {
        this._owner.insert(owner);
        this._key = key;
    }
    dispose() {
        this._owner.forEach((t) => {
            t.unsubscribe(this._key);
        })
        this._owner.removeAll();
    }
}