var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
//var AssetsPlugin = require('assets-webpack-plugin');
var autoprefixer = require('autoprefixer');
var args = require('yargs').argv;
//var fs = require('fs');
var path = require('path');
var glob = require('glob');
// parameters
var isProd = args.prod;

var buildPath = './build/';
var srcPath = './src/';
var publicPath = '/';
var libsPath = srcPath + 'libs/';
//html模板文件
var tempatePath = path.join(srcPath, 'template.ejs');
var commonEntryName = 'common/common';
//入口
var entryJs = {};
//别名配置,所有的components组件和common模块使用别名
var alias = {
	common: path.join(__dirname, srcPath, 'common/common.entry.js')
};
//第三方库
var externals = require(libsPath + 'externals.config.json');

var plugins = [
	//代码中直接使用common变量，编译时会自动require('common')
	/**new webpack.ProvidePlugin({
		common: 'common'
	}),**/
    new webpack.DefinePlugin({
		__DEBUG__: !isProd
	}),
	//打包公共模块
	new CommonsChunkPlugin(commonEntryName, isProd ? '[name]-[hash].js' : '[name].js'),
	//new AssetsPlugin({filename:'build/assets-map.json',update: true,prettyPrint: true}),
	//copy zepto
    new CopyWebpackPlugin([
		{
			from: libsPath,
			to: libsPath.replace(srcPath)
		}
    ])
];

//发布时加载插件
if (isProd) {
	plugins.push(
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
		new ExtractTextPlugin(isProd ? '[name]-[chunkhash].css' : '[name].css')
	);
}

function log(msg) {
	console.log(' ' + msg);
}

//读取page配置文件
log('=============================================');
log('查找到页面入口文件：');
glob.sync(srcPath + '**/*.entry.js').forEach(function (entryPath) {
	if (/^\.\/src\/components/.test(entryPath)) {
		return;
	}
	var name = entryPath.substring(0, entryPath.indexOf('.entry.js')).replace(srcPath, '');
	//配置入口
	entryJs[name] = [entryPath];
	//加载html生成插件
	name != commonEntryName && plugins.push(new HtmlWebpackPlugin({
		filename: name + '.html',
		template: tempatePath,
		chunks: [name, commonEntryName],
		minify: isProd ? {} : false,
		zepto: publicPath + 'libs/zepto.min.js'
	}));
	log(entryPath);
});

log('\r\n =============================================');
log('查找组件入口文件：');

log('common : ' + alias.common);
glob.sync(srcPath + 'components/**/*.entry.js').forEach(function (filePath) {
	var aliaName = path.dirname(filePath).replace(srcPath + 'components/', '');
	alias[aliaName] = path.join(__dirname, filePath);
	log(aliaName + ' : ' + filePath);
});
log('\r\n =============================================\r\n');

//导出配置
module.exports = {
	entry: entryJs,
	output: {
		path: path.resolve(buildPath),
		publicPath: publicPath,
		filename: isProd ? '[name]-[chunkhash].js' : '[name].js',
		chunkFilename: isProd ? 'chunk/[chunkhash:8].chunk.js' : 'chunk/[name].chunk.js',
		//libraryTarget: 'umd',
	},
	plugins: plugins,
	resolve: {
		extensions: ['', '.js', '.css', '.scss', '.json', '.html'],
		//别名，配置后可以通过别名导入模块
		alias: alias
	},
	//第三方包独立打包，用来配置无module.exports的第三方库，require('zepto')时会自动导出module.exports = Zepto;
	externals: externals,
	//ExtractTextPlugin导出css生成sourcemap必须 devtool: 'source-map'且css?sourceMap
	devtool: 'source-map',
	//server配置
	devServer: {
		contentBase: srcPath,
		headers: {
			"Cache-Control": "no-cache"
		},
		historyApiFallback: true,
		stats: {
			modules: false,
			cached: false,
			colors: true,
			chunk: false
		},
		host: '0.0.0.0',
		port: 8000
	},
	module: {
		/* preLoaders: [
		    {
		        test: /\.js$/,
		        loader: "jshint-loader",
		        exclude: /node_modules/
		    }
		], */
		noParse: [

        ],
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel',
				exclude: /node_modules/
            },
			{
				test: /\.html$/,
				loader: 'html'
            },
//			{
//				test: /\.styl$/,
//				loader: isProd ? ExtractTextPlugin.extract('style!css?sourceMap!postcss!stylus') : 'style!css?sourceMap!postcss!stylus'
//            },
			{
				test: /\.scss$/,
				loader: isProd ? ExtractTextPlugin.extract('css?sourceMap!postcss!sass') : 'style!css?sourceMap!postcss!sass'
			},
			{
				test: /\.css$/,
				loader: isProd ? ExtractTextPlugin.extract('style!css?sourceMap') : 'style!css?sourceMap'
            },
			{
				test: /\.(woff|woff2|ttf|eot|svg)(\?]?.*)?$/,
				loader: 'file?name=fonts/[name].[ext]?[hash]'
            },
			{
				test: /\.(jpe?g|png|gif|svg)$/i,
				loaders: [
					'url?limit=' + (isProd ? 8192 : 1) + '&name=images/' + (isProd ? '[name]-[hash].[ext]' : '[name].[ext]'),
					'image-webpack?bypassOnDebug&optimizationLevel=5&interlaced=false'
				]
            }
        ]
	},
	postcss: function () {
		return [autoprefixer({
			browsers: ['Android 4', 'Chrome 28', 'iOS 6']
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