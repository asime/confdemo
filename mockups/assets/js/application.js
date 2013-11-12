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
	$('.sliderWrap .sliderEspectador').css('height',parHeight-320); /*Update Card Holder Height*/

  //Show Hide Comments Smaller Devices
	$(".commentsWindowWrap .btnShow").click(function () {
    $(".commentsWindowWrap").fadeOut("fast");
    $(".playerWindowWrap").fadeIn("fast");
	});
	$(".playerWindowWrap .btnShow").click(function () {
    $(".playerWindowWrap").fadeOut("fast");
    $(".commentsWindowWrap").fadeIn("fast");
	});

  //Show Hide Comment Box
	$(".showCommentBox").click(function () {
    $(this).fadeOut("fast");
    $(".commentSlideWrap").fadeIn("fast");
    $(".rateSlideWrap").fadeOut("fast");
	});
	$(".hideCommentBox").click(function () {
    $(this).fadeOut("fast");
    $(".showCommentBox").fadeIn("fast");
    $(".commentSlideWrap").fadeOut("fast");
    $(".rateSlideWrap").fadeIn("fast");
	});




});

//Height Resize Refresh
$(window).resize(function() {
	var wHeight = $(window).height();
	$('.commentsWindowWrap .commentsList').css('height',wHeight-288); /*Update Card Holder Height*/
	$('.sliderWrap .slider').css('height',wHeight-355); /*Update Card Holder Height*/
	$('.sliderWrap .sliderEspectador').css('height',wHeight-320); /*Update Card Holder Height*/
});		
