require('./style.scss');

var template = require('./_list.html');
var model = require('./model.js');

require.ensure(['sidebar'],function(require){
	var sidebar = require('sidebar');
	console.log('sidebar',sidebar);
	$(function(){
		$(document.body).append(template);
	});
});
	
