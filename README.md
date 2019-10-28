# RDRX

RDRX is a typescript's Rx library from RxSwift.

```typescript

const x = list(["hoge","poge","tori"])
    .pipe(map((x) => {
        return x + x;
    }))
    .pipe(flatMap((x) => {
        return just("new!");
    }))
    .pipe(map((x) => {
        return x + "poi";
    }))

x.subscribeOn((x) => {
    if (x.kind == "next") {
        console.log(x.next);
    }
})


const sub = new PublishSubject<string>();

const o = sub.pipe(map((x) => {
    return x + x;
}))

const d = o.subscribeOn((ev) => {
    switch (ev.kind) {
        case "next":
            console.log(ev.next);
            break;
        case "error":
            console.log(ev.error);
            break;
        case "completed":
            console.log("completed");
            break;
    }
})

sub.on(new Next("A"));
sub.on(new Next("B"));
sub.on(new Completed());

sub.on(new Next("D"));
```