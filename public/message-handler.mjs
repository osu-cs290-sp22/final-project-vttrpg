class MessageHandler {
    constructor(url) {
        this.url = url;
        this.handle = 0;
    }

    init() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.url);
            this.ws.addEventListener("open", event => {
                resolve();
            });
        });
    }

    send(data, noReply) {

        let handle = this.handle;
        if (!noReply) {
            data.handle = this.handle;
            this.handle++;
        }

        if (typeof data == "object") {
            data = JSON.stringify(data);
        }

        return new Promise((resolve, reject) => {
            let tempReplyHandler = message => {
                let reply = JSON.parse(message.data);
                if (reply.handle !== undefined && handle == reply.handle) {
                    resolve(reply);
                }
                this.ws.removeEventListener("message", tempReplyHandler);
            }

            this.ws.addEventListener("message", tempReplyHandler);

            this.ws.send(data);
        })
    }
}