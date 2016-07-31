
require('./style.scss');
var $ = require('zepto');
var model = require('./model.js');
var template = require('./_list.html');
//var common = require('common');
console.log('model:',model);
console.log('template:',template);
//console.log('common:',common);
//console.log('test:',test);
$(function(){
	$(document.body).append(template);
});

if(__DEBUG__){
	require(['sidebar'],function(sidebar){
		console.log('sidebar1',sidebar);
	});
}else{
	console.log('sidebar2',require('sidebar'));
}
require(['sidebar','dropdownMenu'],function(sidebar,dropdownMemu){
	console.log('sidebar',sidebar);
	console.log('dropdownMenu',dropdownMemu);
});