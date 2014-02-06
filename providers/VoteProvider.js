

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

var Vote = new Schema({
	from_email 					: String,
	from_username 				: String,
	value	 					: String,
	created_on	 				: String,
	slide_number 				: Number
})

mongoose.model('Vote', Vote);

var Vote = mongoose.model('Vote');

VoteProvider = function(){};

//METHODS GO HERE

VoteProvider.prototype.save = function(params, callback){
	var vote = new Vote(params);
	vote.save(function(err){
		if(err != null){
			console.log("Error found while trying to save a new vote for agility_rtc_presentation | error: " + err.toString() + " | Data: " + JSON.stringify(params));
			callback(err, null);		
		} else {
			callback(null, vote);
		}
	})
}

VoteProvider.prototype.findLight = function(params, callback){

	console.log("Params: " + JSON.stringify(params));

	var query 	= params.query;
	var fields 	= params.fields;
	var sort 	= params.sort;
	var limit 	= params.limit || 30;

	Vote.find(query,fields).limit(limit).sort(sort).exec(function(err, votes){
		if(err != null){
			console.log("Error found while trying to findLight votes for app name usabilime.me | error: " + err.toString() + " | Data: " + JSON.stringify(params));
			callback(err, null);		
		} else {
			callback(null, votes);
		}
	})	


}



VoteProvider.prototype.find = function(params, callback){

	Vote.find(params, function(err, votes){
		if(err != null){
			callback(err, null);
		} else {
			callback(null, votes);
		}
	})

}

exports.VoteProvider = VoteProvider;
