//Recent device data js file

// GET the user status and list of devices 
function sendReqForStatus() {
    $.ajax({
        url: '/samples/recent/0',
        type: 'GET',
        headers: { 'x-auth': window.localStorage.getItem("token") },    
        responseType: 'json',
        success: statusResponse,
        error: function(jqXHR, status, error) {
          if (status === 401) {
              window.localStorage.removeItem("token");
              window.location = "signin.html";
          }
          else {
             $("#error").html("Error: " + error);
             $("#error").show();
          }
        }
    }); 
}


// Update page to display user's account information and list of devices with apikeys
function statusResponse(data, status, xhr) {
	
	var listString = "";
	listString += "<table>";
	
	listString += "<tr>";
	listString += "<th> DeviceID </th>";
	listString += "<th> Longitude </th>"; 
	listString += "<th> Latitude </th>"; 
	listString += "<th> UV </th>"; 
	listString += "<th> Zip </th>"; 
	listString += "<th> Time Submitted </th>"; 
	listString += "</tr>";
	

	
	for(var sample of data.samples){
			listString += "<tr>";
			listString += "<td> " + sample.deviceId + " </td>";
			listString += "<td> " + sample.longitude + " </td>";
			listString += "<td> " + sample.latitude + " </td>";
			listString += "<td> " + sample.uv + " </td>";
			listString += "<td> " + sample.zip + " </td>";
			listString += "<td> " + sample.submitTime + " </td>";
			listString += "</tr>";
	}
	listString += "</table>";

	$("#recentDeviceData").html(listString);
	
}
function selectDevice(){
	var selected = document.getElementById("selections").value;
	sendReqForStatus(selected);
}

function sendReqForStatus(selected) {
    $.ajax({
        url: '/samples/recent/' + selected,
        type: 'GET',
        headers: { 'x-auth': window.localStorage.getItem("token") },    
        responseType: 'json',
        success: statusResponse,
        error: function(jqXHR, status, error) {
          if (status === 401) {
              window.localStorage.removeItem("token");
              window.location = "signin.html";
          }
          else {
             $("#error").html("Error: " + error);
             $("#error").show();
          }
        }
    }); 
}

// Handle authentication on page load
$(function() {
	if( !window.localStorage.getItem('token') ) {
		window.location = "signin.html";
	}
	else {
		sendReqForStatus();
	}
	var numDevices = window.localStorage.getItem('numDevices');
	console.log(numDevices);
	var optionString = '<select id = "selections" name="selection">';
	for(var i = 0; i < numDevices; i++){
		  optionString += '<option id="option' + i + '" value= "'+ i +'"> Device ' + (i + 1) + '</option>';
	}
	optionString += '</select>';
	$("#selectDiv").html(optionString);
	$('select').material_select();
});