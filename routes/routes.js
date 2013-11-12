var routes = function (params) {

	var app = params.app;

	var people = [];


	app.get('/', function(req, res){

		var userInSession = req.session.user;

		res.render('index.ejs',{
			username : userInSession ? userInSession.username : null
		});

	})

	app.post('/:who/disconnect', function(req,res){

		people = _.reject(people, function(person){ return person.username === req.params.who; });

		req.session.destroy();

		res.json({message : "User logged out"});

	});

	app.post('/login', function(req,res){

		//USERS...

		var username = req.body.username;//Orange

		var person = _.find(people, function(who) { return who.username === username } );

		if(person !== undefined){

			res.json({message : "Username already in use, please pick another one! ;( "}, 412);//Precondition fail

		} else {

			person = { username : username };

			req.session.person = person;
			
			people.push(person);

			res.render('index.ejs', { username : person.username });

		}


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