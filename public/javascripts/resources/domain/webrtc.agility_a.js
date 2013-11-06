
// var demo_pubnub = false;

// if(demo_pubnub){
// 	pubnub_options = {
// 		publish_key 	: 'pub-c-e26bd37f-0e9b-49db-a2d0-3ce7dada8563',
// 		subscribe_key 	: 'sub-c-4860a7f8-ced1-11e2-b70f-02ee2ddab7fe'
// 	}
// } else {
// 	pubnub_options = {
// 		publish_key 	: 'pub-c-8f61dc72-875d-4e34-9461-9c870d7c9f57',
// 		subscribe_key 	: 'sub-c-f5e33bbe-44f8-11e3-83cf-02ee2ddab7fe'
// 	}
// }

// var localMediaStream;

// var me = PUBNUB.init(pubnub_options);//ONLY RECEIVES PUBLISH AND SUBSCRIBE KEYS

// $("#my_id").html(me.UUID);

// $(document).on("click", "#connect", function(e){

// 	e.preventDefault();

// 	your_id = $("#user_id").val().trim();

// 	start_streaming(function(){

// 		me.subscribe({
// 			user: your_id,
// 			callback: function (message) {
// 				$("#response").html(message + "<br />" + $("#response").html());
// 			},
// 			connect : function(uuid, peerConnection){
// 				console.log(uuid + " connected");
// 			},
// 			stream : function(stream){

// 				console.log("Stream received...");
				
// 				var video = $('#you')[0];
				
// 				video.src = window.URL.createObjectURL(stream);

// 				// Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
// 				// See crbug.com/110938.
// 				$('#you').fadeIn(300);


// 			}
// 		});	

// 	});



	

// 	$('#send, #message').removeAttr("disabled");

// 	//$(this).attr("disabled", "disabled");

// })


// $(document).on("click", "#send", function(e){

// 	e.preventDefault();

// 	var message = $("#message").val().trim();

// 	if (message !== '') {

// 		your_id = $("#user_id").val().trim();

// 		me.publish({
// 			user: your_id,
// 			message: message
// 		});

// 	}

// });		

// $(document).on("click", "#stream", function(e){

// 	e.preventDefault();

// 	if (window.localMediaStream) {

// 		your_id = $("#user_id").val().trim();

// 		me.publish({
// 			user: your_id,
// 			stream: window.localMediaStream
// 		});

// 	}

// });		

// function setGetUserMedia() {
//   	navigator.getUserMedia = (
//   		navigator.getUserMedia || 
//   		navigator.webkitGetUserMedia ||
//   		navigator.mozGetUserMedia ||
//   		navigator.msGetUserMedia
//   	);	
// }

// function start_streaming(callback){
	
// 	setGetUserMedia();

// 	if(navigator.getUserMedia){

// 		navigator.getUserMedia({video: true, audio: true}, function(localMediaStream) {
		
// 			window.localMediaStream = localMediaStream;

// 			var video = $('#me')[0];
			
// 			video.src = window.URL.createObjectURL(window.localMediaStream);

// 			// Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
// 			// See crbug.com/110938.
// 			$('#me').fadeIn(300);

// 			if(typeof callback === 'function'){
// 				callback();
// 			}

// 		}, function(e) {

// 			console.log('No access to getUserMedia!', e);

// 		});	

// 	} else {
// 		throw "getUserMedia not available in this browser";
// 	}


// }

  	$(function(){
  		navigator.getUserMedia = (navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia || 
                            navigator.msGetUserMedia);	
  	})
  	

	
	var connectButton = document.querySelector('#connect'),
        sendButton = document.querySelector('#send'),
		streamButton = document.querySelector('#stream'),
		connectTo = document.querySelector('#connectTo'),
        inputField = document.querySelector('#input'),
        responseBox = document.querySelector('#response');

    
    window.me = PUBNUB.uuid();//GET AN ID FROM PUBNUB
	$("#yourId").text(me);
	
	var keys = {
		publish_key: 'pub-c-1e01c529-bfa1-46b5-a9bd-85e5a7ad800f',
      	subscribe_key: 'sub-c-7376a62c-45c8-11e3-a44d-02ee2ddab7fe',
      	uuid: me
	}
	
    var pubnub = PUBNUB.init(keys);
	
	function present(){
		pubnub.here_now({
		 channel: 'rtc-test',
		 callback: function(m){
			 $("#connectedUsers").empty();
			 //console.log(JSON.stringify(m))
			 _.each(m.uuids,function(id){
				$("#connectedUsers").append("<li>"+( id === window.me ? "You" : id )+"</li>");		 
			 })
		  }
		});
	};
	
	pubnub.subscribe({
		channel:"rtc-test",  
        callback: function (message) {
          responseBox.innerHTML = message + "<br />" + responseBox.innerHTML;
        },
		presence:present,
		connect:function(){console.log('connected to rtc')}
	});
	
	
	function streamer(mediaStream){
		var vid = $('#camera-stream')[0];
		vid.src = window.URL.createObjectURL(mediaStream);	
	}
    // When we hit connect, start the connection
    connectButton.addEventListener('click', function (event) {
      
	  pubnub.subscribe({
		user: connectTo.value,  
        callback: function (message) {
          responseBox.innerHTML = message + "<br />" + responseBox.innerHTML;
        },
		stream:function(data,event){
			streamer(event.stream);
		},
		connect    : function() { 
			console.log("Connected to user")
	    },
		disconnect : function() { log("Disconnected") },
		reconnect  : function() { log("Reconnected") },
		error      : function() { log("Network Error") },
		});

    });

    sendButton.addEventListener('click', function (event) {
      if (inputField.value !== '') {
        pubnub.publish({
          channel: 'rtc-test',
          message: inputField.value
        });
      }
    });
	
	streamButton.addEventListener('click', function (event) {
      if (navigator.getUserMedia) {
  		navigator.getUserMedia(
			// Constraints
			{
			  video: true
			},
		
			// Success Callback
			function(localMediaStream) {
				//window.mystream = window.URL.createObjectURL(localMediaStream);
				window.myStream = localMediaStream;
				
				pubnub.onNewConnection(function (uuid) {
				  console.log(uuid);
				  if(uuid !== me){
					  console.log("there is a new conncection comming in, Im the channel now!");
					  if(window.myStream){
						  console.log("there was a stream, trying to publish it");
						  pubnub.publish({
							user: uuid,
							stream: window.myStream
						  });
					  }
				  }
				});
			},
		
			// Error Callback
			function(err) {
			  // Log the error to the console.
			  console.log('The following error occurred when trying to use getUserMedia: ' + err);
			}
		  );
		
		} else {
		  alert('Sorry, your browser does not support getUserMedia');
		}
    });














