

export class BooleanFlag {
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
    get(): boolean {
        return this.value;
    }
}

export class BitFlag<T> {
    private value: number;

    constructor(value: number) {
        this.value = value;
    }
    set(value: number): number {
        const old = this.value;
        this.value = value;
        return old;
    }
    fetchOr(value: number): number {
        const old = this.value;
        this.value = this.value | value;
        return old;
    }
    get(): number {
        return this.value;
    }

    isFlagSet(mask: number): boolean {
        return (this.get() & mask) != 0;
    }
}
