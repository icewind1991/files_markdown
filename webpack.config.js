const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = {
	entry: "./js/editor.ts",
	output: {
		filename: "build/editor.js"
	},
	resolve: {
		extensions: [".ts", ".js"]
	},
	plugins: [
		new UglifyJSPlugin(),
		new webpack.NamedModulesPlugin()
	],
	module: {
		loaders: [
			{
				test: /\.ts/,
				loader: "ts-loader"
			},
			{
				test: /\.js$/,
				include: [
					path.resolve(__dirname, "js"),
					path.resolve(__dirname, "node_modules/markdown-it-anchor"),
					path.resolve(__dirname, "node_modules/markdown-it-highlightjs")
				],
				use: {
					loader: 'babel-loader'
				}
			}
		]
	},
	node: {
		fs: 'empty'
	}
};