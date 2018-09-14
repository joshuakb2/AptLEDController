//  main.ts

var httpsServer: any, socketServer: any, livingRoom: any;
var ctrl_c: boolean = false;
var httpsSockets: Set<net.Socket> = new Set<net.Socket>();

process.on('SIGINT', function() {
    var httpsServerClosed: boolean = false;
    var socketServerClosed: boolean = false;
    var clientSocketsClosed: boolean = false;

    if (ctrl_c) {
        process.exit(1);
    }
    else {
        ctrl_c = true;

        console.log();
        console.log('Caught SIGINT. Disposing of client sockets and servers...');

        if (httpsServer instanceof https.Server) {
            httpsSockets.forEach(s => {
                s.destroy();
            });

            httpServer.close(function() {
                console.log('HTTP server closed.');
                httpsServerClosed = true;
                fin();
            });
        }
        else
            httpsServerClosed = true;


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
        if (httpsServerClosed && socketServerClosed && clientSocketsClosed)
            process.exit(0);
    }
});

import * as https from 'https';
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
httpsServer = startHttpsServer();

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

function startHttpsServer(): https.Server {
    let cert = fs.readFileSync('/etc/ssl/certs/jbserver.no-ip.org.cer');
    let key = fs.readFileSync('/etc/ssl/private/jbserver.no-ip.org.no-pw.key');

    let server = https.createServer({
        cert: cert,
        key: key
    }, function(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
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
        }
        finally {
            res.end();

            console.log('Caught exception and called res.end().');
        }
    });

    server.on('connection', function(socket) {
        httpsSockets.add(socket);

        socket.on('close', function() {
            socket.destroy();
            httpsSockets.delete(socket);
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

