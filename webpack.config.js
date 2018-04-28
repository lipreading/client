const webpack = require('webpack');
const isProd = process.env.NODE_ENV === 'production';
const ExtractTextPlugin = require('extract-text-webpack-plugin');

console.log(`Is Production: ${isProd}`);

module.exports = {
    devtool: 'source-map',
    entry: {
        main: ['babel-polyfill', getPathForIndex()]
    },
    output: {
        filename: isProd ? '[name].bundle.min.js' : '[name].bundle.js',
        path: __dirname + '/build/client'
    },
    module: {
        loaders: [
            {test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/},
            {test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/},
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: [
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,
                            minimize: isProd,
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]})
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader', use: [
                        {
                            loader: 'css-loader',
                            options: {
                                url: false,
                                minimize: isProd,
                                sourceMap: true
                            }
                        }
                    ]
                })
            },
        ]
    },
    plugins: isProd ? [
        new ExtractTextPlugin('[name].bundle.min.css'),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new webpack.optimize.UglifyJsPlugin({
            warnings: true,
            compress: true,
            minimize: true
        })
    ] : [
        new ExtractTextPlugin('[name].bundle.css'),
    ]
};

function getPathForIndex() {
    return __dirname + `/client/init-components/index.jsx`
}