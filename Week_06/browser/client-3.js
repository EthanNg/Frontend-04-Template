/**
 * 根据 client-2.js 基础上
 * 补全 send 函数和发送 Http 请求
 */
const net = require('net');

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
            // 这里的过程是逐步的，有必要去设计一个 responseParser，而不是一个 response 类
            // 这个 parser 可以通过逐步地接收 response 信息来构造 response 的对象的各个不同的部分
            const parser = new ResponseParser;

            if (connection) {
                connection.write(this.toString());
            } else {
                /* connection = net.createConnection({
                    host: this.host,
                    port: this.port,
                }, () => {
                    connection.write(this.toString());
                }); */
                connection = net.createConnection(
                    this.port,
                    this.host,
                    () => {
                        connection.write(this.toString());
                    }
                );
            }

            connection.on('data', data => {
                console.log(data.toString());
                parser.receive(data.toString());
                if (parser.isFinished) {
                    resolve(parser.response);
                    connection.end();
                }
            });

            connection.on('error', err => {
                reject(err);
                connection.end();
            });
        });
    }

    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r
\r
${this.bodyText}`
    }
}

class ResponseParser {
    constructor() {}
    receive(string) {
        for(let i = 0; i < string.length; i++) {
            this.receiveChar(string.charAt(i));
        }
    }
    /**
     * 状态机
     */
    receiveChar(char) {
        // ... TODO
    }
}

void async function () {
    let request = new Request({
        method: 'POST',
        host: '127.0.0.1',
        port: '8088',
        path: '/',
        headers: {
            [ 'X-Foo2' ]: 'customed'
        },
        body: {
            name: 'winter'
        }
    });

    let response = await request.send();

    console.log(response);
}();