const http = require('http');

// Render ki deployment fail hone se bachane ke liye simple web port opening
const port = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ALPHA MD IS RUNNING SUCCESSFULLY\n');
});

server.listen(port, () => {
    console.log(`[ Render ] Server is listening on port ${port}`);
});
