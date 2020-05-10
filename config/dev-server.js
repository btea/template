const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const os = require('os');
const info = os.networkInterfaces();

const config = require('../webpack.config.js');
const port = 2233;
const options = {
    contentBase: './dist',
    hot: true,
    // host: '192.168.1.168',
    // port: port,
};

webpackDevServer.addDevServerEntrypoints(config, options);

const compiler = webpack(config);
const server = new webpackDevServer(compiler, options);

const address = () => {
    let uri = `http://localhost:${port}/`;
    console.log(`dev server listening on port ${port}`);
    console.log('App run at:');
    console.log('> Listening at ' + '\x1b[32;4;1;3m' + uri + '\n');
    if(info && typeof info === 'object'){
        for(let key in info){
            info[key] && info[key].forEach(item => {
                if(item.family === 'IPv4'){
                    console.log(`- Network: \x1b[32;4;1;3mhttp://${item.address}:${port}/`);
                }
            })
        }
    }
}
server.listen(port, 'localhost', () => {
    address();
})