var db;
var Cloudant= require('cloudant');
var dotenv = require('dotenv');
var nconf = require('nconf');
var cloudant;

dotenv.load();

var dbCredentials = {
	dbName : process.env.cloudant_dbName
};

function initDBConnection() {
		
        dbCredentials.url = process.env.cloudant_url ;
        if (process.env.VCAP_SERVICES = 'undefined'){
           cloudant  = Cloudant(dbCredentials.url, function(err , cloudant){
                if (err){
                         console.log('Failed to initialize Cloudant: ' + err.message);
                }
                else{
                    // check if DB exists if not create
                    cloudant.db.create(dbCredentials.dbName, function (err, res) {		
                        if (err){ console.log('ERROR: '+err.message); }
                    });
                    db = cloudant.use(dbCredentials.dbName);
                }
            });
        }
        else {
            cloudant = Cloudant({vcapServices: JSON.parse(process.env.VCAP_SERVICES)},function(err,cloudant){
                if (err){
                         console.log('Failed to initialize Cloudant: ' + err.message);
                }
                else {
                    // check if DB exists if not create
                    cloudant.db.create(dbCredentials.dbName, function (err, res) {		
                        if (err) { 
                            console.log('ERROR: '+err.message); 
                        }
                    });
                    db = cloudant.use(dbCredentials.dbName);
                }
            });
        }
}

initDBConnection();

module.exports = {
	getConnection: function(){
		return db;
	},
    testConnection: function(){
        db.destroy(dbCredentials.dbName, function(err) {

               if(err){
                   console.log(err.message);
                   return false;
               }

              // Create a new database.
              db = cloudant.db.create(dbCredentials.dbName, function() {

                // Specify the database we are going to use
                var user = cloudant.db.use(dbCredentials.dbName)

                // ...and insert a document in it.
                user.insert({ name: 'myName' }, 'myId', function(err, body, header) {
                  if (err) {
                     console.log('[user.insert] ', err.message);
                      return false;
                  }

                  console.log('You have inserted the myId.');
                  console.log(body);
                });
              });
            });
        return true;
    }
}