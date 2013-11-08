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

  
});
