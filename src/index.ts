import { just, list } from './ope/Just';
import { BooleanFlag } from './common/Flag';
import { test, Poi } from './Tmp';
import { map } from './ope/Map';
import { flatMap } from './ope/FlatMap';
import { PublishSubject } from './ope/Subject';
import { Next, Completed } from './common/Event';


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




// const ob = x.map((x) => x + x)
//     .map((x) => x + x)
//     .map((x) => x + x);

// ob.subscribeOn((e) => {
//     if (e.kind == "next") {
//         console.log(e.next);
//     }
// })

// ob.subscribeOn((e) => {
//     if (e.kind == "next") {
//         console.log(e.next);
//     }
// })

// const x: BooleanFlag = new BooleanFlag(true);
// console.log(x.get());

test();