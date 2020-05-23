// Import all the modules that we need
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Out simple database - a JSON file
const jsonDBName = "myjsondb.json";

// The root path to our REST API
const RESTAPIRoot = "/rest";

// The HTTP server object
let app = express();

// Initialize the middleware for parsing the incoming requests in standard format
app.use(bodyParser.urlencoded({ extended: false }));

// Initialize the middleware for parsing the incoming requests in JSON format
app.use(bodyParser.json());

/**
 * Enable serving static sources like css, js, icons, etc.
 * All the static stuff must be placed in frontend/static/ directory
 */
app.use("/static", express.static("frontend/static"));

/**
 * The server HTTP will listen on 3000 port
 * The port can also be 80, 8080, 8090, etc. (it can be any available port on our machine)
 */
app.listen(3000, () => {
	console.log("Server running on port 3000");
});
 
/**
 * The root for our application - how the web is accessed in browser
 * ex: if the port is 3000, the root will be localhost:3000
 */
app.get("/", function(request, response) {
    response.sendFile(path.join(__dirname + "/frontend/index.html"));
});

/**
 * All the REST API routes will registered as rest/
 * ex. POST rest/contact, GET rest/contact, etc
 * 
 * The requests to the API will:
 * POST http://localhost:3000/rest/contact
 * GET http://localhost:3000/rest/contact
 * etc.
 */

// POST route: /contact (used to create new items)
app.post(RESTAPIRoot + "/contact", function (request, response) {

	/* 
	 * Log the incoming request for debugging
	 * The JSON string body was already parsed by the middlware
	 * that we initialized before (see above the bodyParser)
	 */
  	console.log("Incoming POST contact/: ", request.body);

  	fs.readFile(jsonDBName, "utf8", function readFileCallback(err, data) {
    	if (err) {
    		// Could not open the db file
        	console.log(err);
    	} else {

    		// Read the file content - it's a JSON string and it needs to be parsed
    		let dbContentObj = JSON.parse(data);

    		// Generate a random ID for our new db entry
    		let newId = uuidv4();

    		// Append the new entry to the content
    		dbContentObj.documents.push({id: newId, data: request.body});
    		var dbContentJSON = JSON.stringify(dbContentObj);

    		// Write to db file - async mode
    		fs.writeFile(jsonDBName, dbContentJSON, function(err) {
    			if (err) {
    				// Could not write to db file
        			return console.log(err);
    			}
    			console.log("Successfully added to db!");
			});

    		// Return the response to the client
			response.setHeader("Content-Type", "application/json");

			let responseBody = request.body;
			responseBody.id = newId;

			// The response must be JSON encoded
  			response.end(JSON.stringify(responseBody));
		}
	});
})

// GET route: /contact (used to get the items)
app.get(RESTAPIRoot + "/contact", function(request, response) {

	/* 
	 * Log the incoming request for debugging
	 * Because it's a GET we don't have a body but only query params
	 * ex. query params like filters, pagination, etc.
	 */
  	console.log("Incoming GET contact/: ", request.query);

  	// Simply return all the documents from db file
  	fs.readFile(jsonDBName, "utf8", function readFileCallback(err, data) {
    	if (err) {
    		// Could not open the db file
        	console.log(err);
    	} else {

    		// Read the file content - it's a JSON string and it needs to be parsed
    		let dbContentObj = JSON.parse(data);

    		// Return the response to the client
			response.setHeader("Content-Type", "application/json");

			// The content of db file is already a JSON string
  			response.end(JSON.stringify(dbContentObj.documents));
		}
	});
});


// GET route: /contact/<contactId> (used to get a single item)
app.get(RESTAPIRoot + "/contact/:contactId", function(request, response) {

	/* 
	 * Log the incoming request for debugging
	 * In this case we are interested in a specific URI param - the contact Id
	 */
  	console.log("Incoming GET contact/<contactId>: ", request.params);

  	let findDocId = request.params.contactId;

  	// Read the db file and try to find the document with the id=<contactId>
  	fs.readFile(jsonDBName, "utf8", function readFileCallback(err, data) {
    	if (err) {
    		// Could not open the db file
        	console.log(err);
    	} else {

    		// Read the file content - it's a JSON string and it needs to be parsed
    		let dbContentObj = JSON.parse(data);

    		// Return the response to the client

    		for (let i=0; i < dbContentObj.documents.length ;i++) {
    			if (dbContentObj.documents[i].id == findDocId) {
    				// Stop the loop and simply return the document
    				response.setHeader("Content-Type", "application/json");
  					response.end(JSON.stringify(dbContentObj.documents[i]));
  					return;
    			}
    		}

    		// The document was not found, return a 404 HTTP Error
    		let errorResponse = {
    			code: "invalid_contact_id",
    			message: "The id is invalid (custom app error)"
    		};

    		response.setHeader("Content-Type", "application/json");
    		response.status(404);
    		response.end(JSON.stringify(errorResponse));
		}
	});

});

