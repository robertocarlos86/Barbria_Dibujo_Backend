/* http://tinyurl.com/randstr */

const MODE_DEBUG = true;
const USER_ATLAS = "admindb";
const PASSWD_ATLAS = "3002707873";

// MongoDBCompass
// mongodb+srv://admindb:3002707873@cluster0.mwwi4.mongodb.net/barberiaDB

module.exports = {
	NODE_ENV: (MODE_DEBUG)? "development" : "production", // production or development
	PORT: 3000,	
	NAME_DB: "barberiaDB",	
	URL_DB: (MODE_DEBUG)? "mongodb://localhost:27017/" : "mongodb+srv://"+USER_ATLAS+":"+PASSWD_ATLAS+"@cluster0.mwwi4.mongodb.net/",	
    seed: "hRmzQQp7T4DCmXc",
	expire: '1d'
}