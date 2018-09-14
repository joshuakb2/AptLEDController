import * as net from 'net';

export class DataForwarder {
    private sockets: Set<net.Socket>;
    private disposing: boolean;

    constructor() {
        this.sockets = new Set<net.Socket>();
        this.disposing = false;
    }

    registerSocket(s: net.Socket) {
        if (!this.disposing)
            this.sockets.add(s);
    }

    unregisterSocket(s: net.Socket) {
        this.sockets.delete(s);
    }

    forward(message: string, cb?: Function) {
        var leftToSend: number = this.sockets.size;

        var sent = (): void => {
            leftToSend--;

            if (leftToSend === 0) {
                if (cb)
                    cb();
            }
        };
        
        if (!this.disposing) {
            console.log('Forwarding "' + message + '" to ' + this.sockets.size + ' client' + (this.sockets.size === 1 ? '' : 's') + '.');

            this.sockets.forEach(function(s: net.Socket) {
                s.write(message, sent);
            });
        }
        else
            throw new Error('Cannot send a message after DataForwarder.dispose() has been called.');
    }

    dispose(cb?: Function) {
        var leftToClose: number = this.sockets.size;
 
        var closed = (): void => {
            if (leftToClose === 0) {
                this.sockets.clear();
                this.disposing = false;

                if (cb)
                    cb();
            }
        };

        if (!this.disposing) {
            this.disposing = true;

            if (this.sockets.size === 0)
                closed();
            else
                this.sockets.forEach(function(s: net.Socket) {
                    s.on('close', (): void => {
                        leftToClose--;
                        closed();
                    });
                    s.end();
                });
        }
    }
}
