(function(w,d,$, _){

	var agility_webrtc = {

		uuid : null,

		currentUser : null,

		currentCallUUID : null,

		currentCallTime : 0,

		currentCallInterval : null,

		channelMessages : [],

		channelName : "agility_webrtc",

		streams 	: [],

		credentials : {
			publish_key 	: 'pub-c-8f61dc72-875d-4e34-9461-9c870d7c9f57',
			subscribe_key 	: 'sub-c-f5e33bbe-44f8-11e3-83cf-02ee2ddab7fe'
		},
		init : function(){

			var self = agility_webrtc;

			self.loadTemplates({
				templates_url : "javascripts/resources/templates.html"
			}, function(){			

				self.setBinds();

				var user = sessionStorage.getItem("user");

				if(user){

					$("#username").val(user);
					$("#login").trigger("click");

				} else {
					$("#login_container").slideDown(200);
				}


			})

		},
		hideControls : function(){

			$('#video-controls').hide();

		},
		showControls : function(){

			$('#video-controls').show();

		},
		setCurrentCallTime : function(time){

			$('#video-controls #time').html(time);

		},
		hideStream : function(options){

			$(options.who)[0].src = "";

			if(options.who === "#you"){
				$(".streaming_container").css({height : "300px"});
			}

		},
		login : function(){

			var name = $("#username").val().trim();

			agility_webrtc.uuid = name;

			agility_webrtc.credentials.uuid = name;

			agility_webrtc.currentUser = PUBNUB.init(agility_webrtc.credentials);	

			agility_webrtc.currentUser.onNewConnection(function(uuid) {

				agility_webrtc.publishStream({ uuid : uuid });

			});					

			agility_webrtc.connectToListChannel();

			agility_webrtc.connectToCallChannel();

			agility_webrtc.connectToAnswerChannel();



			return this;
		
		},
		showStream  	: function(options){

			var stream = _.find(this.streams, function(stream){
				return stream.who === options.who;
			}).stream;

			var video = $(options.container)[0];
				
			video.src = window.URL.createObjectURL(stream);

			$(video).fadeIn(300);

			if(options.container === "#you"){
				$(".streaming_container").css({height : "500px"});
			}

		},		
		requestStream : function(options,callback, errorCallback){

			var stream = _.find(agility_webrtc.streams, function(stream){ return stream.who === "mine"; });			

			if(stream != null){
				callback(stream.stream);
			} else {

				navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia ||navigator.mozGetUserMedia ||navigator.msGetUserMedia);	
				
				if(navigator.getUserMedia != null){

					navigator.getUserMedia(options, function(stream) {
					
						if(typeof callback === 'function'){
							callback(stream);
						}

					}, function(e) {

						console.log('No access to getUserMedia!', e);
						
						if(typeof errorCallback === 'function'){
							errorCallback(e);
						}
						

					});					

				}

			}

		},
		publishStream : function(options){

			var stream = _.find(agility_webrtc.streams, function(stream){ return stream.who === "mine"; });

			var resumeStreaming = function(stream){

				//Show my stream:

				agility_webrtc.showStream({ who : "mine" , container : '#me'});

				agility_webrtc.currentUser.publish({ user: options.uuid, stream: stream });
				
				agility_webrtc.currentUser.subscribe({
					user: options.uuid,
					stream: function(bad, event) {
						agility_webrtc.streams.push({ who 	: "you", stream 	: event.stream });
						agility_webrtc.showStream({ who : "you" , container : '#you'});
					},
					disconnect: function(uuid, pc) {
						agility_webrtc.hideStream({who : "#you"})
						agility_webrtc.onEndCall();
					}
				});				


			}

			

			if(stream == null){

				agility_webrtc.requestStream({
					video : true,
					audio : true
				}, function(stream){

					agility_webrtc.streams.push({ who : "mine", stream : stream });

					resumeStreaming(stream);


				}, function(){

					alert("Unable to get stream");

				})

			} else {

				resumeStreaming(stream.stream);

			}

		},
		onChannelListMessage : function(message){

			var self = agility_webrtc;

			self.channelMessages.push({
				from	: message.user.name,
				message : message.text.replace( /[<>]/g, '' )
			})
			
			self.render({
				container 	: "#channel_messages",
				template 	: "#channel_chat",
				data 		: {
					messages 	: self.messages,
					app 		: self
				}
			})	

		},
		onChannelListPresence : function(person){

			var item, newItem;

			$("#connected_people_list li[data-user=\"" + person.uuid + "\"]").remove();

			if (person.action === "join") {

				person.id  		= person.uuid;
				person.is_you  	= person.uuid === agility_webrtc.uuid;

				var content = _.template($("#user-item-template").html(), person );

				$("#connected_people_list").append(content);

			} else if (person.action === "leave" && person.uuid !== agility_webrtc.uuid) {
				
				var person_element = $("#connected_people_list li[data-user=\"" + person.uuid + "\"]");
				
				$(person_element).slideUp(200, function(){
					$(this).empty().remove();
				})
				
			}

		},
		onChannelListConnect 	: function(){

			sessionStorage.setItem('user', agility_webrtc.uuid);

			$("#login_container").slideUp(100);

		},
		connectToListChannel : function(){

			agility_webrtc.currentUser.subscribe({
				channel 	: agility_webrtc.channelName,
				callback 	: agility_webrtc.onChannelListMessage,
				presence 	: agility_webrtc.onChannelListPresence,
				connect 	: agility_webrtc.onChannelListConnect
			});

		},
		connectToCallChannel : function(){

			agility_webrtc.currentUser.subscribe({
				channel: 'call',
				callback: function(data) {
					if (data.callee ===  agility_webrtc.uuid) {
						agility_webrtc.incomingCallFrom = data.caller;
						agility_webrtc.onIncomingCall(data.caller);
					}					
				}
			});

		},
		connectToAnswerChannel : function(){

			agility_webrtc.currentUser.subscribe({
				channel: 'answer',
				callback: function(data) {

					if (data.caller === agility_webrtc.uuid) {
						
						agility_webrtc.publishStream({ uuid :  data.callee });

						var modalCalling = $("#calling-modal");

						modalCalling.modal('hide');

						$("#ringer")[0].pause();

						//The user answer the call

						agility_webrtc.onCallStarted();


					}

				}
			});

		},
		incrementTimer 		: function(){


			var minutes, seconds;
			agility_webrtc.currentCallTime += 1;
			var minutes = Math.floor(agility_webrtc.currentCallTime / 60);
			var seconds = agility_webrtc.currentCallTime % 60;
			if (minutes.toString().length === 1) {
				minutes = "0" + minutes;
			}
			if (seconds.toString().length === 1) {
				seconds = "0" + seconds;
			}
			agility_webrtc.setCurrentCallTime("" + minutes + ":" + seconds);

		},
		stopTimer 			: function(){

			clearInterval(agility_webrtc.timeInterval);

		},
		callPerson 			: function(who){

			agility_webrtc.currentCallUUID = who;

			var modalCalling = $("#calling-modal");

			modalCalling.find('.calling').text("Calling " + who + "...");

			modalCalling.modal('show');

			$("#ringer")[0].play()

			modalCalling.removeClass("hide");

			agility_webrtc.currentUser.publish({
				channel: 'call',
				message: {
					caller: agility_webrtc.uuid,
					callee: who
				}
			});

		},
		onIncomingCall 		: function(whoIsCalling){

			var modalAnswer = $("#answer-modal");

			modalAnswer.removeClass("hide");			

			modalAnswer.find('.caller').text("" + whoIsCalling + " is calling...");
			
			modalAnswer.modal('show');

			$("#ringer")[0].play()

		},
		onCallStarted 		: function(){

			agility_webrtc.showControls();
			agility_webrtc.setCurrentCallTime("00:00")
			agility_webrtc.currentCallTime = 0;
			agility_webrtc.timeInterval = setInterval(agility_webrtc.incrementTimer, 1000);

		},
		answerCall 		: function(from){

		 	//agility_webrtc.currentCallUUID = from;

		 	agility_webrtc.requestStream({
		 		video : true,
		 		audio : true
		 	}, function(stream){

		 		agility_webrtc.streams.push({ who : "mine", stream : stream });

			 	agility_webrtc.publishStream({ uuid : from  });

				var modalAnswer = $("#answer-modal");

				modalAnswer.modal("hide");	
				
				$("#ringer")[0].pause()

				agility_webrtc.currentUser.publish({
					channel: 'answer',
					message: {
						caller: agility_webrtc.incomingCallFrom,
						callee: agility_webrtc.uuid
					}
				});


		 	}, function(){
		 		alert("Unable to access stream");
		 	})
			
		},
		onEndCall 		: function(){

			agility_webrtc.hideControls();
			agility_webrtc.stopTimer();

		},
		render 				: function(options){

			var content = _.template($(options.template).html(), options.data );

			$(options.container).html(content);	

		},
		loadTemplates : function(options, callback){

			$("#templatesContainer").empty().remove();

			$('<div id="templatesContainer"></div>').appendTo('body');
			
			$('#templatesContainer').load(("javascripts/resources/templates.html?r=" + Date.now()), function(){

				if(typeof callback === "function"){
					callback();
				}

			})

		},
		hangupCall : function(){

			agility_webrtc.currentUser.peerConnection(agility_webrtc.incomingCallFrom, function(peerConnection) {
				
				peerConnection.close();
				
				agility_webrtc.onEndCall();

			});

		},
		setBinds : function(){

			$(document).on("click", "#hangup", function(e){

				e.preventDefault();

				agility_webrtc.hangupCall();


			})

			$(document).on("click", "[data-user]", function(e){

				e.preventDefault();
				e.stopPropagation();

				var name;

				var callingTo = $(this).data('user');

				agility_webrtc.requestStream({
					video : true,
					audio : true
				}, function(stream){

					agility_webrtc.streams.push({ who : "mine", stream : stream });

					agility_webrtc.callPerson(callingTo);

				}, function(){

					alert("To call someone please allow access to audio and video...");

				})

				


			})

			$(document).on("click", ".modal [data-dismiss]", function(e){
				e.preventDefault();
				$("#ringer")[0].pause()
				$(this).parents('.modal').hide();
			});

			$(document).on("click", "#answer", function(e){

				e.preventDefault();
				e.stopPropagation();

				agility_webrtc.answerCall(agility_webrtc.incomingCallFrom);

			})

			$(document).on("click", "#login", function(e){

				e.preventDefault();

				var name = $("#username").val().trim();

				if(name !== ""){

					agility_webrtc.login();

				}

			})



			return this;
		
		}

	}

	agility_webrtc.init();


})(window, document, $, _);
