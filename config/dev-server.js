const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');

const config = require('../webpack.config.js');
const port = 2233;
const options = {
    contentBase: './dist',
    hot: true,
    host: 'localhost',
    // mode: 'development'
    // port: port,
    // after: function(app){
    //     console.log('finished');
    // }
};

webpackDevServer.addDevServerEntrypoints(config, options);

const compiler = webpack(config);
const server = new webpackDevServer(compiler, options);

server.listen(port, 'localhost', () => {
    let uri = `http://localhost:${port}`;
    console.log(`dev server listening on port ${port}`);
    console.log('> Listening at ' + '\x1b[32;4;1;3m' + uri + '\n');
})