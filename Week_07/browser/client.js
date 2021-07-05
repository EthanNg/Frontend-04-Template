const net = require('net');
const parser = require('./parser.js');

class Request {
    constructor(options) {
        this.method = options.method || 'GET';
        this.host = options.host;
        this.port = options.port || 80;
        this.path = options.path || '/';
        this.body = options.body || {};
        this.headers = options.headers || {};
        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        if (this.headers['Content-Type'] === 'application/json')
            this.bodyText = JSON.stringify(this.body);
        else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded')
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&');

        this.headers['Content-Length'] = this.bodyText.length;
    }

    /**
     * send 的过程中，我们会逐步收到 response
     * 直到 response 构造好之后我们再让 Promise 得到 resolve
     */
    send(connection) {
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser;

            if (connection) {
                connection.write(this.toString());
            } else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port,
                }, () => {
                    connection.write(this.toString());
                });
            }

            connection.on('data', data => {
                // console.log(data.toString());
                parser.receive(data.toString());
                if (parser.isFinished) {
                    resolve(parser.response);
                }
                connection.end();
            });

            connection.on('error', err => {
                reject(err);
                connection.end();
            });
        });
    }

    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r\n${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r\n\r\n${this.bodyText}`
    }
}

class ResponseParser {
    constructor() {
        // todo 常量 -> 可优化成函数：性能、维护更好
        this.WAITING_STATUS_LINE = 0;
        this.WAITING_STATUS_LINE_END = 1;
        this.WAITING_HEADER_NAME = 2;
        this.WAITING_HEADER_SPACE = 3;
        this.WAITING_HEADER_VALUE = 4;
        this.WAITING_HEADER_LINE_END = 5;
        this.WAITING_HEADER_BLOCK_END = 6;
        this.WAITING_BODY = 7;

        this.current = this.WAITING_STATUS_LINE;
        this.statusLine = '';
        this.headers = {};
        this.headerName = '';
        this.headerValue = '';
        this.bodyParser = null; // 跟 header 相关，所以没法在创建 ResponseParser 就初始化
    }
    get isFinished() {
        return this.bodyParser && this.bodyParser.isFinished;
    }
    get response() {
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join('')
        }
    }
    receive(string) {
        for(let i = 0; i < string.length; i++) {
            this.receiveChar(string.charAt(i));
        }
    }
    /**
     * 状态机
     */
    receiveChar(char) {
        if (this.current === this.WAITING_STATUS_LINE) {
            if (char === '\r') {
                this.current = this.WAITING_STATUS_LINE_END;
            } else {
                this.statusLine += char;
            }
        } else if (this.current === this.WAITING_STATUS_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME;
            }
        } else if (this.current === this.WAITING_HEADER_NAME) {
            if (char === ':') {
                this.current = this.WAITING_HEADER_SPACE;
            } else if (char === '\r') {
                this.current = this.WAITING_HEADER_BLOCK_END;
                // Transfer-Encoding 有多个不同的值，node 的默认值为 chunked
                // 所以此处可以是多个 if else 的写法
                if (this.headers['Transfer-Encoding'] === 'chunked')
                    this.bodyParser = new TrunkedBodyParser();
            } else {
                this.headerName += char;
            }
        }else if (this.current === this.WAITING_HEADER_SPACE) {
            if (char === ' ')
                this.current = this.WAITING_HEADER_VALUE;
        } else if (this.current === this.WAITING_HEADER_VALUE) {
            if (char === '\r') {
                this.current = this.WAITING_STATUS_LINE_END;
                this.headers[this.headerName] = this.headerValue;
                this.headerName = '';
                this.headerValue = '';
            } else {
                this.headerValue += char;
            }
        } else if (this.current === this.WAITING_STATUS_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME;
            }
        } else if (this.current === this.WAITING_HEADER_BLOCK_END) {
            if (char === '\n') {
                this.current = this.WAITING_BODY;
            }
        } else if (this.current === this.WAITING_BODY) {
            this.bodyParser.receiveChar(char);
        }
    }
}

/**
 * TrunkedBody
 * 结构：长度后面跟着内容，这称为一个 trunked
 */
class TrunkedBodyParser {
    constructor() {
        this.WAITING_LENGTH = 0;
        this.WAITING_LENGTH_LINE_END = 1;
        this.READING_TRUNK = 2;
        this.WAITING_NEW_LINE = 3;
        this.WAITING_NEW_LINE_END = 4;
        this.length = 0;
        this.content = [];
        this.isFinished = false;
        this.current = this.WAITING_LENGTH;
    }
    receiveChar(char) {
        if (this.current === this.WAITING_LENGTH) {
            if (char === '\r') {
                if (this.length === 0) {
                    this.isFinished = true;
                    this.current = this.WAITING_NEW_LINE; // todo 防止 length 为负数
                }
                this.current = this.WAITING_LENGTH_LINE_END;
            } else {
                this.length *= 16;
                this.length += parseInt(char, 16);
            }
        } else if (this.current === this.WAITING_LENGTH_LINE_END) {
            if (char === '\n') {
                this.current = this.READING_TRUNK;
            }
        } else if (this.current === this.READING_TRUNK) {
            this.content.push(char);
            this.length --;
            if (this.length === 0)
                this.current = this.WAITING_NEW_LINE;
        } else if (this.current === this.WAITING_NEW_LINE) {
            if (char === '\r')
                this.current = this.WAITING_NEW_LINE_END;
        } else if (this.current === this.WAITING_NEW_LINE_END) {
            if (char === '\n')
                this.current = this.WAITING_LENGTH;
        }
    }
}

void async function () {
    let request = new Request({
        method: 'POST',
        host: '127.0.0.1', // 来自ip层
        port: '8088', // 来自tcp层
        path: '/',
        headers: {
            [ 'X-Foo2' ]: 'customed'
        },
        body: {
            name: 'winter'
        }
    });

    let response = await request.send();

    /**
     * 这里假如是真正的浏览器，这个地方必须是逐段返回 response 的 body 的；
     * 然后逐段的给 parser；
     * 此处为了简洁，api 只设计成把 body 全接收完再给 parser
     */
    let dom = parser.parseHTML(response.body);
}();