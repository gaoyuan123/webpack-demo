require('./style.scss');

var template = require('./_list.html');
var model = require('./model.js');
console.log('template',template);
console.log('model',model);
require(['sidebar'],function(sidebar){
	console.log('sidebar',sidebar);
	$(function(){
		$(document.body).append(template);
	});
});
	

