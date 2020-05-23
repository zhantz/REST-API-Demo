const BaseAPIPath = 'http://localhost:3000/rest';
const ContactAPIPath = "/contact";

function processForm(event) {

	event.preventDefault();

	// in this object we keep the data that will be sent to backend
	let data = {};

	// get values from formular
	data['firstName'] = document.getElementById("firstName").value;
	data['lastName'] = document.getElementById("lastName").value;
	data['email'] = document.getElementById("email").value;
	
	let eyeColorOps = document.getElementById("eyeColor");
	data['eyeColor'] = eyeColorOps.options[eyeColorOps.selectedIndex].value;

	// debugging: print the collected data as object in browser's console
	console.log(data);

	// debugging: print the collected data as JSON string in browser's console
	console.log(JSON.stringify(data));

	let fullAPIPath = BaseAPIPath + ContactAPIPath;
	let httpPromise = fetch(fullAPIPath, {
    	method: 'POST',
    	body: JSON.stringify(data),
    	headers: {
        	'Content-Type': 'application/json',
        	'Accept': 'application/json'
    	}
	});

    httpPromise.then(function(response) {
    	// log the response from backend for debugging
    	console.log(response);

  		// show a simple alert
  		if (response.ok) {
  			// the status code is 200
  			alert("Contact successfully created!");
  		} else {
  			alert("Error: contact could not be created.");
  		}
    });

	return false;
}

function getItems () {

	let fullAPIPath = BaseAPIPath + ContactAPIPath + "?page=1&perPage=20";
	let httpPromise = fetch(fullAPIPath, {
    	method: 'GET',
    	headers: {
        	'Content-Type': 'application/json',
        	'Accept': 'application/json'
    	}
	});

    httpPromise.then(function(response) {
    	// log the response from backend for debugging
    	console.log(response);

    	// handle the response from backend
    	response.json().then(data => {
  			populateTable(data);
		});
    	
  		// show a simple alert
  		if (response.ok) {
  			// the status code is 200
  			alert("Contacts successfully read!");
  		} else {
  			alert("Error: contact could not be created.");
  		}
    });

	return false;
}

function populateTable(documents) {
	console.log(documents);

	let itemsTable = document.getElementById('itemsList');

	for (let i=0; i < documents.length ;i++) {
		
		let newRow = itemsTable.insertRow(i+1);
		let item1 = newRow.insertCell(0);
		let item2 = newRow.insertCell(1);
		let item3 = newRow.insertCell(2);
		let item4 = newRow.insertCell(3);
		let item5 = newRow.insertCell(4);

		item1.innerHTML = documents[i].data.firstName;
		item2.innerHTML = documents[i].data.lastName;
		item3.innerHTML = documents[i].data.email;
		item4.innerHTML = documents[i].data.eyeColor;
		item5.innerHTML = documents[i].id;
	}
}