import './style.scss';
import {name,age} from './model.js';
import template from './_list.html';
import common from 'common';

console.log('model.name:',name);
console.log('model.age:',age);
console.log('template:',template);
console.log('common:',common);
//console.log('test:',test);

$(function(){
	$(document.body).append(template);
});
document.addEventListener('click',function(){
	require(['sidebar','dropdownMenu'],function(sidebar,dropdownMemu){
		console.log('sidebar',sidebar);
		console.log('dropdownMenu',dropdownMemu);
	});
});

	
