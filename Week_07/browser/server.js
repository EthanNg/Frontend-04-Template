const http = require('http');

http.createServer((req, res) => {
    let body = [];
    req.on('error', err => {
        console.log('===>server:::报错了');
        console.error(err);
    }).on('data', chunk => {
        body.push(chunk);
        // body.push(chunk.toString());
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        // body = (Buffer.concat([ Buffer.from(body.toString()) ])).toString();
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(
`<html maaa=a >
<head>
    <style>
    </style>
</head>
<body>
    <div>
        <img id="myid" />
        <img />
    </div>
</body>
</html>`
        );
    })
}).listen(8088);

console.log('===>server started, listening 8088');