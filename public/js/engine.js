var _tokenExpires = 0;
var _tracksFound = [];

var	_socket = io.connect('ws://localhost:3000');

ACCESS_TOKEN = null;

function doAuth() {
	window.open(
		"https://oauth.vk.com/authorize?"+ 
		"client_id=3769914&"+ 
		"scope=8&"+ 
		"redirect_uri=http://localhost&"+ 
		"display=page&"+ 
		"response_type=token", "_self"
	);
}

function getInputValueWithName(name) {
	return $('input[name="'+name+'"]').val();
}

function checkTokenExpired() {
	return (_tokenExpires <= (new Date()).valueOf());
}

function getToken() {
	ACCESS_TOKEN = getHashParam("access_token", 0);
	_tokenExpires = (new Date()).valueOf() + getHashParam('expires_in', 0);
}

function checkAndDoAuthIfExpired() {
	if (checkTokenExpired()) {
		$('#vk_connect').html(getInputValueWithName('vk.wait_connect'));
		doAuth();
	} else {
		$('#vk_connect').hide();
		$('#vk_search').show();
	}
}

function startAuthIfTokenExists() {
	getToken();
	if (ACCESS_TOKEN) { 
		startAuth();
	}
}

function startAuth() {
	checkAndDoAuthIfExpired();
	setInterval(function() {
		checkAndDoAuthIfExpired();
	}, '10000');
}

function getHashParam( param , def){
	var hash = location.hash.substr(1);
	var value = hash.substr(hash.indexOf(param+'=')).split('&')[0].split('=')[1];
	value = value?value:def;
    return value;
}

function setHandlers() {
	$('#vk_connect').one('click', function() {
		startAuth();
	});

	$('.searchlist').on('click', '.track-search', function(event) {
		event.stopPropagation();
		var id = $(this).attr('id').replace('trackSearch_', '');
		for (var key in _tracksFound) {
			if (_tracksFound[key].aid == id) {
				sendTrackToQueue(_tracksFound[key]);
				return;
			}
		}
	});

	$('.playlist').on('click', '.track-playlist', function(event) {
		event.stopPropagation();
		var id = $(this).attr('id').replace('trackPlaylist_', '');
		removeTrackFromQueue(id);
	});

	$('#vk_form_search').submit(function() {
		search($('#vk_search').val());
		return false;
	});

	_socket.on('playlist', function(tracks) {
        var playlist = $('.playlist');
        playlist.empty();
		for (var key in tracks) {
			var track = tracks[key];
            playlist.prepend(
	  			"<p>"+track.artist+
	  			" - <a class='track-playlist' id='trackPlaylist_"+track.hgId+
	  			"' href='javascript:void(0)'>"+track.title+
	  			"</a></p>"
  			);
		}
        if (Object.keys(tracks).length > 0) {
            $('#playlistHeader').show();
        } else {
            $('#playlistHeader').hide();
        }
	});

    _socket.on('track_playing', function(track) {
        $('.track-playing').remove();
        if (track) {
            $('.control').append(
                '<span class="track-playing">'+track.artist+' - '+track.title+'</span>'
            );
        }
    });

    $('#btn-stop').click(function() {
       _socket.emit('stop');
    });

    $('#btn-skip').click(function() {
        _socket.emit('skip');
    });

    $('#playlistHeader').hide();
    $('#searchlistHeader').hide();
}

function search(query) { 
	var script = document.createElement('SCRIPT'); 
	script.src = 'https://api.vk.com/method/audio.search?q='+
					query+
					'&access_token='+
					ACCESS_TOKEN+
					'&callback=callbackSearch'; 
	document.getElementsByTagName("head")[0].appendChild(script);
}

function callbackSearch(result) {
	$('.searchlist').empty();
	_tracksFound = [];
  	for (var key in result.response) {
  		item = result.response[key];
  		if (key == 0) continue;
  		_tracksFound.push(item);
  		$('.searchlist').append(
  			"<p>"+item.artist+
  			" - <a class='track-search' id='trackSearch_"+item.aid+
  			"' href='javascript:void(0)'>"+item.title+
  			"</a></p>"
  		);
  	}
    $('#searchlistHeader').show();
}

function sendTrackToQueue(track) {
	_socket.emit('send_track_to_queue', track);
}

function removeTrackFromQueue(trackId) {
	_socket.emit('remove_track_from_queue', trackId);
}

$(document).ready(function() {
	$('#vk_search').hide();
	setHandlers();
	startAuthIfTokenExists();
});
