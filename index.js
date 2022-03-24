const {join} = require('path');
const os = require('os');
const fs = require('fs');
const {getPort} = require('get-port-please');
const {WebSocketServer, WebSocket} = require("ws");

const argv = process.argv.slice(2);
const args = {};

argv.forEach((value, idx) => {
    if (!(idx % 2)) {
        const key = value.slice(1);
        args[key] = key === 'info' ? JSON.parse(argv[idx + 1]) : argv[idx + 1];
    }
});

const fileConfig = `${os.tmpdir()}/${args.info["plugin"]["uuid"]}.dev.json`;

const init = async () => {
    const devPluginPort = await getPort({random: true});
    const streamDeck = new WebSocket(`ws://localhost:${args.port}`);
    streamDeck.on('message', (data, binary) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data, {binary});
            }
        });
    });

    const wss = new WebSocketServer({port: devPluginPort});

    wss.on('connection', (ws) => {
        ws.on('message', (data) => {
            streamDeck.send(data);
        });
    });

    fs.writeFileSync(join(fileConfig), JSON.stringify({
        ...args,
        port: devPluginPort
    }));

}

setInterval(() => {
}, 1 << 30);

const clear = () => {
    try {
        fs.rmSync(fileConfig);
    } catch (e) {
    }
}

process.on("SIGINT", () => {
    clear();
    process.exit();
});

init().then();

