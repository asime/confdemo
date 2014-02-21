var routes = function (params) {

	var app = params.app;

	var people = [];

	var PersonProvider = require('../providers/PersonProvider').PersonProvider;
	var PersonProvider = new PersonProvider();	

	var CommentProvider = require('../providers/CommentProvider').CommentProvider;
	var CommentProvider = new CommentProvider();	

	var VoteProvider = require('../providers/VoteProvider').VoteProvider;
	var VoteProvider = new VoteProvider();		


	var checkSession = function(req, res, next){

		var userInSession = req.session.person;

		if(userInSession){
			next();
		} else {
			res.json({message:"Session expired"},401);
		}

	}

	app.get('/stream', function(req, res){

		res.render('stream.ejs');
		
	})


	app.get('/', function(req, res){

		var userInSession = req.session.person;

		res.render('index.ejs',{
			username : userInSession ? userInSession.username : null
		});
	})

	app.get('/login', function(req, res){

		req.session.destroy();

		res.render('login.ejs');
	})	

	app.get('/demo', function(req, res){

		res.render('simple_html.ejs');		
	})	

	app.get('/logout', function(req, res){

		req.session.destroy();

		res.json({message:"Bye..."});
	})

	app.post('/:who/disconnect', function(req,res){

		people = _.reject(people, function(person){ return person.username === req.params.who; });

		req.session.destroy();

		res.json({message : "User logged out"});
	});

	/********** API RELATED ***********/

	app.post('/api/vote/save', checkSession, function(req, res){

		var vote_data = req.body;

		vote_data.slide_number = Number(vote_data.slide_number);
		vote_data.created_on = new Date();


		VoteProvider.save(vote_data,function(err, vote){
			
			if(err!=null){
				res.json({ message: JSON.stringify(err) },500);
			} else {
				res.json(vote);
			}

		})

	})

	app.post('/api/comment/save', checkSession, function(req, res){

		var comment_data = req.body;

		comment_data.created_on = new Date();

		CommentProvider.save(comment_data,function(err, comment){
			
			if(err!=null){
				res.json({ message: JSON.stringify(err) },500);
			} else {
				res.json(comment);
			}

		})

	})	

	app.post('/api/login', function(req,res){

		var params = req.body;

		var query;

		if(params.email){
			query = {
				email : params.email
			}
		} else {
			query = {
				username : params.username,
				password : params.password
			}
		}


		//WILL REGISTER A PERSON, IF EMAIL AND USERNAME FOUND PERSON WILL BE SENT BACK AND PUT IN SESSION.
		PersonProvider.findOne(req.body, function(err, person){

			if(err!=null){

				res.json({message : JSON.stringify(err)},500);

			} else {

				if(person){
					req.session.person = person;
					res.json(person);
				} else {
					
					PersonProvider.save(req.body, function(err, person){
						if(err!=null){
							res.json({message : JSON.stringify(err)},500);
						} else {

							req.session.person = person;
							res.json(person);

						}
					})


				}

			}


		})
	})

	app.get('/api/me', function(req,res){

		var userInSession = req.session.person;

		if(userInSession){
			res.json(userInSession);
		} else {
			res.json({message:"Session expired"},401);
		}
	});	

	app.get('/api/votes', checkSession, function(req, res){



		var params = {
			query 	: {},
			fields 	: { 
				from_username : 1,
				created_on : 1 , 
				value : 1, 
				slide_number : 1,
				_id : 0
			},
			sort 	: { 'created_on' : -1 }
		}

		VoteProvider.findLight(params,function(err, votes){			

			if(err!=null){
				res.json({message : JSON.stringify(err)}, 500);
			} else {

				res.json(votes);

			}

		})		
	

	})

	app.get('/api/comments', checkSession, function(req, res){

		/*

		MODEL ATTRIBUTES:
	
		from_username 				: String,
		from_email 					: String,
		content		 				: String,
		created_on					: Date

		*/
	
		var params = {
			query 	: {},
			fields 	: { 
				from_username 	: 1,
				created_on 		: 1, 
				content 		: 1,
				_id 			: 0
			},
			sort 	: { 'created_on' : -1 }
		}

		CommentProvider.findLight(params,function(err, comments){			

			if(err!=null){

				res.json({message : JSON.stringify(err)}, 500);

			} else {

				res.json(comments);

			}

		})	


	})	

	app.get('/demo', function(req, res){

		res.render('demo.ejs',{
			id : "",
			name : ""
		});
	})	



}

module.exports = routes;

console.log("All routes registered");