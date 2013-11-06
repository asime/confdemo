(function(w,d,$, _){

	var agility_webrtc = {

		currentUser : null,

		streams 	: null,

		uuid 		: PUBNUB.uuid(),
		
		channelName : "agility_webrtc",

		credentials : {
			publish_key 	: 'pub-c-1e01c529-bfa1-46b5-a9bd-85e5a7ad800f',//'pub-c-8f61dc72-875d-4e34-9461-9c870d7c9f57',
			subscribe_key 	: 'sub-c-7376a62c-45c8-11e3-a44d-02ee2ddab7fe'//'sub-c-f5e33bbe-44f8-11e3-83cf-02ee2ddab7fe'
		},

		init : function(){

			var self = this;

			$("#chat_container").hide();

			self.loadTemplates({
				templates_url : "javascripts/resources/templates.html"
			}, function(){

				self.
				setGetUserMedia().
				setBinds().
				startStreaming({
					video : true,
					audio : false
				},function(stream){
					


					self.streams = self.streams || [];
					self.streams.push({ who : "mine", stream : stream });
					self.showStream({ who : "mine" , container : '#me'});

					self.credentials.uuid = self.uuid;
					
					self.currentUser = PUBNUB.init(self.credentials);

					self.currentUser.onNewConnection(function(uuid){

						var self = agility_webrtc;

						if( uuid !== self.uuid ){
				
							var stream = _.find(self.streams, function(stream){ return stream.who === "mine"; }).stream;

							if(stream){
								self.currentUser.publish({
									user: uuid,
									stream: stream
								});
							}

						}

					});

					self.connectToChannel();



				}, function(error){
					throw JSON.stringify(error);
				});


			})

		},

		showStream  	: function(options){

			var stream = _.find(this.streams, function(stream){
				return stream.who === options.who;
			}).stream;

			var video = $(options.container)[0];
				
			video.src = window.URL.createObjectURL(stream);

			$(video).fadeIn(300);

		},

		onPresence 		 : function(event){

			var self = agility_webrtc;
			
			var users = self.channelUsers || [];

			var user = _.find(users, function(user){
				return user.uuid === event.uuid;
			})

			if(user){
				user.status = event.action;
			} else {
				users.push({
					uuid 	: event.uuid,
					status 	: event.action 
				})
			}

			self.channelUsers = users;

			self.render({
				container 	: "#connected_people",
				template 	: "#channels_users_list",
				data 		: {
					users 		: users,
					app 		: self
				}
			})


			// self.currentUser.here_now({
			// 	channel:  self.channelName,
			// 	callback: function(channel){

			// 		self.render({
			// 			container 	: "#connected_people",
			// 			template 	: "#channels_users_list",
			// 			data 		: {
			// 				users 		: channel.uuids,
			// 				app 		: self
			// 			}
			// 		})

			// 		// var content 		= 	_.template($(options.template).html(), options.data );

			// 		// $(options.container).html(content);	

			// 		// $("#connected_people").empty();
			// 		// $("#connected_people").append('<ul>');
			// 		// _.each(channel.uuids,function(uuid){
			// 		// 	$("#connected_people").append("<li>"+( uuid === self.uuid ? "You" : uuid )+"</li>");		 
			// 		// })
			// 		// $("#connected_people").append('</ul>');

			// 	}
			// });
		
		},

		onChannelMessage : function(message, uuid){

			//arguments

			var self = agility_webrtc;

			self.messages = self.messages || [];

			self.messages.push({
				from	: message.user.name,
				message : message.text
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

		onChannelConnect : function(uuid, peerConnection){

			var self = agility_webrtc;

			console.log(uuid + ' connected to ' + self.channelName);

			$("#chat_container").show();

		},

		onChannelDisconnect : function(uuid, peerConnection){

			var self = agility_webrtc;

			console.log(uuid + ' disconnected to ' + self.channelName);

		},

		connectToChannel : function(options, callback, errorCallback){

			var self = this;

			self.currentUser.subscribe({
				channel 	: self.channelName,  
				callback 	: self.onChannelMessage,
				presence 	: self.onPresence, 
				connect 	: self.onChannelConnect
			});

		},
		onNewConnection : function(uuid){

			var self = this;

			if( uuid !== self.uuid ){
	
				var stream = _.find(self.streams, function(stream){ return stream.who === "mine"; }).stream;

				if(stream){
					self.currentUser.publish({
						user: uuid,
						stream: stream
					});
				}

			}			

			// self.currentUser.onNewConnection(function (uuid) {
			  
			// 	if( uuid !== self.uuid ){
				  
			// 		var stream = _.find(self.streams, function(stream){ return stream.who === "mine"; }).stream;

			// 		if(stream){
			// 			pubnub.publish({
			// 				user: uuid,
			// 				stream: stream
			// 			});
			// 		}

			// 	}

			// });	

		},

		setGetUserMedia : function(){
			navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia ||navigator.mozGetUserMedia ||navigator.msGetUserMedia);	
			return this;
		
		},

		startStreaming : function(options, callback, errorCallback){

			if(navigator.getUserMedia){

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

			} else {
				
				if(typeof errorCallback === 'function'){
					errorCallback({error:"getUserMedia not available in this browser"});
				}
				
			}


			return this;
		
		},

		subscribeToChannel : function(){


			return this;
		
		},

		loadTemplates 		: function(options, callback){


			$("#templatesContainer").empty().remove();

			$('<div id="templatesContainer"></div>').appendTo('body');
			
			$('#templatesContainer').load((options.templates_url + "?r=" + Date.now()), function(){

				if(typeof callback === 'function'){
					callback()
				}

			});				

		},
		
		onStreamReceived 	: function(data, event){

			console.log("Stream received");

			var self = agility_webrtc;

			self.streams.push({ who : "you", stream : event.stream });
			self.showStream({ who : "you" , container : '#you'});			

		},

		onStreamDisconnected : function(data, event){

			console.log("Stream disconnected");

		},

		onStreamError 		: function(error){

			console.log("Stream error :S");

		},

		setBinds			: function(){



			$(document).on("keyup", "#message", function(e){


				if((e.keyCode || e.charCode) === 13){
					
					$("#send").trigger("click");

				}
				
			});

			$(document).on("click", "#send", function(e){

				e.preventDefault();

				var message = $("#message").val().trim();

				if (message !== "") {
					agility_webrtc.currentUser.publish({
						channel : agility_webrtc.channelName,
						message : { user : {
							uuid : agility_webrtc.currentUser.UUID,
							name : agility_webrtc.currentUser.db.get('username') || "Guest"
						}, text : message }
					});
					$("#message").val("").focus();
				}

			})

			$(document).on("keyup", "#username-input", function(e){

				e.preventDefault();

				var username = $(this).val().trim();

				if(username !== ""){
					agility_webrtc.currentUser.db.set( 'username', username );
				}


			});

			$(document).on("click", ".list-group-item:not(.you)", function(e){

				e.preventDefault();

				$(".list-group-item").removeClass("active");
				$(this).addClass("active");

				var userToConnectTo = $(this).data("uuid");

				agility_webrtc.currentUser.subscribe({
					user 		: userToConnectTo,
					stream 		: agility_webrtc.onStreamReceived,
					disconnect  : agility_webrtc.onStreamDisconnected,
					error 		: agility_webrtc.onStreamError
				})


			})



			return this;

		},

		render 				: function(options){

			var content 		= 	_.template($(options.template).html(), options.data );

			$(options.container).html(content);	

		}

	}

	agility_webrtc.init();

})(window, document, $, _)

