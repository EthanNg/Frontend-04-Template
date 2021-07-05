function match(string) {
    let state = start;
    for(let s of string) {
        state = state(s);
    }
    return state === end;
}

function start(s) {
    if (s === 'a')
        return foundA;
    else
        return start;
}

function end(s) { // trap 陷阱，当执行到end时，永远返回end，即无论后边还存在多少的字符，都不再改变状态
    return end;
}

function foundA(s) {
    if (s === 'b')
        return foundB;
    else
        return start(s);
}

function foundB(s) {
    if (s === 'c')
        return foundC;
    else
        return start(s);
}

function foundC(s) {
    if (s === 'd')
        return foundD;
    else
        return start(s);
}

function foundD(s) {
    if (s === 'e')
        return foundE;
    else
        return start(s);
}

function foundE(s) {
    if (s === 'f')
        return end;
    else
        return start(s);
}

console.log(match('heheabcdefhaha'));