var express = require('express');
var router = express.Router();
var request = require('request');
process.env.RDS_HOSTNAME = ''
process.env.RDS_USERNAME = ''
process.env.RDS_PASSWORD = ''
process.env.RDS_PORT = ''

var http = require('http');
var APIKEY = 'F56370B2E3B346DF';

var unauthenticatedHeader = {
  		'cache-control': 'no-cache',
	    'content-type': 'application/json'};

var authenticatedHeader = {
	'cache-control': 'no-cache',
    'Content-Type' :     'application/json',
    'Authorization' : ''
};

function createAuthHeader(token) {
	authenticatedHeader = {
	'cache-control': 'no-cache',
    'Content-Type' :     'application/json',
    'Authorization' : 'Bearer ' + token
	};
	return authenticatedHeader;
}

function makeSearchOptions(query) {
    return {
      method: 'GET',
      url: tvdb + '/search/series',
      headers: authenticatedHeader,
      qs : {'name' : query},
      json: true
    };
}

function makeShowIdOptions(query) {
    return {
      method: 'GET',
      url: tvdb + '/series/' + query,
      headers: authenticatedHeader,
      qs : {},
      json: true
    };
}

var tvdb = "https://api.thetvdb.com";

var retrieveTokenOptions = { 
  method: 'POST',
  url: tvdb + '/login',
  headers: unauthenticatedHeader,
  body: { apikey: 'F56370B2E3B346DF' },
  json: true 
};

// console.log("retrieveTokenOptions " + retrieveTokenOptions);

var searchOptions = {
	method: 'GET',
	url: tvdb + '/search/series',
	headers: authenticatedHeader,
	qs : {'name' : 'Dexter'},
	json: true
};



function tvdbQuery(queryOptions){

  function queryFunction(options) {
    request(options, function (error, response, body) {
        if (response.statusCode == 401){
          console.log(searchOptions);
          console.log("------ 401 ERROR -----");
          //authenticateTVDB(retrieveTokenOptions);
          return null;
        }
        else if (!error && response.statusCode == 200) {
            // Print out the response body

            console.log("search results: ");
            console.log(body);
            return body;
        }
    });
}

  if (authenticatedHeader.Authorization == '') {
    request(retrieveTokenOptions, function (error, response, body) {
    //console.log(response.statusCode);
      if (!error) { // && response.statusCode == 200
          queryOptions.headers = createAuthHeader(body.token);
          console.log("authenticated Header: ", authenticatedHeader);
          results = queryFunction(queryOptions);
          console.log(results);
          // if (typeof queryFunction !== 'undefined'){queryFunction(queryOptions);}
      } else {
        console.log("Error!: " + error);
        console.log("check");
      }
    });
  } else {
      results = queryFunction(queryOptions);
      console.log(options)
  }
    
}


console.log("About to authenticateTVDB");

function authenticateTVDB(options, func, options2) {
	request(options, function (error, response, body) {
		//console.log(response.statusCode);
	    if (!error) { // && response.statusCode == 200
	        authenticatedHeader = createAuthHeader(body.token);
	        searchOptions.headers = authenticatedHeader;
	        console.log("authenticated Header: ", authenticatedHeader);
	        if (typeof func !== 'undefined'){func(options2);}
	    } else {
	    	console.log("Error!: " + error);
	    	console.log("check");
	    }
	});
}

console.log("makeSearchOptions")
tvdbQuery(makeSearchOptions("Dexter"))

// authenticateTVDB(retrieveTokenOptions);
// searchSeries2(searchOptions);
console.log("tried both functions");

function searchSeries(options) {

	if (authenticatedHeader.Authorization == '') {
		console.log("Auth == \' \'");
		authenticateTVDB(retrieveTokenOptions);
		console.log(authenticatedHeader);
	} else {
		request(options, function (error, response, body) {
		    if (response.statusCode == 401){
		    	console.log(searchOptions);
		    	console.log("------ 401 ERROR -----");
		    	//authenticateTVDB(retrieveTokenOptions);
		    }
		    else if (!error && response.statusCode == 200) {
		        // Print out the response body

		        console.log("search results: ");
		        console.log(body);
		    }
		});
	}
}

function searchSeries2(options) {

	if (authenticatedHeader.Authorization == '') {
		console.log("Auth == \' \'");
		authenticateTVDB(retrieveTokenOptions, searchSeries, options);
	} else {
		searchSeries(options)
	}
	
}


var mysql = require('mysql');

var db_connection = mysql.createConnection({
  host     : process.env.RDS_HOSTNAME,
  user     : process.env.RDS_USERNAME,
  password : process.env.RDS_PASSWORD,
  port     : process.env.RDS_PORT
});

db_connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");    
} else {
    console.log("Error connecting database ... nn");    
}
});
	
db_connection.query('USE ReelMarkets');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* Route: Register user */
router.post('/userRegistration/', function(req, response){
 
  console.log(req.body.username);
  db_connection.query('SELECT * FROM User WHERE Username = ?', req.body.username, function(err, rows){
      if (err) {
      		console.log("there was an error with selcting username");
      		console.log(req.body);
           console.log(err); 
      } else {
        if (rows.length === 0) {
        	
          var date = getDate();

          var newUser = {Username: req.body.username, Password: req.body.password, Email: req.body.email,
          	Account_Type: 'USER', Birthday: req.body.birthday, Gender: req.body.gender,
          	isBanned: 0, Creation_Date: date, Last_Login_Date: date, Currency: 2500};
          	
          	db_connection.query('INSERT INTO User SET ?', newUser, function(err, res){
	            if (err) {
	              console.log("Error with inserting user")
	              console.log(err);
	            } else {
	              response.send('Success!');
	            }
            });
        } else {
          response.send('Exists');
        }
      }
  });
});


/* Route: Login user */
router.get('/getLoginStatus/', function(req, res){
  var username = req.query.username;
  var password = req.query.password;
console.log(req.query);
  db_connection.query('SELECT * FROM User WHERE Username = ?', username, function(err, rows){
    if (err) {
      res.send('Error with SELECT');
    } else {
      console.log(rows);
      if (rows.length === 0) {
      	res.send('No Username found');
      } else {
      	if (rows[0].Password === password) {
      		ret = rows[0];
      		ret.Password = "";
      		res.send(ret);
   //    		db_connection.query('Update User SET Last_Login_Date=? WHERE Username=?', [getDate(), username], function(err, rows){
			//     if (err) {
			//       res.send('Error with Update Time');
			//     }
			// });
      	} else {
        	res.send('Incorrect Password');
      	}
      }
    }
  });
});

/* Route: Create Poll */
	router.post('/createPoll/', function(req, response){
	console.log("pid is 0");

	var pid = 0;

	db_connection.query('SELECT MAX(PollID) FROM Poll', function(err, rows){
	    if (err) {
	    	console.log(err);
	     	res.send('Error with SELECT MAX');
	    } else if (rows[0] != null) {
	    	console.log(rows);
	    	x = JSON.stringify(rows[0]);
	    	x = JSON.parse(x);
	    	x = x['MAX(PollID)'];
	    	console.log(x);
	    	pid = x + 1;
	    	console.log(pid);
	    	 
	    	//console.log(rows[0].@MAX(PollID));
	      	//pid = JSON.parse(rows[0])["MAX(PollID)"] += 1;
	      	var newPoll = {
						PollID : pid,
						Show_Name : req.body.Show_Name,
						Show_ID : req.body.Show_ID,
						Season : req.body.Season,
						Episode : req.body.Episode,
						Poll_Creator : req.body.Poll_Creator,
						Question_Name: req.body.Question_Name,
						Poll_Options : req.body.Poll_Options,
						Option_Count : req.body.Option_Count,
						isOpen : req.body.isOpen,
						Creation_Date : req.body.Creation_Date,
						Expiry_Date : req.body.Expiry_Date

						}
			createPoll(newPoll);
	    }
	  });
	

function createPoll(newPoll)  {
db_connection.query('INSERT INTO Poll SET ?', newPoll, function(err, res){
            if (err) {
              console.log("Error with inserting user");
              console.log(err);
              res.send('Error with inserting');
            } else {
              res.send('Success!');
            }
      });
}
});


// TODO : Return a list of banned and unbanned users
router.get('/getBannedUsers/', function(req, res){
  var username = req.query.username;
console.log(req.query);
  db_connection.query("SELECT * FROM User WHERE Account_Type = 'ADMIN' AND Username = ?", username, function(err, rows){
    if (err) {
      res.send('Error with SELECT');
    } else {
      console.log(rows);
      if (rows.length === 0) {
      	res.send('Invalid account request');
      } else {
	      		db_connection.query('SELECT Username, isBanned FROM User', function(err, rows){
				    if (err) {
				      res.send('Error with retrieving ban info');
				    } else {
				      console.log(rows);
				      res.send(rows);
				    }
			    });
  			
  		}
      }
  });
});

// Returns a list of users
router.get('/getUserList/', function(req, res){
console.log(req.query);
  db_connection.query("SELECT Username FROM User", function(err, rows){
    if (err) {
      res.send('Error with SELECT');
    } else {
      console.log(rows);
      res.send(rows);
      }
  });
});


// TODO : set up search so it populates genres table
router.get('/getShowByGenre/', function(req, res){
  var genre = req.query.genre;
  genre = '%' + genre + '%';
console.log(req.query);
  db_connection.query('SELECT ShowID, Show_Name, Banner FROM Show_Genres WHERE Genre LIKE ?', genre, function(err, rows){
    if (err) {
      res.send('Error with SELECT show');
    } else {
      console.log(rows);
      if (rows.length === 0) {
      	res.send('No Shows Found');
      } else {
      	if (rows[0].Password === password) {
      		ret = rows[0];
      		ret.Password = "";
      		res.send(ret);
      	} else {
        	res.send('Incorrect Password');
      	}
      }
    }
  });
});



router.get('/searchShow/', function(req, res){
  var show_name = req.query.showName;
  // console.log(req.query);
  db_connection.query('SELECT * FROM Show_Genres WHERE Show_Name = ?', show_name, function(err, rows){
    if (err) {
      res.send('Error with SELECT');
    } else {
      console.log(rows);
      if (rows.length === 0) {
        search_results = tvdbQuery(makeSearchOptions(show_name));

        for (i = 0; i < 3; i++) {
          if (search_results_data[i] != undefined) {
            id = search_results_data[i].id;
            banner = "posters/" + id + "-1.jpg";
            showName = search_results_data[i].seriesName;
            id_results = tvdbQuery(makeShowIdOptions(id));
            genres = id_results.data.genre
            inputGenre = ""
            for (j = 0; j < genres.length; j++) {
              val = genres[j]
              if (val === "Action" || val === "Adventure" || val === "Suspense" || val === "Western") {
                inputGenre += "Action,"
              } else if (val === "Comedy") {
                inputGenre += "Comedy,"
              } else if (val === "Crime" || val === "Mystery") {
                inputGenre += "Crime,"
              } else if (val === "Drama" || val === "Romance" || val === "Soaps") {
                inputGenre += "Drama,"
              } else if (val === "Family" || val === "Children") {
                inputGenre += "Family,"
              } else if (val === "Fantasy" || val === "Science Fiction") {
                inputGenre += "Fantasy,"
              } else if (val === "Horror" || val === "Thriller") {
                inputGenre += "Horror,"
              } else if (val === "Reality") {
                inputGenre += "Reality,"
              }
            }
            inputGenre = inputGenre.subString(0, inputGenre.length - 1)

            query_string = 'INSERT INTO Show_Genres(ShowID, Genre, Banner, Show_Name) VALUES ("' + id +'", "' + inputGenre + '", "'+ banner + '", "'+ showName + '")'
            db_connection.query(query_string, function(err, rows){
              if (err) {
                console.log('Error with Insert Into Show_Genres');
              } else {
                console.log("Success");
              }
            });
          }
        }

        if (search_results === undefined) {
          ret = show_name + " can't be found";
        } else {
          ret = search_results.data[0].id
          db_connection.query("SELECT * FROM Poll WHERE Show_ID = ?", search_results.data[0].id, function(err, rows){
              if (err) {
                ret = 'Error with SELECT';
              } else {
                console.log(rows);
                if (rows.length === 0) {
                  ret = 'No Polls';
                } else {
                  ret = rows;
                }
              }
            });
        }
        res.send(ret);
      } else {
        ret = "Error";
        show_id = rows[0].Show_ID;
        db_connection.query("SELECT * FROM Poll WHERE Show_ID = ?", show_id, function(err, rows){
              if (err) {
                ret = 'Error with SELECT';
              } else {
                console.log(rows);
                if (rows.length === 0) {
                  ret = 'No Polls';
                } else {
                  ret = rows;
                }
              }
            });
        res.send(ret);
        }
        
      }
    }
  });
});

router.get('/getPollByShowID/', function(req, res){
  var show_id = req.query.ShowID;
console.log(req.query);
  db_connection.query("SELECT * FROM Poll WHERE Show_ID = ?", show_id, function(err, rows){
    if (err) {
      res.send('Error with SELECT');
    } else {
      console.log(rows);
      if (rows.length === 0) {
        res.send('No Polls');
      } else {
        res.send(rows);
      }
      }
  });
});

function getDate() {
	var date = new Date();
     return date.getFullYear() + "-" + date.getMonth()+1 + "-" + date.getDate();
} 

module.exports = router;