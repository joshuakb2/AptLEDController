//  Main.ts


import * as http from 'http';
import * as url from 'url';

startServer();

function startServer(): void {
    http.createServer(function(req: http.IncomingMessage, res: http.ServerResponse) {
        let pathname: string = url.parse(req.url).pathname;

        let body: string = '';

        req.on('data', function (data) {
            body += data;
        });

        req.on('end', function (): void {
            let data: object = null;
            try {
                data = JSON.parse(body);
            }
            catch (e) {
                console.error(e);
            }
            
            if (data)
                handleRequest(pathname, data, res, req.method);	
        });
    }).listen(15837);

    function handleRequest(pathname: string, data: object, res: http.ServerResponse, method: string): void {
        console.log('Pathname: ' + pathname);
        console.log('Data: ' + JSON.stringify(data));
        console.log('Method: ' + method);
        console.log();

        res.end();
    }
}
