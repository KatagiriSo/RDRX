const listDictionaryMaxSize = 30


export class BagKey {
    rawIndex: number;
    
    constructor(index: number) {
        this.rawIndex = index;
    }

    equal(key: BagKey): boolean {
        return this.rawIndex == key.rawIndex;
    }


}

type Entry<T> = { key: BagKey, value: T };

export class Bag<T> {
    private _nextKey: BagKey = new BagKey(0);
    private _count: number = 0;

    private _dict: { [key: number]: T } = {};
    insert(t: T): BagKey {
        const key = this._nextKey;
        this._nextKey = new BagKey(key.rawIndex + 1);
        this._dict[key.rawIndex] = t;
        this._count++;
        return key;        
    }

    count(): number {
        return this._count;
    }

    _removeKey(key: number): T | null {
        if (this._dict[key] != null) {
            const x = this._dict[key];
            delete this._dict[key];
            this._count--;
            return x;
        }
        return null;
    }

    removeKey(key: BagKey): T|null {
        return this._removeKey(key.rawIndex);
    }

    removeAll(): void {
        for (let key in this._dict) {
            this._removeKey(Number(key));
        }
    }

    

    forEach(f: (t:T) => void) {
        for (let key in this._dict) {
            f(this._dict[key]);
        }
    }



}



