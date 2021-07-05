/**
 * 根据 client-1.js 基础上
 * 编写send函数
 * 总结：
 * ·在 Request 的构造器中手机必要的信息
 * ·设计一个 send 函数，把请求真实发送到服务器
 * ·send 函数应该是异步，所有返回 Promise
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
    send() {
        return new Promise((resolve, reject) => {
            // 这里的过程是逐步的，有必要去设计一个 responseParser，而不是一个 response 类
            // 这个 parser 可以通过逐步地接收 response 信息来构造 response 的对象的各个不同的部分
            const parser = new ResponseParser;
            resolve(''); // 这里直接 resolve 掉，因为重点在于如何创建一个 parser，让代码直接执行起来，resolve 即可
        });
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