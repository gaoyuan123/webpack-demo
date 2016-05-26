require('./style.scss');
var model = require('./model.js');
var template = require('./_list.html');
var common = require('common');
console.log('model:',model);
console.log('template:',template);
console.log('common:',common);
console.log('test:',test);
$(function(){
	$(document.body).append(template);
});
require(['sidebar','dropdownMenu'],function(sidebar,dropdownMemu){
	console.log('sidebar',sidebar);
	console.log('dropdownMenu',dropdownMemu);
});
	
