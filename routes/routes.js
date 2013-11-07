var routes = function (params) {

	var app = params.app;


	app.get('/', function(req, res){

		res.render('index.ejs',{});


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