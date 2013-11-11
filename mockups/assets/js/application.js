jQuery(document).ready(function () {
  
  //Reset Call
	$(".doneBtn").click(function () {
    $(".initialCall").fadeIn();
    $(".deleteBtn").fadeOut();
    $(".cameraBtn").fadeOut();
    $(".doneBtn").fadeOut();
    $(".commentItem").removeClass('active');
	});

  //Call Camera
	$(".cameraCall").click(function () {
	  $(this).parent().fadeOut();
    $(".deleteBtn").fadeOut();
    $(".cameraBtn").fadeIn();
    $(".doneBtn").fadeIn();
    $(".doneBtn").addClass('blue');
    $(".commentItem").addClass('active');
	});

  //Call Comment Delete
	$(".commentsCall").click(function () {
	  $(this).parent().fadeOut();
    $(".deleteBtn").fadeIn();
    $(".cameraBtn").fadeOut();
    $(".doneBtn").fadeIn();
    $(".doneBtn").removeClass('blue');
    $(".commentItem").addClass('active');
	});

  //Alert Test
  $( ".cameraBtn" ).click(function() {
    alert( "Calling User" );
  });

  $( ".deleteBtn" ).click(function() {
    alert( "Deleting Comment" );
  });
  
	var parHeight = $(window).height(); /*Get Screen Height*/
	$('.commentsWindowWrap .commentsList').css('height',parHeight-288); /*Update Card Holder Height*/
	$('.sliderWrap .slider').css('height',parHeight-355); /*Update Card Holder Height*/



});
	$(window).resize(function() {
		var wHeight = $(window).height();
  	$('.commentsWindowWrap .commentsList').css('height',wHeight-288); /*Update Card Holder Height*/
  	$('.sliderWrap .slider').css('height',wHeight-355); /*Update Card Holder Height*/
	});		
