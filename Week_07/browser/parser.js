/**
 * 解析 html
 * 解析文本，一般都用到状态机
 * 使用FSM来实现html的分析
 * 在html标准中，已经规定了html的状态，省去我们设计状态机的状态了
 * 标准中状态较多，当前parser的实现只针对其中一部分的状态，完成一个简单版本
 */

/**
 * 标签：1、开始标签；2、结束标签；3、自封闭标签
 */

let currentToken = null;
let currentAttribute = null;

function emit(token) {
    console.log(token);
}

// 使用技巧：
const EOF = Symbol('EOF'); // EOF: end of file

function data(c) {
    if (c === '<') {
        return tagOpen;
    } else if (c === EOF) {
        return;
    } else {
        return data;
    }
}

// 判断 标签开始，不是开始标签
function tagOpen(c) {
    if (c === '/') { // 结束标签
        return endTagOpen;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'startTag',
            tagName: '',
        }
        return tagName(c);
    } else {
        return;
    }
}

// 判断 结束标签的开始 例如 </div>
function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'endTag',
            tagName: '',
        }
        return tagName(c);
    } else if (c === '>') {

    } else if (c === EOF) {

    } else {

    }
}

// 判断 标签名 例如 <html attr>
function tagName(c) {
    if (c.match(/^[\t\n\f ]$/)) { // 在 html 中有效空白符有四种：tab符（\t）、换行符（\n）、禁止符（\f）、空格（ ）
        return beforeAttributeName;
    } else if (c === '/') {
        return selfClosingStartTag;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName +=c//.toLowerCase();
        return tagName;
    } else if (c === '>') {
        emit(currentToken);
        return data;
    } else {
        return tagName;
    }
}

// 判断 自封闭标签 例如 <img/>
function selfClosingStartTag(c) {
    if (c === '>') {
        currentToken.isSelfClosing = true;
        return data;
    } else if (c === 'EOF') {

    } else {

    }
}

// <html attr
function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c === '/' || c === '>' || c === EOF) {
        return afterAttributeName(c);
    } else if (c === '=') {
        
    } else {
        currentAttribute = {
            name: '',
            value: '',
        }
        return beforeAttributeName(c);
    }
}

function afterAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
        return afterAttributeName(c);
    } else if (c === '=') {
        return beforeAttributeValue;
    } else if (c === '\u0000') {

    } else if (c === '\"' || c === "'" || c === '<') {

    } else {
        currentAttribute.name += c;
        return beforeAttributeName;
    }
}

module.exports.parseHTML = function parseHTML(html) {
    let state = data;
    for(let c of html) {
        state = state(c);
    }
    state = state(EOF);
}