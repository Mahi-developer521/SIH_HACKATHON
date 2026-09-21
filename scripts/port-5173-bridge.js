// Bridge to redirect any requests on port 5173 to port 4173
import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(302, {
    'Location': `http://localhost:4173${req.url || '/'}`,
    'Access-Control-Allow-Origin': '*'
  });
  res.end();
});

server.listen(5173, '0.0.0.0', () => {
  console.log('Bridge listening on port 5173 -> redirects to port 4173');
});
