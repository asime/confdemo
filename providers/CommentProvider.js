

var mongoose = require('mongoose');

//MONGOLAB

mongoose.connect('mongodb://usr_agility_rtc:87a97d34cca370779e49c2ff32a87fa51c58a118e2ba3a680a591dd61852dbfe@ds053818.mongolab.com:53818/agility_rtc_presentation', function(err) {
    if (err != null){
		console.log("Unable to connect: " + err);
	} else {
		console.log("Connected to database...");
	}
});

var Schema = mongoose.Schema , ObjectId = Schema.ObjectId;

var Comment = new Schema({
	from_username 				: String,
	from_email 					: String,
	content		 				: String,
	created_on					: Date
})

mongoose.model('Comment', Comment);

var Comment = mongoose.model('Comment');

CommentProvider = function(){};

//METHODS GO HERE

CommentProvider.prototype.save = function(params, callback){
	var comment = new Comment(params);
	comment.save(function(err){
		if(err != null){
			console.log("Error found while trying to save a new comment for agility_rtc_presentation | error: " + err.toString() + " | Data: " + JSON.stringify(params));
			callback(err, null);		
		} else {
			callback(null, comment);
		}
	})
}

CommentProvider.prototype.findLight = function(params, callback){

	var query 	= params.query;
	var fields 	= params.fields;
	var sort 	= params.sort;
	var limit 	= params.limit || 30;

	Comment.find(query,fields).limit(limit).sort(sort).exec(function(err, comments){
		if(err != null){
			console.log("Error found while trying to findLight comments for app name usabilime.me | error: " + err.toString() + " | Data: " + JSON.stringify(params));
			callback(err, null);		
		} else {
			callback(null, comments);
		}
	})	


}


CommentProvider.prototype.find = function(params, callback){

	Comment.find(params, function(err, comments){
		if(err != null){
			callback(err, null);
		} else {
			callback(null, comments);
		}
	})

}

exports.CommentProvider = CommentProvider;
