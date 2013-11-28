// var GooglePlusClient;

// GooglePlusClient = (function() {

// 	function GooglePlusClient(token) {
// 		this.token = token;
// 		this.baseUrl = 'https://www.googleapis.com/plus/v1';
// 	}

// 	GooglePlusClient.prototype.getCurrentUser = function(callback) {
// 		var req;
// 		req = {
// 			url: this.baseUrl + '/people/me',
// 			data: {
// 				access_token: this.token,
// 				v: 3.0,
// 				alt: 'json',
// 				'max-results': 10000
// 			}
// 		};
// 		return $.ajax(req).done(callback);
// 	};

// 	GooglePlusClient.prototype.getContacts = function(callback) {
// 		var req;
// 		req = {
// 			url: this.baseUrl + '/people/me/people/visible',
// 			data: {
// 				access_token: this.token,
// 				v: 3.0,
// 				alt: 'json',
// 				'max-results': 10000
// 			}
// 		};
// 		return $.ajax(req).done(callback);
// 	};

// 	return GooglePlusClient;

// })();

$("#templatesContainer").empty().remove();

$('<div id="templatesContainer"></div>').appendTo('body');

$('#templatesContainer').load(("javascripts/resources/templates.html?r=" + Date.now()), function(){

	if(typeof callback === "function"){
		callback();
	}

})

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

$(document).ready(function() {
	var answer, caller, currentCall, getCombinedChannel, gotStream, hangUp, increment, login, messageBox, messageControls, messageInput, modalAnswer, modalCalling, myStream, onCalling, pages, plusClient, publishStream, time, timeEl, timeInterval, userList, userTemplate, uuid, videoControls,
		_this = this;
	pages = {
		login: document.querySelector('#page-login'),
		caller: document.querySelector('#page-caller')
	};
	window.pubnub = null;
	uuid = null;
	currentCall = null;
	myStream = null;
	plusClient = null;
	document.querySelector('#login').addEventListener('click', function(event) {
		uuid = document.querySelector('#username').value;
		return login("guest-" + uuid);
	});
	login = function(name) {
		uuid = name;
		if (plusClient != null) {
			plusClient.getContacts(function(result) {});
		}
		window.pubnub = PUBNUB.init({
			publish_key: 'pub-c-8f61dc72-875d-4e34-9461-9c870d7c9f57',
			subscribe_key: 'sub-c-f5e33bbe-44f8-11e3-83cf-02ee2ddab7fe',
			uuid: name
		});
		pubnub.onNewConnection(function(uuid) {
			if (!!myStream) {
				return publishStream(uuid);
			}
		});
		//pages.login.className = pages.login.className.replace('active', '');
		//pages.caller.className += ' active';
		return $(document).trigger('pubnub:ready');
	};
	// window.signinCallback = function(authResult) {
	// 	if (authResult['access_token']) {
	// 		$('#signinButton').hide();
	// 		plusClient = new GooglePlusClient(authResult['access_token']);
	// 		return plusClient.getCurrentUser(function(result) {
	// 			var name;
	// 			name = result.displayName.split(' ');
	// 			name = name[0] + ' ' + name[1].charAt(0) + '.';
	// 			return login("" + result.id + "-" + name);
	// 		});
	// 	} else if (authResult['error']) {
	// 		return console.log("Sign-in state: " + authResult['error']);
	// 	}
	// };
	userTemplate = _.template($("#user-item-template").text());
	userList = $("#user-list");



	$(document).on('pubnub:ready', function(event) {
		return pubnub.subscribe({
			channel: 'phonebook',
			callback: function(message) {},
			presence: function(data) {
				var item, newItem;
				if (data.action === "join" && data.uuid !== uuid) {
					// newItem = userTemplate({
					// 	name: data.uuid.split('-')[1],
					// 	id: data.uuid
					// });
					// return userList.append(newItem);


      	newItem = '<li class="user" data-user="' + data.uuid + '">'
      	newItem += '<span class="name">' + data.uuid.split('-')[1] + '</span>'
      	newItem += '<a href="#" class="btn btn-success" data-user="' +  data.uuid + '">Call</a>'
      	newItem += '</li>'
    

					return userList.append(newItem);

				} else if (data.action === "leave" && data.uuid !== uuid) {
					item = userList.find("li[data-user=\"" + data.uuid + "\"]");
					return item.remove();
				}
			}
		});
	});

	caller = '';
	modalAnswer = $('#answer-modal');
	modalAnswer.modal({
		show: false
	});
	publishStream = function(uuid) {
		pubnub.publish({
			user: uuid,
			stream: myStream
		});
		return pubnub.subscribe({
			user: uuid,
			stream: function(bad, event) {
				return document.querySelector('#call-video').src = URL.createObjectURL(event.stream);
			},
			disconnect: function(uuid, pc) {
				document.querySelector('#call-video').src = '';
				return $(document).trigger("call:end");
			},
			connect: function(uuid, pc) {}
		});
	};
	answer = function(otherUuid) {
		if ((currentCall != null) && currentCall !== otherUuid) {
			hangUp();
		}
		currentCall = otherUuid;
		publishStream(otherUuid);
		$(document).trigger("call:start", otherUuid);
		return pubnub.publish({
			channel: 'answer',
			message: {
				caller: caller,
				callee: uuid
			}
		});
	};
	$(document).on('pubnub:ready', function(event) {
		pubnub.subscribe({
			channel: 'call',
			callback: function(data) {
				if (data.callee === uuid) {
					caller = data.caller;
					return onCalling(data.caller);
				}
			}
		});
		return pubnub.subscribe({
			channel: 'answer',
			callback: function(data) {
				if (data.caller === uuid) {
					if (data.callee !== currentCall) {
						hangUp();
					}
					currentCall = data.callee;
					publishStream(data.callee);
					return $(document).trigger("call:start", data.callee);
				}
			}
		});
	});
	onCalling = function(caller) {
		caller = caller.split('-')[1];
		modalAnswer.find('.caller').text("" + caller + " is calling...");
		return modalAnswer.removeClass("hide").modal('show');
	};
	modalAnswer.find('.btn-primary').on('click', function(event) {
		answer(caller);
		return modalAnswer.modal('hide');
	});
	modalCalling = $('#calling-modal');
	modalCalling.modal({
		show: false
	});
	$('#user-list').on('click', 'a[data-user]', function(event) {
		var name, otherUuid;
		otherUuid = $(event.target).data('user');
		currentCall = otherUuid;
		name = otherUuid.split('-')[1];
		modalCalling.find('.calling').text("Calling " + name + "...");
		modalCalling.removeClass("hide").modal('show');
		return pubnub.publish({
			channel: 'call',
			message: {
				caller: uuid,
				callee: otherUuid
			}
		});
	});
	$(document).on('call:start', function() {
		return modalCalling.modal('hide');
	});
	messageBox = $('#chat-receive-message');
	messageInput = $('#chat-message');
	messageBox.text('');
	messageControls = $('#chat-area');
	messageControls.hide();
	getCombinedChannel = function() {
		if (currentCall > uuid) {
			return "" + currentCall + "-" + uuid;
		} else {
			return "" + uuid + "-" + currentCall;
		}
	};
	$(document).on("call:start", function(event) {
		messageControls.show();
		messageBox.text('');
		return pubnub.subscribe({
			channel: getCombinedChannel(),
			callback: function(message) {
				messageBox.append("<br />" + message);
				return messageBox.scrollTop(messageBox[0].scrollHeight);
			}
		});
	});
	$(document).on("call:end", function(event) {
		messageControls.hide();
		return pubnub.unsubscribe({
			channel: getCombinedChannel()
		});
	});
	messageInput.on('keydown', function(event) {
		if (event.keyCode === 13 && (currentCall != null)) {
			pubnub.publish({
				channel: getCombinedChannel(),
				message: uuid.split('-')[1] + ": " + messageInput.val()
			});
			return messageInput.val('');
		}
	});
	$('#hang-up').on('click', function(event) {
		return hangUp();
	});
	hangUp = function() {
		return pubnub.closeConnection(currentCall, function() {
			return $(document).trigger("call:end");
		});
	};
	videoControls = $('#video-controls');
	timeEl = videoControls.find('#time');
	time = 0;
	timeInterval = null;
	videoControls.hide();
	increment = function() {
		var minutes, seconds;
		time += 1;
		minutes = Math.floor(time / 60);
		seconds = time % 60;
		if (minutes.toString().length === 1) {
			minutes = "0" + minutes;
		}
		if (seconds.toString().length === 1) {
			seconds = "0" + seconds;
		}
		return timeEl.text("" + minutes + ":" + seconds);
	};
	$(document).on("call:start", function(event) {
		videoControls.show();
		time = 0;
		timeEl.text("00:00");
		return timeInterval = setInterval(increment, 1000);
	});
	$(document).on("call:end", function(event) {
		videoControls.hide();
		return clearInterval(timeInterval);
	});
	gotStream = function(stream) {
		document.querySelector('#self-call-video').src = URL.createObjectURL(stream);
		return myStream = stream;
	};
	return navigator.getUserMedia({
		audio: true,
		video: true
	}, gotStream, function(error) {
		return console.log("Error getting user media: ", error);
	});
});
