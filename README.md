# [webpack](http://webpack.github.io/docs/)-demo

> 本项目基于webpack打包，所有入口文件读取基于约定，命名为*.entry.js即可，编译后会基于index.js的文件夹名称生成对应的html,js,css

## Install

```sh
$ npm install
```
## start

```sh
$ npm run start
```
或者双击运行`启动服务.cmd`

## build

```sh
$ npm run build
```
或者双击运行`编译发布.cmd`

##目录介绍
```
webpack/
├─build/                                        //编译后的资源目录
│   ├─chunk/									//产生的中间js文件
│   ├─images/									
│   ├─common/
│     	├─zepto.min.js                            
│     	├─common.js								//所有页面都会自动引入
│     	└─common.css							//全局样式文件
│   ├─components/								
│       └─sidebar   							
│     		├─sidebar.css				
│     		└─sidebar.js					
│   ├─module1/								//模块
│   	└─page1/
│     		├─page1.html					//页面入口html
│     		├─page1.js								
│     		└─page1.css								
├─src/                                      // 源文件目录
│  ├─common/
│  │    └─common.entry.js                   // common公共包入口文件
│  ├─components/							// 系统组件库目录
│       └─sidebar   
│     		└─sidebar.entry.js				//组件入口js
│  └─module1/								//模块	
│       └─page1/			                //页面
│     		├─_list.html					//页面模板html
│     		├─page1.entry.js						//页面入口js	
│     		└─style.scss					//页面样式	
│     		└─head.jpg					    //图片	
├─.gitignore     
├─编译发布.cmd   								//编译src资源到build目录
├─启动服务.cmd									//启动本地服务器
└─README.md
```
##注意事项

* 页面中用到common时可通过require('common')或者直接使用common对象即可
* components组件每个页面按需加载，通过require(['sidebar'],function(sidebar){})异步加载的方式加载
* 所有的页面访问，components组件导入都是访问的目录名称
* src/template.ejs为全局模板文件，所有页面模板会基于该文件生成，同时自动注入依赖的js，css资源




