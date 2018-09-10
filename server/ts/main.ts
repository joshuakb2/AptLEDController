//  Main.ts

var httpServer: any, socketServer: any, livingRoom: any;
var ctrl_c: boolean = false;

process.on('SIGINT', function() {
    var httpServerClosed: boolean = false;
    var socketServerClosed: boolean = false;
    var clientSocketsClosed: boolean = false;

    if (ctrl_c) {
        process.exit(1);
    }
    else {
        ctrl_c = true;

        console.log();
        console.log('Caught SIGINT. Disposing of client sockets and servers...');

        if (httpServer instanceof http.Server) {
            httpServer.close(function() {
                console.log('HTTP server closed.');
                httpServerClosed = true;
                fin();
            });
        }
        else
            httpServerClosed = true;

        if (socketServer instanceof net.Server) {
            socketServer.close(function() {
                console.log('Socket server closed.');
                socketServerClosed = true;
                fin();
            });
        }
        else
            socketServerClosed = true;

        if (livingRoom instanceof DataForwarder) {
            livingRoom.dispose(function() {
                console.log('All client sockets closed.');
                clientSocketsClosed = true;
                fin();
            });
        }
        else
            clientSocketsClosed = true;

        fin();
    }

    function fin() {
        if (httpServerClosed && socketServerClosed && clientSocketsClosed)
            process.exit(0);
    }
});

import * as http from 'http';
import * as url from 'url';
import * as net from 'net';
import * as fs from 'fs';

import { DataForwarder } from './DataForwarder';

interface Token {
    token: string,
    principal: string
}

interface WebHookData {
    token: string,
    makeIt: string
}

var validTokens: Array<Token> = JSON.parse(fs.readFileSync('tokens.json').toString('utf8')) as Array<Token>;

livingRoom = new DataForwarder();

socketServer = startSocketServer();
httpServer = startHttpServer();

function startSocketServer(): net.Server {
    let server = net.createServer(function(socket: net.Socket): void {
        console.log('Client socket connected.');

        livingRoom.registerSocket(socket);

        socket.on('close', function(hadError) {
            if (hadError)
                console.error('Client disconnected due to an error.');
            else
                console.log('Client disconnected.');

            livingRoom.unregisterSocket(socket);
        });
    });

    server.on('error', function(e: Error) {
        console.error('Socket server error:', e);
    });

    server.listen(15838, function() {
        console.log('Socket server is listening on port 15838.');
    });

    return server;
}

function startHttpServer(): http.Server {
    let server = http.createServer(function(req: http.IncomingMessage, res: http.ServerResponse) {
        let pathname: string;
        if (typeof req.url === 'string')
            pathname = url.parse(req.url).pathname || '<undefined>';
        else
            pathname = '<undefined>';

        let body: string = '';

        req.on('data', function (data) {
            body += data;
        });

        req.on('end', function (): void {
            let data = null;
            try {
                data = JSON.parse(body);
            }
            catch (e) {
                console.error(e);
            }

            if (data)
                handleRequest(pathname, data as WebHookData, res, req.method || '<undefined>');
        });
    });
    
    server.listen(15837, function() {
        console.log('HTTP server is listening on port 15837.');
    });

    return server;

    function handleRequest(pathname: string, data: WebHookData, res: http.ServerResponse, method: string): void {
        console.log('Method: ' + method);
        console.log('Pathname: ' + pathname);
        console.log('Data: ', data);
        console.log();

        let t;

        if ((t = validTokens.find(x => x.token === data.token))) {
            console.log('Message came from "' + t.principal + '".');
            
            livingRoom.forward(data.makeIt || "");
        }
        else {
            console.error('Error: Invalid token');
        }

        console.log();
        res.end();
    }
}

