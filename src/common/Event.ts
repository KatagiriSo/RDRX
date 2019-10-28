
export interface Error {

}

export type RDEvent<Elem> = Next<Elem> | RDError | Completed;

export class Next<Elem> {
    kind: "next" = "next"
    next: Elem
    constructor(elem: Elem) {
        this.next = elem;
    }
}

export class RDError {
    kind: "error" = "error"
    error: Error
    constructor(error: Error) {
        this.error = error;
    }
}

export class Completed {
    kind: "completed" = "completed"
}

