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
document.addEventListener('click',function(){
	require.ensure([], function(require) {
	  require.include("sidebar");
	  var dropdownMenu = require('dropdownMenu');
	  console.log(dropdownMenu);
	});
});
