var apiUsername = 'jamesnewmantest902@googlemail.com';
var apiPassword = 'F2r1uUpFD9J6hLr3';

var authenticateEndpoint = 'https://realm.mongodb.com/api/client/v2.0/app/data-gtclw/auth/providers/local-userpass/login'
var mongodbEndpoint = 'https://eu-west-2.aws.data.mongodb-api.com/app/data-gtclw/endpoint/data/v1';
var accessToken = '';

var mongodbCollection = 'entries';
var mongodbDatabase = 'guestbook';
var mongodbDataSource = 'ClusterGuestbook';
var ipAddress = '';

$(document).ready(function () {
	
	setEventHandlers();
	getAccessToken();
	getIpAddress();


});

function setEventHandlers() {

	$(document).on("click", ".guestbook-entry-submit", function() { submitGuestbookEntry(this); });
	$(document).on("click", ".guestbook-entry-flag-spam", function() { spamGuestbookEntry(this); });
	//$(document).on('keydown', '.city-text-input', function() { updateCountryDropdown(this); });
		 
}

function getAccessToken(obj) {

	var url = authenticateEndpoint;
	var data = {username: apiUsername, password: apiPassword};

	$.ajax({
	    url: url,
		data: data,
		type: 'POST',
	    success: function (data, textStatus, jqXHR) { populateAccessToken(data); },
		error: function (e, x, settings, exception) { alertMessage(e.resposeText); }
	});

}

function getIpAddress(obj) {

	$.getJSON('https://api.ipify.org?format=jsonp&callback=?', function(data) {
		ipAddress = data;
	  });

}

function populateAccessToken(data) {

	accessToken = data.access_token;
	populateGuestbookData();

}

function populateGuestbookData() {

	var dateAddedLimit = new Date();
	dateAddedLimit.setMonth(dateAddedLimit.getMonth() - 12);

	var url = mongodbEndpoint + '/action/find';
	var data = {
		'dataSource': mongodbDataSource,
		'database': mongodbDatabase,
		'collection': mongodbCollection,
		'filter': {'spam': false},
		'sort': { 'dateAdded': -1 },
		'limit': 10
	};

	$.ajax({
	    url: url,
		type: 'POST',
	    data: JSON.stringify(data),
		headers: {
			'Access-Control-Request-Headers': '*',
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + accessToken,
		},
	    success: function (data, textStatus, jqXHR) { populateGuestbookEntries(data); },
		error: function (e, x, settings, exception) { alertMessage(e.resposeText); }
	});

}

function submitGuestbookEntry() {

	var document = {
		"name": $('.gbi-name').val(),
		"email": $('.gbi-email').val(),
		"age": parseInt($('.gbi-age').val()),
		"entry": $('.gbi-entry').val(),
		"dateAdded": { "$date": new Date() },
		"ipAddress":ipAddress.ip,
		"spam":false
	}

	var url = mongodbEndpoint + '/action/insertOne';
	var data = {
		'dataSource': mongodbDataSource,
		'database': mongodbDatabase,
		'collection': mongodbCollection,
		'document': document
	};

	$.ajax({
	    url: url,
		type: 'POST',
	    data: JSON.stringify(data),
		headers: {
			'Access-Control-Request-Headers': '*',
			'Content-Type': 'application/ejson',
			'Authorization': 'Bearer ' + accessToken,
		},
	    success: function (data, textStatus, jqXHR) { submitGuestbookEntrySuccess(document); },
		error: function (e, x, settings, exception) { alertMessage(e.resposeText); }
	});

}

function spamGuestbookEntry(obj) {

	var $parent = $(obj).closest('.guestbook-entry');
	var id = $parent.data('id');

	var url = mongodbEndpoint + '/action/updateOne';
	var data = {
		'dataSource': mongodbDataSource,
		'database': mongodbDatabase,
		'collection': mongodbCollection,
		"filter": { "_id": { "$oid": id	}},
		"update": {	"$set": { "spam": true }}
	};

	$.ajax({
	    url: url,
		type: 'POST',
	    data: JSON.stringify(data),
		headers: {
			'Access-Control-Request-Headers': '*',
			'Content-Type': 'application/ejson',
			'Authorization': 'Bearer ' + accessToken,
		},
	    success: function (data, textStatus, jqXHR) { spamGuestbookEntrySuccess($parent); },
		error: function (e, x, settings, exception) { alertMessage(e.resposeText); }
	});

}

function spamGuestbookEntrySuccess($parent) {

	$parent.remove();
	colourDivs();
	alertMessage('Guestbook entry successfully marked as spam!');

}

function submitGuestbookEntrySuccess(val) {

	var $entryElement = getGuestbookEntryElement(val);
	$('.guestbook-entries-container').prepend($entryElement);

	alertMessage('Guestbook entry successfully added to database!');
	clearInputFields();	

}

function clearInputFields() {

	$('.gbi-name').val('');
	$('.gbi-email').val('');
	$('.gbi-age').val('');
	$('.gbi-entry').val('');

}

function populateGuestbookEntries(data) {

	var guestbookEntries = data.documents;
		
	//add values from ajax call
	$.each(guestbookEntries, function (key, val) {
		
		var $entryElement = getGuestbookEntryElement(val);
		$('.guestbook-entries-container').append($entryElement);
		colourDivs();
		
	});

}


function getGuestbookEntryElement(val) {

	//clone element and populate with data
	var $entryElement = $('.guestbook-entry.clone').clone().removeClass('clone');

	$entryElement.data('id',val._id);

	$entryElement.find('.guestbook-entry-name').text(val.name.trim() ? val.name.trim() : 'Anonymous');
	$entryElement.find('.guestbook-entry-age').text(val.age ? val.age : '???');
	$entryElement.find('.guestbook-entry-ip .value').text(val.ipAddress);
	$entryElement.find('.guestbook-entry-text .value').text(val.entry.trim());
	
	return $entryElement;

}


function alertMessage(text) {

	if (text != '' && text != null) {
		//simple alert message display
		$('.alert .alert-inner').text(text);
		$('.alert').show();
		$('.alert').delay(10000).fadeOut('slow');
	}

}