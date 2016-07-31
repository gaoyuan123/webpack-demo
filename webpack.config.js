'use strict'
let webpack = require('webpack');
let ExtractTextPlugin = require("extract-text-webpack-plugin");
let HtmlResWebpackPlugin = require('html-res-webpack-plugin');
let CopyWebpackPlugin = require('copy-webpack-plugin-hash');
let CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
//let AssetsPlugin = require('assets-webpack-plugin');
let HappyPack = require('happypack');
let autoprefixer = require('autoprefixer');
let args = require('yargs').argv;
let path = require('path');
let glob = require('glob');
// parameters
let isProd = args.p;
let resInline = args.resinline;

//let scriptReg = /<script.+src=[\"|\']([^\?|\s]+)\??.*[\"|\'].*><\/script>/ig;
//let styleReg = /<link.+href=[\"|\']([^\?|\s]+)\??.*[\"|\'].*>/ig;

let projectConfig = require('./project.config.json');
let srcPath = path.resolve(projectConfig.srcPath);

//第三方库
let externals = require(projectConfig.srcPath + projectConfig.libsPath + 'externals.config.json');

//导出配置
module.exports = {
    //entry配置项的根目录（绝对路径）
    context: srcPath,
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
            loaders: ['babel?cacheDirectory&plugins[]=transform-runtime'],
        }),
        new webpack.DefinePlugin({
            __DEBUG__: !isProd,
            __PROD__: isProd
        }),
        //copy libs
        new CopyWebpackPlugin([{
            from: projectConfig.libsPath,
            to: projectConfig.libsPath
        }], {
            namePattern: isProd ? '[name]-[contenthash:6].js' : '[name].js'
        })
    ],
    resolve: {
        root: [srcPath],
        extensions: ['', '.js', '.css', '.scss', '.json', '.html'],
        //别名，配置后可以通过别名导入模块
        alias: []
    },
    //第三方包独立打包，用来配置无module.exports的第三方库，require('zepto')时会自动导出module.exports = Zepto;
    externals: externals,
    //ExtractTextPlugin导出css生成sourcemap必须 devtool: 'source-map'且css?sourceMap
    devtool: isProd ? '' : 'cheap-eval-source-map',
    //server配置
    devServer: {
        //contentBase: srcPath,
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
                'url?limit=8192&name=[path][name].[hash:8].[ext]',
                'image-webpack?bypassOnDebug&optimizationLevel=5&interlaced=false'
            ] : ['file?name=[path][name].[ext]']
        }]
    },
    postcss: function() {
        return [autoprefixer({
            browsers: ['Android 4', 'iOS 7']
        })];
    },
    jshint: {
        esversion: 6,
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
        expr: true,
        //        undef: true,
        unused: true
    },
};


//发布时加载插件
isProd && module.exports.plugins.push(
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    //css单独打包
    new ExtractTextPlugin('[name].[hash:8].css')
    //        new AssetsPlugin({
    //            filename: 'build/assets-map.json',
    //            update: true,
    //            prettyPrint: true
    //        })
)

function log(msg) {
    console.log(' ' + msg);
}

log('=============================================');
log('查找到common入口文件：');
let commonEntryName;
projectConfig.commonEntry && glob.sync(projectConfig.commonEntry, {
    cwd: srcPath
}).forEach(function(entryPath) {
    let aliaName = path.basename(entryPath, '.entry.js');
    let entryName = commonEntryName = path.dirname(entryPath) + '/' + aliaName;
    module.exports.resolve.alias[aliaName] = entryPath;
    module.exports.entry[entryName] = [entryPath];
    //打包公共模块
    module.exports.plugins.push(new CommonsChunkPlugin(entryName, isProd ? '[name].[chunkhash:8].js' : '[name].js'))
    log(entryPath);
});

log('\r\n =============================================');
log('查找到components入口文件：');

projectConfig.components && glob.sync(projectConfig.components, {
    cwd: srcPath
}).forEach(function(entryPath) {
    let aliaName = path.basename(entryPath, '.entry.js');
    module.exports.resolve.alias[aliaName] = entryPath;
    log(entryPath);
});


//读取page配置文件
log('\r\n =============================================');
log('查找到page入口文件：');
let entryConfig = {
    inline: { // inline or not for index chunk
        js: !! resInline,
        css: !! resInline
    }
}

glob.sync(projectConfig.entrys, {
    cwd: srcPath
}).forEach(function(entryPath) {
    let aliaName = path.basename(entryPath, '.entry.js');
    let entryName = path.dirname(entryPath) + '/' + aliaName;
    if (!module.exports.resolve.alias[aliaName]) {
        module.exports.entry[entryName] = [entryPath];
        let chunks = {
            'libs/zepto': null
        };
        if (commonEntryName) chunks[commonEntryName] = null;
        chunks[entryName] = entryConfig;
        //加载html生成插件
        module.exports.plugins.push(new HtmlResWebpackPlugin({
            filename: entryName + '.html',
            template: path.join(srcPath, entryName + '.html'),
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
