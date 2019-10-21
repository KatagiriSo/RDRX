import { RDRX } from './RDRX';

function test() {
    const obj = RDRX.ObservableType.just("1000");
    const obj2 = obj.map((x: string) => {
        return x + "10000";
    });

    const d = obj2.subscribeOn((event: RDRX.Event<string>) => {
        switch (event.kind) {
            case "next":
                console.log(event.next);
                break;
            case "error":
                console.log(event.error);
                break;
            case "completed":
                console.log("completed");
                break;
        }
    });
    
}

console.log("hello");
test();