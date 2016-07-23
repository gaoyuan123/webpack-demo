var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlResWebpackPlugin = require('html-res-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin-hash');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var AssetsPlugin = require('assets-webpack-plugin');
var HappyPack = require('happypack');
var autoprefixer = require('autoprefixer');
var args = require('yargs').argv;
//var fs = require('fs');
var path = require('path');
var glob = require('glob');
// parameters
var isProd = args.prod;
//var scriptReg = /<script.+src=[\"|\']([^\?|\s]+)\??.*[\"|\'].*><\/script>/ig;
//var styleReg = /<link.+href=[\"|\']([^\?|\s]+)\??.*[\"|\'].*>/ig;

var projectConfig = require('./project.config.json');
//第三方库
var externals = require(projectConfig.srcPath + projectConfig.libsPath + 'externals.config.json');
//导出配置
module.exports = {
    entry: {},
    output: {
        path: path.resolve(projectConfig.buildPath),
        publicPath: projectConfig.publicPath,
        filename: isProd ? '[name].[chunkhash:8].js' : '[name].js',
        chunkFilename: isProd ? 'chunk/[chunkhash:8].chunk.js' : 'chunk/[name].chunk.js',
        //libraryTarget: 'umd',
    },
    plugins: [
        //代码中直接使用common变量，编译时会自动require('common')
        /**new webpack.ProvidePlugin({
			common: 'common'
		}),**/
        new HappyPack({
            // loaders is the only required parameter:
            loaders: ['babel?cacheDirectory'],

            // customize as needed, see Configuration below
        }),
        new webpack.DefinePlugin({
            __DEBUG__: !isProd
        }),
        //copy libs
        new CopyWebpackPlugin([{
            from: projectConfig.srcPath + projectConfig.libsPath,
            to: projectConfig.libsPath
        }], {
            namePattern: isProd ? '[name]-[contenthash:6].js' : '[name].js'
        })
    ],
    resolve: {
        root: [path.resolve(projectConfig.srcPath)],
        extensions: ['', '.js', '.css', '.scss', '.json', '.html'],
        //别名，配置后可以通过别名导入模块
        alias: []
    },
    //第三方包独立打包，用来配置无module.exports的第三方库，require('zepto')时会自动导出module.exports = Zepto;
    externals: externals,
    //ExtractTextPlugin导出css生成sourcemap必须 devtool: 'source-map'且css?sourceMap
    devtool: isProd ? '' : 'cheap-source-map',
    //server配置
    devServer: {
        contentBase: projectConfig.srcPath,
        headers: {
            "Cache-Control": "no-cache"
        },
        stats: {
            colors: true,
        },
        host: '0.0.0.0',
        port: 8000
    },
    module: {
        noParse: [
            'node_modules'
        ],
        preLoaders: isProd ? [{
            test: /\.js$/,
            loader: "jshint-loader",
            exclude: /node_modules/
        }] : [],
        loaders: [{
            test: /\.js$/,
            loader: 'happypack/loader',
            exclude: /node_modules/
        }, {
            test: /\.html$/,
            loader: 'html'
        }, {
            test: /\.scss$/,
            loader: isProd ? ExtractTextPlugin.extract('css!postcss!sass') : 'style!css?sourceMap!postcss!sass'
        }, {
            test: /\.css$/,
            loader: isProd ? ExtractTextPlugin.extract('style!css') : 'style!css?sourceMap'
        }, {
            test: /\.(woff|woff2|ttf|eot|svg)(\?]?.*)?$/,
            loader: 'file?name=fonts/[name].[ext]?[hash:8]'
        }, {
            test: /\.(jpe?g|png|gif|svg)$/i,
            loaders: isProd ? [
                'url?limit=8192&name=images/[name].[hash:8].[ext]',
                'image-webpack?bypassOnDebug&optimizationLevel=5&interlaced=false'
            ] : ['url?limit=1&name=images/[name].[ext]']
        }]
    },
    postcss: function() {
        return [autoprefixer({
            browsers: ['Android 4', 'iOS 7']
        })];
    },
    jshint: {
        // any jshint option http://www.jshint.com/docs/options/
        // i. e.
        camelcase: true,

        // jshint errors are displayed by default as warnings
        // set emitErrors to true to display them as errors
        emitErrors: false,

        // jshint to not interrupt the compilation
        // if you want any file with jshint errors to fail
        // set failOnHint to true
        failOnHint: false,
        asi: true,
        boss: true,
        curly: true,
        expr: true
    },
};


//发布时加载插件
if (isProd) {
    module.exports.plugins.push(
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            //			mangle: false
        }),
        new webpack.optimize.OccurenceOrderPlugin(),
        //css单独打包
        new ExtractTextPlugin('[name].[hash:8].css')
//        new AssetsPlugin({
//            filename: 'build/assets-map.json',
//            update: true,
//            prettyPrint: true
//        })
    )
}

function log(msg) {
    console.log(' ' + msg);
}

log('=============================================');
log('查找到common入口文件：');
var commonEntryName;
glob.sync(projectConfig.commonEntry, {
    cwd: projectConfig.srcPath
}).forEach(function(entryPath) {
    var aliaName = path.basename(entryPath, '.entry.js');
    var entryName = commonEntryName = path.dirname(entryPath) + '/' + aliaName;
    var relpath = path.resolve(projectConfig.srcPath, entryPath);
    module.exports.resolve.alias[aliaName] = relpath;
    module.exports.entry[entryName] = [relpath];
    //打包公共模块
    module.exports.plugins.push(new CommonsChunkPlugin(entryName, isProd ? '[name].[chunkhash:8].js' : '[name].js'))
    log(entryPath);
});

log('\r\n =============================================');
log('查找到components入口文件：');

glob.sync(projectConfig.components, {
    cwd: projectConfig.srcPath
}).forEach(function(entryPath) {
    var aliaName = path.basename(entryPath, '.entry.js');
    module.exports.resolve.alias[aliaName] = path.resolve(projectConfig.srcPath, entryPath);
    log(entryPath);
});


//读取page配置文件
log('\r\n =============================================');
log('查找到page入口文件：');
var entryConfig = {
    inline: { // inline or not for index chunk
        js: isProd ? true : false,
        css: isProd ? true : false
    }
}

glob.sync(projectConfig.entrys, {
    cwd: projectConfig.srcPath
}).forEach(function(entryPath) {
    var aliaName = path.basename(entryPath, '.entry.js');
    var entryName = path.dirname(entryPath) + '/' + aliaName;
    if (!module.exports.resolve.alias[aliaName]) {
        module.exports.entry[entryName] = [path.resolve(projectConfig.srcPath, entryPath)];
        var chunks = {
            'libs/zepto': null
        };
        if (commonEntryName) chunks[commonEntryName] = null;
        chunks[entryName] = entryConfig;
        //加载html生成插件
        module.exports.plugins.push(new HtmlResWebpackPlugin({
            filename: entryName + '.html',
            template: path.join(projectConfig.srcPath, entryName + '.html'),
            htmlMinify: isProd ? {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            } : false,
            chunks: chunks,
            //            templateContent: templateContent
        }));
        log(entryPath);
    }
});

log('\r\n =============================================');
