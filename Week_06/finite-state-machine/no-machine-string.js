/**
 * 不用状态机、不用正则，在字符串中找到字符‘a’
 */
function match(str) {
    for (const s of str) {
        if (s === 'a')
            return true;
    }
    return false;
}
// console.log(match('I am groot'));

/**
 * 不用状态机、不用正则，在字符串中找到字符‘ab’
 */
function matchAB(str) {
    let foundA = false;
    for (const s of str) {
        if (s === 'a')
            foundA = true;
        else if (foundA && s === 'b')
            return true;
        else
            foundA = false;
    }
    return false;
}
console.log(matchAB('I am groot'));

/**
 * 不用状态机、不用正则，在字符串中找到字符‘abcdef’
 */
function matchA_F(str) {
    return str.indexOf('abcdef') > -1;
}
// console.log(matchA_F('abcdefcdef'));