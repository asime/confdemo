

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

var Person = new Schema({
	username 					: String,
	email		 				: String,
	subscribe					: Boolean
})

mongoose.model('Person', Person);

var Person = mongoose.model('Person');

PersonProvider = function(){};

//METHODS GO HERE

PersonProvider.prototype.save = function(params, callback){
	var person = new Person(params);
	person.save(function(err){
		if(err != null){
			console.log("Error found while trying to save a new person for agility_rtc_presentation | error: " + err.toString() + " | Data: " + JSON.stringify(params));
			callback(err, null);		
		} else {
			callback(null, person);
		}
	})
}

PersonProvider.prototype.findById = function(id, callback){

	Person.findById(id, function(err, person){
		if(err != null){
			callback(err, null);
		} else {
			callback(null, person);
		}
	})


}

PersonProvider.prototype.find = function(params, callback){

	Person.find(params, function(err, people){
		if(err != null){
			callback(err, null);
		} else {
			callback(null, people);
		}
	})

}

PersonProvider.prototype.count = function(params, callback){

	Person.count(params, function(err, count){
		if(err != null){
			callback(err, null);
		} else {
			callback(null, count);
		}
	})

}

PersonProvider.prototype.findOne = function(params, callback){

	Person.findOne(params, function(err, person){
		if(err != null){
			callback(err, null);
		} else {
			callback(null, person);
		}
	})

}




exports.PersonProvider = PersonProvider;
