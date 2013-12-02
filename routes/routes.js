var routes = function (params) {

	var app = params.app;

	var people = [];

	var PersonProvider = require('../providers/PersonProvider').PersonProvider;
	var PersonProvider = new PersonProvider();	

	app.get('/', function(req, res){

		var userInSession = req.session.person;

		res.render('index.ejs',{
			username : userInSession ? userInSession.username : null
		});

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

	app.post('/api/login', function(req,res){

		/*

		req.body:

		{
			username 	: "Orange",
			email 		: "allan.naranjo@agilityfeat.com",
			subscribe 	: true
		}

		*/

		//WILL REGISTER A PERSON, IF EMAIL AND USERNAME FOUND PERSON WILL BE SENT BACK AND PUT IN SESSION.
		PersonProvider.findOne({
			// username 	: req.body.username,
			email 		: req.body.email
		}, function(err, person){

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

	// app.post('/login', function(req,res){

	// 	//USERS...

	// 	var username = req.body.username;//Orange

	// 	var person = _.find(people, function(who) { return who.username === username } );

	// 	if(person !== undefined){

	// 		res.json({message : "Username already in use, please pick another one! ;( "}, 412);//Precondition fail

	// 	} else {

	// 		person = { username : username };

	// 		req.session.person = person;
			
	// 		people.push(person);

	// 		res.render('index.ejs', { username : person.username });

	// 	}


	// })

	app.get('/demo', function(req, res){

		res.render('demo.ejs',{
			id : "",
			name : ""
		});


	})	



}

module.exports = routes;

console.log("All routes registered");