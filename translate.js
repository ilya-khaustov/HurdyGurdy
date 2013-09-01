var config = require('./config.js');

var expressions = {
	title : {
		en : 'HuGu interactive playlist',
		ru : 'HuGu - интерактивный плейлист'
	},
	vk : {
		try_connect : {
			en : 'Connect?',
			ru : 'Соединить?'
		},
		wait_connection : {
			en : 'Waiting to connect...',
			ru : 'Соединяем...'
		},
		placeholder_search : {
			en : 'Write some words',
			ru : 'Напиши несколько слов'
		}
	},
	about : {
		title : {
			en : 'About',
			ru : 'О проекте'
		}
	}
};

exports.expression = function(q) {
	var parts = q.split('.');
	var found = expressions;
	for (var key in parts) {
		var part = parts[key];
		console.log(part);
		if (part && found[part]) {
			found = found[part];
			if (found[config.locale]) {
				return found[config.locale];
			}
		}
	}
	return "";
};