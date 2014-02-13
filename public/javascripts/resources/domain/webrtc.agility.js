//(function(w,d,$, _){

	var agility_webrtc = {

		uuid : null,

		currentUser : null,

		currentCallUUID : null,

		currentCallTime : 0,

		currentCallInterval : null,

		last_time_votes_updated : Date.now(),

		peer 			: null,

		slide_moods 	: [
			{ name : "Horrible" , count : 0, value : 0 },
			{ name : "Bad"		, count : 0, value : 1 }, 
			{ name : "Good"		, count : 0, value : 2 }, 
			{ name : "Great"	, count : 0, value : 3 },
			{ name : "Awesome"	, count : 0, value : 4 }
		],

		slide_pics 	: [
			{ pic_url : "images/presentation/1.jpg" },
			{ pic_url : "images/presentation/2.jpg" }, 
			{ pic_url : "images/presentation/3.jpg" }, 
			{ pic_url : "images/presentation/4.jpg" }, 
			{ pic_url : "images/presentation/5.jpg" },
			{ pic_url : "images/presentation/6.jpg" },
			{ pic_url : "images/presentation/7.jpg" },
			{ pic_url : "images/presentation/8.jpg" },
			{ pic_url : "images/presentation/9.jpg" },
			{ pic_url : "images/presentation/10.jpg" },
			{ pic_url : "images/presentation/11.jpg" },
			{ pic_url : "images/presentation/12.jpg" },
			{ pic_url : "images/presentation/17.jpg" },
			{ pic_url : "images/presentation/18.jpg" },
			{ pic_url : "images/presentation/19.jpg" },
			{ pic_url : "images/presentation/20.jpg" },
			{ pic_url : "images/presentation/21.jpg" },
			{ pic_url : "images/presentation/22.jpg" },
			{ pic_url : "images/presentation/23.jpg" },
			{ pic_url : "images/presentation/24.jpg" }
		],

		current_slide : 0,

		channelMessages : [],

		presentationVotes : [],

		channelName : "agility_webrtc",

		streams 	: [],

		credentials : {
			publish_key 	: 'pub-c-24de4b19-9284-43ee-b600-5e7b38d31f5b',
			subscribe_key 	: 'sub-c-9cc28534-8892-11e3-baad-02ee2ddab7fe'
		},

		checkSession : function(options, callback, errorCallback){

			agility_webrtc.callServer({
				data 	: options,
				url 	: '/api/me',
				type 	: 'GET'
			}, function(person){

				if(typeof callback === 'function'){
					callback(person);
				}

			}, function(xhr){

				console.log(xhr.status + " - getting session");

				if(typeof errorCallback === 'function'){
					errorCallback(xhr);
				}

			});			

		},

		callServer : function(params, callback, errorCallback){

			$.support.cors = true;

			agility_webrtc.connector = $.ajax({
				type 				: params.type,
				url 				: params.url,
				data 				: params.data,
				crossDomain			: true,
				cache 				: false,
				async 				: false,
				dataType	 		: 'json',
				callbackParameter 	: 'callback',
				success 			: function(data){
					
					if(typeof callback === 'function'){
						callback(data);
					}

				},
				error: function(xhr, type){

					console.log("ERROR (" + xhr.status + ") | " + xhr.statusText);

					
					if(typeof errorCallback === 'function'){
						errorCallback(xhr);
					}


				}			

			})			

		},

		initPeer : function(){

			var self = this;

			self.peer = new Peer({
				key: 'gcy3d40dr1p833di',
				debug : 3,
				config: {
					iceServers: [{ 
						url: 'stun:stun.l.google.com:19302'  // Pass in optional STUN and TURN server for maximum network compatibility
					}]
				}
			});

			self.peer.on('open', function(){
				console.log("PEER ID: " + self.peer.id);
			});	

			self.peer.on('call', function(call){
				// Answer the call automatically (instead of prompting user) for demo purposes
				call.answer(null);
				call.on("stream", function(stream){
					
					agility_webrtc.streams = _.reject(agility_webrtc.streams, function(stream){
						return stream.who === "presenter";
					})

					agility_webrtc.streams.push({ who : "presenter", stream : stream });

					agility_webrtc.showStream({ who : "presenter" , container : '#broadcasted_video'});

				});

			});		


		},

		init : function(){

			var self = agility_webrtc;
			
			self.loadTemplates({
				templates_url : "javascripts/resources/templates.html"
			}, function(){			

				self.setBinds();

				agility_webrtc.render({
					container 	: "#content",
					template 	: "#connecting_template",
					data 		: {
						message : "Please wait"
					}
				})	

				self.restoreDataFromStorage();

				self.checkUserMedia(function(){

					if(agility_webrtc.can_webrtc === true){

						agility_webrtc.initPeer();

					}

					agility_webrtc.checkSession({},function(person){

						agility_webrtc.getUser(person);	

					}, function(xhr){

						var template_to_render = window.location.pathname === "/login" ?  "#full_login_template" : "#login_template";

						agility_webrtc.render({
							container 	: "#content",
							template 	: template_to_render,
							data 		: null
						})	

					});

				});


			})


		},
		restoreDataFromStorage : function(){



		},
		applyStyles 	: function(){

  
			var parHeight = $(window).height(); /*Get Screen Height*/
			var parWidth = $(window).width(); /*Get Screen Width*/			

			if(parWidth > 769){
				$('.commentsWindowWrap .commentsList').css('height',parHeight-288); //Update Card Holder Height
				$('.sliderWrap .slider').css('height',parHeight-364); /*Update Card Holder Height*/
				$('.sliderWrap .sliderEspectador').css('height',parHeight-320); /*Update Card Holder Height*/
			};

			if(parWidth < 768){
				$('.commentsWindowWrap .commentsList').css('height','auto'); /*Update Card Holder Height*/
				$('.sliderWrap .slider').css('height','auto'); /*Update Card Holder Height*/
				$('.sliderWrap .sliderEspectador').css('height','auto'); /*Update Card Holder Height*/
			};

		},
		checkUserMedia : function(callback){
				
			agility_webrtc.can_webrtc = !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||navigator.mozGetUserMedia ||navigator.msGetUserMedia);	
			
			if(agility_webrtc.can_webrtc === true){

				$.getScript( "javascripts/resources/vendor/webrtc-beta-pubnub.js" )
					.done(function( script, textStatus ) {
						if(typeof callback === 'function'){
							callback();
						}
					})
					.fail(function( jqxhr, settings, exception ) {
						console.log("there was an error");
					}
				);

			} else {
				if(typeof callback === 'function'){
					callback();
				}
			}

			return this;
								
		},
		hideControls : function(){

			$('#video-controls').hide();

		},

		hideConference : function(){

			$('#conference-modal').modal('hide');

		},

		showControls : function(){

			$('#video-controls').show();

		},
		setCurrentCallTime : function(time){

			$('#video-controls #time').html(time);

		},

		showPresentationScreen : function(){


			agility_webrtc.render({
				container 	: "#content",
				template 	: "#presentation_template",
				data 		: {
					user 		: agility_webrtc.currentUser,
					slide_moods : agility_webrtc.slide_moods,
					slides  : agility_webrtc.slide_pics
				}
			})	

			//UI IS LOADED...

			if( agility_webrtc.currentUser.db.get("is_presenter") === "true" ){
				agility_webrtc.getVotes();
			}

			agility_webrtc.getComments();

			$(".glyphicon-hand-up").tooltip({
				title : "Raise your hand with a question",
				placement : "top",
				animation : false
			});//.tooltip('show');			

			


		},

		initPubnubUser : function(person){

			var UUID_from_storage = agility_webrtc.getFromStore("uuid");

			if(UUID_from_storage){
				agility_webrtc.uuid = UUID_from_storage.uuid;
			} else {
				agility_webrtc.uuid = PUBNUB.get_uuid();
				agility_webrtc.setInStore({ "uuid" : agility_webrtc.uuid }, "uuid");
			}

			agility_webrtc.credentials.uuid = agility_webrtc.uuid;

			console.log(JSON.stringify(agility_webrtc.credentials, null, 4));

			agility_webrtc.currentUser = PUBNUB.init(agility_webrtc.credentials);	

			agility_webrtc.currentUser.db.set('email', person.email);

			agility_webrtc.currentUser.db.set('_id', person._id);

			agility_webrtc.currentUser.db.set('username', person.username);

			var is_presenter = person.is_presenter;

			agility_webrtc.currentUser.db.set('is_presenter',is_presenter);

			if(agility_webrtc.currentUser.onNewConnection){
				agility_webrtc.currentUser.onNewConnection(function(uuid){ 
					console.log("onNewConnection triggered...");
					agility_webrtc.publishStream({ uuid : uuid }); 
				});
			}

			agility_webrtc.connectToListChannel();
			
			if(agility_webrtc.can_webrtc){
				
				agility_webrtc.connectToCallChannel();
				
				agility_webrtc.connectToAnswerChannel();
			}
				

		},

		getUser : function(options){

			console.log("GETTING PERSON...");

			var options = options;

			agility_webrtc.callServer({
				data 	: options,
				url 	: '/api/login',
				type 	: 'POST'
			}, function(person){


				agility_webrtc.initPubnubUser(person);

				// var is_presenter = person.is_presenter || options.is_presenter;

				// if(is_presenter){

				// 	agility_webrtc.requestStream({
				// 		video : true,
				// 	    audio : true
				// 	}, function(stream){

				// 		var my_stream = _.find(agility_webrtc.streams, function(stream){
				// 			return stream.who === "presenter";
				// 		})

				// 		if(my_stream){
				// 			my_stream.stream = stream;
				// 		} else {
				// 			agility_webrtc.streams.push({ who : "presenter", stream : stream });
				// 		}	

				// 		agility_webrtc.initPubnubUser(person);


				// 	})

				// } else {

				// 	agility_webrtc.initPubnubUser(person);

				// }


			}, function(xhr){

				$("#message").html(xhr.statusText);

			})

		},

		full_login : function(){

			var username = $("#username").val().trim();
			var password = $("#password").val().trim();


			if(username !== "" && password !== ""){

				agility_webrtc.callServer({
					data 	: {
						username : username,
						password : password
					},
					url 	: '/api/login',
					type 	: 'POST'
				}, function(person){

					window.location.href = "/";

				}, function(xhr){

					console.log(xhr.status + " - getting session");

					if(typeof errorCallback === 'function'){
						errorCallback(xhr);
					}

				});		

			}		


		},

		login : function(){

			var username 	= $("#username").val().trim();
			var email 		= $("#email").val().trim();
			var subscribe 	= $("#subscribe").is(":checked");

			if(username === "" || email === ""){

				$("#message").html("Username and Email are required");
				$(".alert").show().delay(3000).slideUp(300);

			} else {

				agility_webrtc.getUser({
					username 	: username,
					email 		: email,
					subscribe 	: subscribe
				});


			}




			return this;
		
		},

		showStream  	: function(options){

			var stream = _.find(this.streams, function(stream){
				return stream.who === options.who;
			}).stream;

			var video = $(options.container)[0];

			if(video){
				video.src = window.URL.createObjectURL(stream);
				$(video).fadeIn(300);
			}

		},	

		is_broadcasting	: function(){

			return (
				_.find(agility_webrtc.streams, function(stream){ return stream.who === "presenter"; }) != null 
				&& 
				agility_webrtc.currentUser.db.get("is_presenter") === "true"
			);

		},

		requestStream : function(options,callback, errorCallback){

			var is_presenter = agility_webrtc.currentUser ? agility_webrtc.currentUser.db.get('is_presenter') === "true" : false;

			var stream = _.find(agility_webrtc.streams, function(stream){ return stream.who === (is_presenter ? "presenter" : "mine"); });			

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

						if(e.name === "PermissionDeniedError" && window.location.protocol !== "https:"){
							alert("Must be behind a SSL...");
						}
						
						if(typeof errorCallback === 'function'){
							errorCallback(e);
						}

					});					

				}

			}

		},

		receiveStream : function(options){

			agility_webrtc.currentCallUUID = options.uuid;

			agility_webrtc.currentUser.subscribe({
				user: options.uuid,
				stream: function(bad, event) {
					
					var remote_stream = _.find(agility_webrtc.streams, function(stream){
						return stream.who === "you";
					})

					if(remote_stream){
						remote_stream.stream = event.stream;
					} else {
						agility_webrtc.streams.push({ who : "you", stream : event.stream });
					}

					agility_webrtc.showStream({ who : "you" , container : '#broadcasted_video'});
					
				},
				disconnect: function(uuid, pc) {

					// //The caller disconnected the call...
					// //Let's just hide the conference

					// agility_webrtc.currentCallUUID = uuid;

					// console.log("CLOSING CONNECTION WITH" + uuid);

					// $("#broadcasted_video").fadeOut(100);

					// agility_webrtc.onEndCall();

					// window.location.reload(true);
					
				}
			});	

		},

		publishStream : function(options){

			var stream = _.find(agility_webrtc.streams, function(stream){ return stream.who === "mine"; });

			var resumeStreaming = function(stream){

				agility_webrtc.incomingCallFrom = options.uuid;

				agility_webrtc.showStream({ who : "mine" , container : '#me'});

				agility_webrtc.currentUser.publish({ 
					user: options.uuid, 
					stream: stream
				});

				agility_webrtc.currentUser.subscribe({
					user: options.uuid,
					stream: function(bad, event) {
						
						var remote_stream = _.find(agility_webrtc.streams, function(stream){
							return stream.who === "you";
						})

						if(remote_stream){
							remote_stream.stream = event.stream;
						} else {
							agility_webrtc.streams.push({ who : "you", stream : event.stream });
						}

						agility_webrtc.showStream({ who : "you" , container : '#you'});
						
						$("#conference-modal").removeClass("hide").modal("show");

						agility_webrtc.onCallStarted();

					},
					disconnect: function(uuid, pc) {

						//The caller disconnected the call...
						//Let's just hide the conference

						agility_webrtc.onEndCall();
						
					}
				});				


			}

			

			if(stream == null){

				agility_webrtc.requestStream({
					video : true,
					audio : true
				}, function(stream){

					var my_stream = _.find(agility_webrtc.streams, function(stream){
						return stream.who === "mine";
					})

					if(my_stream){
						my_stream.stream = stream;
					} else {
						agility_webrtc.streams.push({ who : "mine", stream : stream });
					}					

					resumeStreaming(stream);


				}, function(){

					alert("Unable to get stream");

				})

			} else {

				resumeStreaming(stream.stream);

			}

		},

		storeMessageAndDisplayMessages : function(message){

			var self = agility_webrtc;
			self.channelMessages.push(message);
			self.render_prepend({
				container 	: ".commentsList",
				template 	: "#channel_chat",
				data 		: {
					messages 		: self.channelMessages,
					this_message	: message,
					app 			: self
				}
			})	
			if($(".doneBtn").is(":visible")){
				$(".deleteBtn").fadeIn();
			}
		},

		changeSlide 		: function(options){

			$(".slider").carousel(options.slide);

			active_index = $(".carousel-inner .active").index();
			
			switch(options.slide){
				case "prev":
					active_index--;
				break;
				case "next":
					if(($(".slideCount li").length - 1) == active_index)
					{
						active_index = 0
					}
					else
					{
				 		active_index++;
					}
				break;
				default:
					if(typeof options.slide === 'number')
					{
						active_index = options.slide;
					}	
				break;
			}	
	
			$(".slideCount li").removeClass("active");
			$(".slideCount li").eq(active_index).addClass("active");

			agility_webrtc.current_slide = active_index;
			
		
		},

		displayAnalyticsGraphic : function(data){

			if(agility_webrtc.presentationVotes.length > 30){
				agility_webrtc.presentationVotes = _.last(agility_webrtc.presentationVotes,2);
			}

			draw({
				data 		: agility_webrtc.presentationVotes,
				container 	: "#linesWarp",
				width 		: $("#linesWarp").width(),
				height 		: $("#linesWarp").height(),
				moods 		: agility_webrtc.slide_moods
			});

			$("text, .guideWarp").hide();

			if($(".data-point").length > 0){
				setTimeout(function(){

					$(".tipsy").hide();
					$(".data-point:last").trigger("mouseover")
					$(".area").addClass($(".data-point:last").attr("class").split(" ")[1]);
					
				}, 1000);
			}

			agility_webrtc.last_time_votes_updated = Date.now();

		},

		displayBarsGraphic 	: function(filtered_moods){

			$('.bargraph div.graphLabel[data-mood-name] div.bar').css({width:0});

			_.each(filtered_moods, function(mood){
				$('.bargraph div.graphLabel[data-mood-name="' + mood.name + '"] div.bar').animate({width: ((mood.percentage -1) + "%")}, 800, "swingFromTo")
				$('.bargraph div.graphLabel[data-mood-name="' + mood.name + '"] span.mood_count').html(mood.percentage + "%");
			})


		},

		filter_moods : function(){

			var filtered_moods = [];

			var mood_count, filtered_mood;

			_.each(agility_webrtc.slide_moods, function(mood){

				mood_count = _.countBy(agility_webrtc.presentationVotes, function(vote){ return vote.mood_name === mood.name; }).true || 0;

				filtered_mood = {
					name 		: mood.name,
					count 		: mood_count,
					percentage 	: (mood_count * 100 / agility_webrtc.presentationVotes.length).toFixed(2)
				}

				filtered_moods.push(filtered_mood);

			})

			return filtered_moods;

		},

		processVotes 	: function(vote){

			var mood = _.find(agility_webrtc.slide_moods, function(mood){ return mood.name === vote.mood_name; });

			vote.date = vote.created_on ? new Date(vote.created_on) : new Date();

			console.log(vote.date);

			vote.value = mood.value;

			agility_webrtc.presentationVotes.push(vote);

			filtered_moods = agility_webrtc.filter_moods();

			agility_webrtc.displayBarsGraphic(filtered_moods);

			if((Date.now() - agility_webrtc.last_time_votes_updated) > 500){

				agility_webrtc.displayAnalyticsGraphic();

			}


		},
		startTimer : function(){

			var self = agility_webrtc;
			self.start_time = new Date().getTime();
			agility_webrtc.timer = new _timer
			(
			    function(time)
			    {
			        if(time == 0)
			        {
			            timer.stop();
			            alert('time out');
			        }
			    }
			);
			
			agility_webrtc.timer.reset(0)
			agility_webrtc.timer.mode(1);
			agility_webrtc.timer.start();

		},
		onChannelListMessage : function(message){

			var self = agility_webrtc;

			switch(message.type){
				
				case "VOTE":
					agility_webrtc.processVotes(message);//{ type : "VOTE" : value : "AWESOME" }
				break;

				case "MESSAGE":
				case "HAND-UP":
					
					self.storeMessageAndDisplayMessages({
						from		: message.user.name,
						from_uuid 	: message.user.uuid,
						message 	: message.text.replace( /[<>]/g, '' ),
						id 			: message.id,
						can_webrtc 	: message.user.can_webrtc,
						type 		: message.type,
						is_your_message : (message.user.uuid === agility_webrtc.uuid) 	
					});

				break;
				
				case "DELETE_MESSAGE":

					$('.commentItem[data-message-id="' + message.id + '"]').animate({right:"-100%"}, 200, function(){
						$(this).empty().remove();
					})
				
				break;
				
				case "SLIDE":

					agility_webrtc.changeSlide(message.options);
				
				break;
				
				case "LOAD_DATA":

					console.debug(message);
					
					if(message.to === self.uuid && agility_webrtc.channelMessages.length === 0){
						
						agility_webrtc.changeSlide(message.current_slide);
						
						_.each(message.messages, function(message){
							self.storeMessageAndDisplayMessages(message);	
						});

						_.each(message.votes, function(vote){
							self.processVotes(vote);	
						});

					}
					
				break;
			}

		},

		onChannelListPresence : function(person){

			var item, newItem;

			$("#connected_people_list li[data-user=\"" + person.uuid + "\"]").remove();

			if (person.action === "join") {

				console.log("PERSON LOGGED IN..." + person.uuid);

				person.id  		= person.uuid;
				person.is_you  	= (person.uuid === agility_webrtc.uuid);

				/*
					1. Pubnub notified everyone that I'm present...
					2. Check if I'm the presenter
					3. If so, tell everyone to request the stream
					4. If I'm not the presenter then just
				*/

				if(agility_webrtc.currentUser.db.get("is_presenter") !== "true" && person.is_you === true){
					//It is me, and I'm not the presenter...
					agility_webrtc.currentUser.publish({
						channel: 'call',
						message: {
							caller 	: {
								peer_id 	: agility_webrtc.peer.id,
								username 	: agility_webrtc.currentUser.db.get("username")
							},
							action 	: "request_stream"
						}
					});						
				}

				if(agility_webrtc.currentUser.db.get("is_presenter") === "true" && person.is_you === true){


					agility_webrtc.currentUser.publish({
						channel: 'call',
						message: {
							caller 	: {
								uuid 		: agility_webrtc.uuid,
								username 	: agility_webrtc.currentUser.db.get("username")
							},
							action 	: "presenter_available"
						}
					});	



				}

				// if(
				// 	agility_webrtc.currentUser.db.get("is_presenter") === "true" 
				// 	&&  
				// 	person.is_you === false
				// 	&& 
				// 	(
				// 		agility_webrtc.channelMessages.length > 0
				// 	||
				// 		agility_webrtc.presentationVotes.length > 0
				// 	)
				// ){

				// 	//The logged in user is not you but is the presenter...

				// 	agility_webrtc.currentUser.publish({
				// 		channel: agility_webrtc.channelName,
				// 		message : {
				// 			type 	 : "LOAD_DATA",
				// 			messages : agility_webrtc.channelMessages,
				// 			votes    : agility_webrtc.presentationVotes,
				// 			current_slide : {slide: agility_webrtc.current_slide},
				// 			to : person.uuid
				// 		}
				// 	});


				// } else 

				// if(person.is_you === true && agility_webrtc.currentUser.db.get("is_presenter") !== "true" ){

				// 	//The user is NOT the presenter...

				// 	console.log( agility_webrtc.currentUser.db.get("username") + " - " + person.action);

				// 	agility_webrtc.currentUser.publish({
				// 		channel: 'call',
				// 		message: {
				// 			caller 	: {
				// 				uuid 		: agility_webrtc.uuid,
				// 				username 	: agility_webrtc.currentUser.db.get("username")
				// 			},
				// 			action 	: "broadcast_stream"
				// 		}
				// 	});	

				// } 

				// if(person.is_you === true && agility_webrtc.currentUser.db.get("is_presenter") === "true" ){

				// 	//You logged in and you are the presenter...
				// 	//Notify the users to discover themselves

				// 	agility_webrtc.currentUser.publish({
				// 		channel: 'call',
				// 		message: {
				// 			caller 	: {
				// 				uuid 		: agility_webrtc.uuid,
				// 				username 	: agility_webrtc.currentUser.db.get("username")
				// 			},
				// 			action 	: "broadcast_to_me"
				// 		}
				// 	});	


				// }

				var content = _.template($("#user-item-template").html(), person );

				$("#connected_people_list").append(content);

			} else if(person.action === "leave" || person.action === "timeout"){

				$('[data-call-button="' + person.uuid + '"]').remove();

			}

		},

		onChannelListConnect 	: function(){

			agility_webrtc.showPresentationScreen();
			agility_webrtc.displayAnalyticsGraphic();
			agility_webrtc.applyStyles();

		},

		onChannelListDisconnect : function(){
			
			//Call route /who/disconnect


		},
		onChannelListHereNow : function(presence){

			console.log(JSON.stringify(presence));


		},
		connectToListChannel : function(){

			agility_webrtc.render({
				container 	: "#content",
				template 	: "#connecting_template",
				data 		: {
					message : "Please wait"
				}
			})				

			console.log("User connecting to list channel...");

			agility_webrtc.currentUser.subscribe({
				channel 	: agility_webrtc.channelName,
				callback 	: agility_webrtc.onChannelListMessage,
				presence 	: agility_webrtc.onChannelListPresence,
				connect 	: agility_webrtc.onChannelListConnect,
				disconnect 	: agility_webrtc.onChannelListDisconnect
			});

			//Detect presence:

			agility_webrtc.currentUser.here_now({
				channel 	: agility_webrtc.channelName,
				callback 	: agility_webrtc.onChannelListHereNow
			})

		},

		connectToCallChannel : function(){

			agility_webrtc.currentUser.subscribe({
				channel: 'call',
				callback: function(call) {

					switch(call.action){

						case "request_stream":

							if( call.caller.peer_id !== agility_webrtc.peer.id){

								var my_stream = _.find(agility_webrtc.streams, function(stream){
									return stream.who === "presenter";
								})

								if(my_stream){
									//var call = peer.call($('#callto-id').val(), window.localStream);
									call = agility_webrtc.peer.call(call.caller.peer_id, my_stream.stream);
									call.on("stream", function(stream){

										console.log("STREAM RECEIVED")

									})
								}								

							}

						break;

						case "presenter_available":

								if( call.caller.uuid !== agility_webrtc.uuid){

									agility_webrtc.currentUser.publish({
										channel: 'call',
										message: {
											caller 	: {
												peer_id 	: agility_webrtc.peer.id,
												username 	: agility_webrtc.currentUser.db.get("username")
											},
											action 	: "request_stream"
										}
									});	

								}

						break;


						// case "broadcast_stream":



						// 	if(agility_webrtc.currentUser.db.get('is_presenter') === "true"){

						// 		//A person who just joined is requesting the presenter stream...

						// 		agility_webrtc.currentUser.publish({
						// 			channel: 'call',
						// 			message: {
						// 				caller 	: {
						// 					uuid 		: agility_webrtc.uuid,
						// 					username 	: agility_webrtc.currentUser.db.get("username")
						// 				},
						// 				action 	: "request_stream"
						// 			}
						// 		});	

						// 		console.log(call.caller.username + " (" + call.caller.uuid + ") is requesting stream...");

						// 		var my_stream = _.find(agility_webrtc.streams, function(stream){
						// 			return stream.who === "mine";
						// 		})

						// 		if(my_stream){
									
						// 			agility_webrtc.currentCallUUID = call.caller.uuid;

						// 			agility_webrtc.currentUser.publish({ 
						// 				user 	: call.caller.uuid, 
						// 				stream 	: my_stream.stream
						// 			});

						// 		}

						// 	}

						// break;

						// case "broadcast_to_me":

						// 	if(agility_webrtc.currentUser.db.get('is_presenter') === "true"){

						// 		console.log("MESSAGE RECEIVED TO SEND STREAM TO " + call.caller.username);

						// 		// agility_webrtc.receiveStream({
						// 		// 	uuid : call.caller.uuid
						// 		// });

						// 	}

						// break;

						case "calling":
						case "screen_sharing":

							if(call.caller.uuid !== agility_webrtc.uuid && call.callee.uuid === agility_webrtc.uuid){
								agility_webrtc.incomingCallFrom = call.caller.uuid;
								agility_webrtc.onIncomingCall({
									caller 		: call.caller.username,
									call_type 	: call.action
								});
							}

						break;

						default :

							if(call.caller.uuid === agility_webrtc.currentCallUUID){
								
								//THE PERSON I'M CALLING IS HANGING UP THE CALL
								
								$("#ringer")[0].pause();

								$('#calling-modal .calling').html("Sorry the call has been canceled");

								agility_webrtc.currentCallUUID = null;

								_.delay(function(){
									$("#calling-modal").fadeOut(200, function(){
										$("#calling-modal").modal("hide");
									}) 
								}, 1500);

							} else if( call.caller.uuid !== agility_webrtc.uuid && call.callee.uuid === agility_webrtc.uuid){
								agility_webrtc.cancelIncomingCall(call.caller.username);
							}

						break;

					}

					
				}
			});

		},

		connectToAnswerChannel : function(){

			agility_webrtc.currentUser.subscribe({
				channel: 'answer',
				callback: function(data) {

					if (data.caller.uuid === agility_webrtc.uuid) {
						
						agility_webrtc.publishStream({ uuid :  data.callee.uuid });

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


		callPerson 			: function(options){

			agility_webrtc.currentCallUUID = options.uuid;

			var modalCalling = $("#calling-modal");

			var message = options.sharing_screen ? ("Sharing screen with " + options.username + "...") : "Calling " + options.username + "...";

			modalCalling.find('.calling').text(message);

			modalCalling.find(".btn-danger").data("calling-user", options.uuid);

			modalCalling.find(".btn-danger").data("calling-user", options.uuid);

			$(modalCalling).data("screen_sharing",options.sharing_screen);

			modalCalling.modal('show');

			$("#ringer")[0].play();

			modalCalling.removeClass("hide");

			agility_webrtc.currentUser.publish({
				channel: 'call',
				message: {
					caller 	: {
						uuid 		: agility_webrtc.uuid,
						username 	: agility_webrtc.currentUser.db.get("username")
					},
					callee 	: { 
						uuid 		: options.uuid,
						username 	: options.username
					},
					action 	: (options.sharing_screen ? "screen_sharing" : "calling")
				}
			});

		},
		ignoreCall 			: function(from){

			agility_webrtc.currentUser.publish({
				channel: 'call',
				message: {
					caller 	: {
						uuid 		: agility_webrtc.uuid,
						username 	: agility_webrtc.currentUser.db.get("username")
					},
					callee 	: from,
					action 	: "hangup"
				}
			});	

			agility_webrtc.cancelIncomingCall(agility_webrtc.incomingCallFrom);//REUSE THE CANCEL INCOMING CALL METHOD

		},
		cancelIncomingCall 	: function(whoIsCalling){

			agility_webrtc.incomingCallFrom = null;

			$("#ringer")[0].pause()

			$("#answer-modal .modal-footer").slideUp(200, function(){
				$('#answer-modal .caller').html("Sorry " + whoIsCalling + " hangup the call");
				
				_.delay(function(){
					$("#answer-modal").fadeOut(200).modal("hide");
				}, 1500);
				
			});
			

		},
		onIncomingCall 		: function(options){

			var modalAnswer = $("#answer-modal");

			modalAnswer.removeClass("hide");		

			var message = options.call_type === "screen_sharing" ? options.caller + " wants to share his/her screen with you" : options.caller + " is calling...";

			modalAnswer
				.removeClass("hide").find('.caller')
				.text(message)
				.end().find('.modal-footer').show().end().modal('show');
			

			$("#ringer")[0].play();

		},

		onCallStarted 		: function(){

			agility_webrtc.showControls();
			agility_webrtc.setCurrentCallTime("00:00")
			agility_webrtc.currentCallTime = 0;
			clearInterval(agility_webrtc.timeInterval);
			agility_webrtc.timeInterval = setInterval(agility_webrtc.incrementTimer, 1000);

		},

		answerCall 		: function(from){

		 	agility_webrtc.requestStream({
		 		video : true,
		 		audio : true
		 	}, function(stream){

		 		agility_webrtc.currentCallUUID = agility_webrtc.incomingCallFrom;

				var my_stream = _.find(agility_webrtc.streams, function(stream){
					return stream.who === "mine";
				})

				if(my_stream){
					my_stream.stream = stream;
				} else {
					agility_webrtc.streams.push({ who : "mine", stream : stream });
				}			 		

			 	agility_webrtc.publishStream({ uuid : from  });

				var modalAnswer = $("#answer-modal");

				modalAnswer.modal("hide");	
				
				$("#ringer")[0].pause()

				agility_webrtc.currentUser.publish({
					channel: 'answer',
					message: {
						caller: {
							uuid 		: agility_webrtc.incomingCallFrom
						},
						callee: {
							uuid 		: agility_webrtc.uuid,
							username 	: agility_webrtc.currentUser.db.get("username")
						}
					}
				});


		 	}, function(){

		 		alert("Unable to access stream");

		 	})
			
		},

		onEndCall 		: function(){

			agility_webrtc.hideConference();
			agility_webrtc.hideControls();
			agility_webrtc.stopTimer();
			agility_webrtc.stopStream();


		},

		stopStream 		: function(){

			/*
				
				Should not stop the stream if is the presenter...

			*/

			if(agility_webrtc.currentUser.db.get('is_presenter') !== "true"){

				var my_stream = _.find(agility_webrtc.streams, function(stream){
					return stream.who === "mine";
				})

				if(my_stream){
					my_stream.stream.stop();
					agility_webrtc.streams = _.reject(agility_webrtc.streams, function(stream){
						return stream.who === "mine";
					})
				}	

			}

		},

		render 				: function(options){

			var content = _.template($(options.template).html(), options.data );

			$(options.container).html(content);	

		},
		saveVote 			: function(vote, callback){

			agility_webrtc.callServer({
				data 	: vote,
				url 	: '/api/vote/save',
				type 	: 'POST'
			}, function(vote){

				if(typeof callback === 'function'){
					callback(vote);
				}

			}, function(xhr){

				console.log(xhr.status + " - saving vote");

				if(typeof errorCallback === 'function'){
					errorCallback(xhr);
				}

			});				

		},
		getVotes			: function(params, callback){

			var self = this;

			agility_webrtc.callServer({
				data 	: params || {},
				url 	: '/api/votes',
				type 	: 'GET'
			}, function(votes){

				if(typeof callback === 'function'){
					callback(votes);
				} else {

					//No callback passed let's display the votes...

					agility_webrtc.presentationVotes = [];

					var mood;

					_.each(votes, function(vote){

						mood = _.find(agility_webrtc.slide_moods, function(mood){ return mood.name === vote.value; });

						agility_webrtc.presentationVotes.push({
							date 		: new Date(vote.created_on),
							mood_name 	: vote.value,
							value 		: mood.value,
							type 		: "VOTE"
						})
						

					});		

					agility_webrtc.displayAnalyticsGraphic();

				}

			}, function(xhr){

				console.log(xhr.status + " - getting votes");

				if(typeof errorCallback === 'function'){
					errorCallback(xhr);
				}

			});				

		},
		getComments			: function(params, callback){

			var self = this;

			agility_webrtc.callServer({
				data 	: params,
				url 	: '/api/comments',
				type 	: 'GET'
			}, function(comments){

				if(typeof callback === 'function'){
					callback(comments);
				} else {

					comments.reverse();

					_.each(comments, function(comment){

						self.storeMessageAndDisplayMessages({
							from		: comment.from_username,
							from_uuid 	: Date.now(),
							message 	: comment.content.replace( /[<>]/g, '' ),
							id 			: Date.now() + "-" + comment.from_username.toLowerCase().replace(/ /g, ''),
							can_webrtc 	: true
						});

					})

				}

			}, function(xhr){

				console.log(xhr.status + " - getting comments");

				if(typeof errorCallback === 'function'){
					errorCallback(xhr);
				}

			});				

		},	

		saveComment 			: function(comment, callback){

			agility_webrtc.callServer({
				data 	: comment,
				url 	: '/api/comment/save',
				type 	: 'POST'
			}, function(comment){

				if(typeof callback === 'function'){
					
					callback(comment);

				}

			}, function(xhr){

				console.log(xhr.status + " - saving comment");

				if(typeof errorCallback === 'function'){
				
					errorCallback(xhr);

				}

			});				

		},

		render_prepend		: function(options){

			var content = _.template($(options.template).html(), options.data );

			$(options.container).prepend(content);	

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

			agility_webrtc.currentUser.closeConnection(agility_webrtc.currentCallUUID, function(){

				//Connection with the other person was closed...
				agility_webrtc.onEndCall();

			})


		},
		setInStore 	: function(item, key){

			if(item == null){
				return false;
			}

			item = _.isString(item) ? item : JSON.stringify(item);
			
			window.localStorage.setItem(key, item);

		},
		getFromStore : function(key){
			
			return JSON.parse(window.localStorage.getItem(key));

		},
		setBinds : function(){

			// window.onbeforeunload = function(){

			// 	if(agility_webrtc.currentUser && agility_webrtc.currentUser.db.get('is_presenter').toString() === "true"){
					
			// 		//Store messages and votes in localStorage.
			// 		agility_webrtc.setInStore(agility_webrtc.channelMessages, "messages");
			// 		agility_webrtc.setInStore(agility_webrtc.presentationVotes, "votes");


			// 	}

			// 	agility_webrtc.onChannelListDisconnect();

			// 	agility_webrtc.hangupCall();

			// 	return "Are you sure you want to exit the presentation?";

			// }

			$(document).on("click", ".broadcast_screen", function(){


				var is_presenter = agility_webrtc.currentUser.db.get("is_presenter") === "true";

				if(is_presenter){

					agility_webrtc.streams = _.reject(agility_webrtc.streams, function(stream){
						return stream.who === "presenter";
					})					

					agility_webrtc.requestStream({
						video : {
							mandatory: {
								chromeMediaSource: 'screen'
								// maxWidth: 640,
								// maxHeight: 480
							}
						},
						audio : true
					}, function(stream){

						agility_webrtc.streams = _.reject(agility_webrtc.streams, function(stream){
							return stream.who === "presenter";
						})

						agility_webrtc.streams.push({ who : "presenter", stream : stream });

						agility_webrtc.showStream({ who : "presenter" , container : '#broadcasted_video'});
						//If I'm the presenter, mute the video to prevent echos
						$("#broadcasted_video").prop('muted', true);


					})

				}	


			})

			$(document).on("click", ".broadcast_stream", function(){

				var is_presenter = agility_webrtc.currentUser.db.get("is_presenter") === "true";

				if(is_presenter){

					agility_webrtc.streams = _.reject(agility_webrtc.streams, function(stream){
						return stream.who === "presenter";
					})	

					agility_webrtc.requestStream({
						video : true,
					    audio : true
					}, function(stream){

						var my_stream = _.find(agility_webrtc.streams, function(stream){
							return stream.who === "presenter";
						})

						if(my_stream){
							my_stream.stream = stream;
						} else {
							agility_webrtc.streams.push({ who : "presenter", stream : stream });
						}	

						if(agility_webrtc.currentUser.db.get('is_presenter') === "true"){
							agility_webrtc.showStream({ who : "presenter" , container : '#broadcasted_video'});
							//If I'm the presenter, mute the video to prevent echos
							$("#broadcasted_video").prop('muted', true);

						}
						


					})

				}				


			})

			$(document).on("click", "#your_audio_mute", function(){
				$("#you").prop('muted', true); 
				$(this).hide();
				$("#your_audio_unmute").show();
			})


			$(document).on("click", "#your_audio_unmute", function(){
				$("#you").prop('muted', false); 
				$(this).hide();
				$("#your_audio_mute").show();
			})


			$(document).on("click", "#my_audio_mute", function(){
				$("#me").prop('muted', true); 
				$(this).hide();
				$("#my_audio_unmute").show();
			})


			$(document).on("click", "#my_audio_unmute", function(){
				$("#me").prop('muted', false); 
				$(this).hide();
				$("#my_audio_mute").show();
			})		
				


			$(document).on("click", "#ignoreCall", function(e){

				e.preventDefault();
				
				e.stopPropagation();

				$("#answer-modal").modal("hide");//CLOSE ANSWER MODAL...

				$("#ringer")[0].pause();

				agility_webrtc.currentUser.publish({
					channel: 'call',
					message: {
						caller 	: {
							uuid 		: agility_webrtc.uuid,
							username 	: agility_webrtc.currentUser.db.get("username")
						},
						callee 	: {
							uuid 	: agility_webrtc.incomingCallFrom
						},
						action 	: "hangup"
					}
				});					




			})

			$(document).on("click", "#calling-modal .btn-danger", function(e){

				e.preventDefault();

				var was_calling_who = $("#calling-modal .btn-danger").data("calling-user");

				agility_webrtc.currentUser.publish({
					channel: 'call',
					message: {
						caller 	: {
							uuid  		: agility_webrtc.uuid,
							username 	: agility_webrtc.currentUser.db.get("username")
						},
						callee 	: {
							uuid 	: 	was_calling_who
						},
						action 	: "hangup"
					}
				});				


			})




			$(window).resize( _.debounce(function(){

				console.log("Debouced resize");
				var wHeight = $(window).height();
				var wWidth = $(window).width();

				if(wWidth > 769){
			    	$('.commentsWindowWrap .commentsList').css('height',wHeight-288); /*Update Card Holder Height*/
			    	$('.sliderWrap .slider').css('height',wHeight-364); /*Update Card Holder Height*/
			    	$('.sliderWrap .sliderEspectador').css('height',wHeight-320); /*Update Card Holder Height*/
				};
				if(wWidth < 769){
			    	$('.commentsWindowWrap .commentsList').css('height','auto'); /*Update Card Holder Height*/
			    	$('.sliderWrap .slider').css('height','auto'); /*Update Card Holder Height*/
			    	$('.sliderWrap .sliderEspectador').css('height','auto'); /*Update Card Holder Height*/
				};
        $("body").removeClass("addFullScreen");
			}, 500));			



			$(document).on("click", "#presenter_login", function(e){

				e.preventDefault();
				e.stopPropagation();

				agility_webrtc.full_login();

			})

			$(document).on("click", "#login", function(e){
				agility_webrtc.login();	
			})
			$(document).on("click", ".hideCommentBox", function(e){
				$(this).fadeOut("fast");
				$(".showCommentBox").fadeIn("fast");
				$(".commentSlideWrap").fadeOut("fast");
				$(".rateSlideWrap").fadeIn("fast");
			})

			$(document).on("click", ".goFullScreen", function(e){
				e.preventDefault();
				e.stopPropagation();
    			$("body").toggleClass("addFullScreen");
    			$(".goFullScreen").toggleClass("glyphicon-resize-small");
    			$('.sliderWrap .slider').css('height','100%');
			})

			$(document).on("click", ".showCommentBox", function(e){
				$(this).fadeOut("fast");
				$(".commentSlideWrap").fadeIn("fast");
				$(".rateSlideWrap").fadeOut("fast");
			})

			$(document).on("click", ".playerWindowWrap .btnShow", function(e){
				$(".playerWindowWrap").fadeOut("fast");
				$(".commentsWindowWrap").fadeIn("fast");
			})

			$(document).on("click", ".commentsWindowWrap .btnShow", function(e){

				$(".commentsWindowWrap").fadeOut("fast");
		    	$(".playerWindowWrap").fadeIn("fast");

			})

			$(document).on("click", ".cameraCall", function(e){

				e.preventDefault();

				$(".cameraCall").parents(".initialCall").fadeOut();
				$(".deleteBtn").fadeOut();
				$(".cameraBtn,.screenShareBtn").fadeIn();
				$(".screenShareBtn").fadeIn();
				$(".doneBtn").addClass('blue').fadeIn();
				$(".commentItem").addClass('active');
	
			})

			$(document).on("click", ".commentsCall", function(e){

	  			$(".commentsCall").parents(".initialCall").fadeOut();
    			$(".deleteBtn").fadeIn();
				$(".cameraBtn,.screenShareBtn").fadeOut();
				$(".doneBtn").removeClass('blue').fadeIn();
				$(".commentItem").addClass('active');
	
			})

			$(document).on("click", ".doneBtn", function(e){

				e.preventDefault();

				$(".initialCall").fadeIn();
				$(".deleteBtn, .cameraBtn, .doneBtn, .screenShareBtn").fadeOut();
				$(".commentItem").removeClass('active');

			})

			$(document).on("click", "#hangup", function(e){

				e.preventDefault();

				agility_webrtc.hangupCall();

			})

			$(document).on("click", "[data-user-share-screen]", function(e){


				e.preventDefault();

				e.stopPropagation();

				$(".doneBtn").trigger("click");

				$(this).parents(".commentItem").find(".glyphicon-hand-up").removeClass("bouncing").hide();

				if(agility_webrtc.currentUser.db.get('is_presenter') === "true"){

					agility_webrtc.callPerson({
						uuid 		: $(this).data('user-share-screen'),
						username 	: $(this).data('user-username'),
						sharing_screen : true
					});

				}


			})

			$(document).on("click", "[data-user]", function(e){

				e.preventDefault();

				e.stopPropagation();

				$(".doneBtn").trigger("click");

				$(this).parents(".commentItem").find(".glyphicon-hand-up").removeClass("bouncing").hide();

				var name;

				var callingTo = {
					uuid 		: $(this).data('user'),
					username 	: $(this).data('user-username')
				}


				if(agility_webrtc.currentUser.db.get('is_presenter') === "true"){

					agility_webrtc.callPerson(callingTo);

				} else {

					agility_webrtc.requestStream({
						video : true,
						audio : true
					}, function(stream){

						var my_stream = _.find(agility_webrtc.streams, function(stream){
							return stream.who === "mine";
						})

						if(my_stream){
							//Stream exists in the streams array, let's update the reference...
							my_stream.stream = stream;
						} else {
							agility_webrtc.streams.push({ who : "mine", stream : stream });
						}

						agility_webrtc.callPerson(callingTo);

					}, function(){

						alert("To call someone please allow access to audio and video...");

					})

				}



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

			$(document).on("click", ".rateOption", function(e){

				var slide_mood = $(this).data("slide-mood");

				if($(this).is(".disabled")){
					return false;
				}

				$(".rateOption").addClass("disabled");

				var mood = _.find(agility_webrtc.slide_moods, function(mood){
					return mood.name === slide_mood;
				})

				$(this).animate({ opacity : 0.5 }, 400, function(){
					$(this).animate({ opacity : 1 }, 400);
					$(".rateOption").removeClass("disabled");
				})

				$(".title").animate({left : "-100%"}, 800);
				$(".thanks_for_rating").animate({left : "0"}, 800);
				
				_.delay(function(){

					$(".title").animate({left : "0"}, 800);
					$(".thanks_for_rating").animate({left : "-100%"}, 800);


				}, 2000);



				agility_webrtc.currentUser.publish({
					channel: agility_webrtc.channelName,
					message : {
						type 		: "VOTE",
						mood_name 	: slide_mood
					}
				});

				//ONCE PUBLISHED LET'S SAVE THE VOTE IN THE DB:

				agility_webrtc.saveVote({
					from_username 	: agility_webrtc.currentUser.db.get("username"),
					from_email 		: agility_webrtc.currentUser.db.get("email"),
					value 			: slide_mood,
					slide_number	: Number($(".slideCount li.active").html())
				});

			})

			$(document).on("click", ".deleteBtn", function(e){

				e.preventDefault();

				var message_id = $(this).data("message-id");

				$(this).parents('.commentItem').animate({right:"-100%"}, 200, function(){
					
					$(this).empty().remove();

					if($('.commentItem').length === 0 && $(".doneBtn").is(":visible")){
						$(".doneBtn").trigger("click");	
					}

					agility_webrtc.currentUser.publish({
						channel: agility_webrtc.channelName,
							message : {
							type 	: "DELETE_MESSAGE",
							id 		: message_id
						}
					});			

				});

			})

			$(document).on("keyup",".commentsHere",function(event){
				if(event.keyCode == 13){
					$("#btn_send_message").click();
				}
			});

			$(document).on("click",".glyphicon-hand-up",function(){

				var username = agility_webrtc.currentUser.db.get("username");

				agility_webrtc.currentUser.publish({
					channel: agility_webrtc.channelName,
					message : {
						type 	: "HAND-UP",
						text 	: "I HAVE A QUESTION",
						user 	: {
							name 		: username,
							uuid 		: agility_webrtc.uuid,
							can_webrtc 	: agility_webrtc.can_webrtc
						},
						id 		: Date.now() + "-" + username.toLowerCase().replace(/ /g, '')
					}
				});				
			})

			$(document).on("click", "#btn_send_message", function(e){

				var message = $(".commentsHere").val().trim();

				if(message !== ""){

					var username = agility_webrtc.currentUser.db.get("username");

					agility_webrtc.currentUser.publish({
						channel: agility_webrtc.channelName,
						message : {
							type 	: "MESSAGE",
							text 	: message,
							user 	: {
								name 		: username,
								uuid 		: agility_webrtc.uuid,
								can_webrtc 	: agility_webrtc.can_webrtc
							},
							id 		: Date.now() + "-" + username.toLowerCase().replace(/ /g, '')
						}
					});

					//ONCE SENT VIA PUBNUB LET'S SAVE THE COMMENT...

					agility_webrtc.saveComment({
						from_username 	: agility_webrtc.currentUser.db.get('username'),
						from_email 		: agility_webrtc.currentUser.db.get('email'),
						content 		: message
					});


					$(".commentsHere").val("");


				} else {
					$(".commentsHere").val("");
				}

			});

			$(document).on("click", ".control", function(e){
			
				e.preventDefault();
				e.stopPropagation();
				agility_webrtc.changeSlide({slide: $(e.target).parent().data("slide")});
				if(!agility_webrtc.start_time && $(e.target).parent().data("slide") == "next"){
					agility_webrtc.startTimer();
				}
				agility_webrtc.currentUser.publish({
					channel: agility_webrtc.channelName,
						message: {
						type: "SLIDE",
						options: {slide: $(e.target).parent().data("slide")}
					}
			    });
				
			});
			
			$(document).on("click",".slideCount li", function(e){
				
				e.preventDefault();
				e.stopPropagation();

				//if($(this).data("is-presenter")){
					agility_webrtc.changeSlide({slide: $(e.target).data("slide-to")});
					agility_webrtc.currentUser.publish({
						channel: agility_webrtc.channelName,
							message: {
							type: "SLIDE",
							options: {slide: $(e.target).data("slide-to")}
						}
					});
				//}


			});
			
			return this;
		
		}

	}
    
	agility_webrtc.init();


//})(window, document, $, _ );
