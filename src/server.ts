
import connect from 'connect'
import serveStatic from 'serve-static'
import colors from 'yoctocolors'
import http from 'http'
import { WebSocketServer } from 'ws'

import { Config } from './config'
import { HtmlProcessor } from './processors'


export function createDevServer(dir: string, config: Config) {

    const connectServer = connect()
    connectServer.use((req, res, next) => {
        if (req.url === `/${HtmlProcessor.scriptName}`) {
            res.setHeader('Content-Type', 'application/javascript')
            res.end(reloadScript)
            return
        }
        next()
    })
    connectServer.use(serveStatic(dir, { cacheControl: false }))

    const server = http.createServer(connectServer)
    server.listen(
        config.server.port,
        config.server.host,
        () => { console.log(
            `\nListening on ` +
            `${colors.green(config.server.host)}:` +
            `${colors.cyan(config.server.port.toString())}!`
        )}
    )

    const wss = new WebSocketServer({ server })
    function broadcastReload() {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send('reload')
            }
        })
    }

    return broadcastReload
}


const reloadScript = `
var protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
var address = protocol + window.location.host + window.location.pathname + '/ws';
var socket = new WebSocket(address);
socket.onmessage = function(msg) {
    if (msg.data == 'reload') window.location.reload();
    // else if (msg.data == 'refreshcss') refreshCSS();
};
console.log('Norite: Live reload enabled.');
`
