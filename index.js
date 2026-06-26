// Render Ke Liye HTML Server Link
const port = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    const htmlPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(htmlPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(htmlPath));
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('TAHA MD BOT IS RUNNING SUCCESSFULLY\n');
    }
});
server.listen(port, () => {
    console.log(`[ Render Server ] Web port opened on connection: ${port}`);
});
