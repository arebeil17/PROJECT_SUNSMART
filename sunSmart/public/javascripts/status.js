// GET the user status and list of devices 
function sendReqForStatus() {
    $.ajax({
        url: '/users/status',
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
    $("#main").show();

    $("#email").html(data.email);
    $("#fullName").html(data.fullName);
    $("#lastAccess").html(data.lastAccess);
    
    // Add the devices to the list before the list item for the add device button (link)
    for (var device of data.devices) {
      $("#addDeviceForm").before("<li class='collection-item'>ID: " +
         device.deviceId + ", APIKEY: " + device.apikey + "</li>")
    }
	//console.log(data.devices.length);
	window.localStorage.setItem('numDevices', data.devices.length);
}

// Registers the specified device with the server.
function registerDevice() {
	
	var formData = { deviceId: $("#deviceId").val()};
	
    $.ajax({
        url: '/devices/register',
		dataType : 'json',
		contentType: 'application/json; charset=UTF-8', // This is the money shot
        type: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("token") },
		data: JSON.stringify(formData),	 
        responseType: 'json',
        success: deviceRegistered,
        error: function(jqXHR, status, error) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    }); 
}

// Device successfully register. Update the list of devices and hide the add device form
function deviceRegistered(data, status, xhr) {
    // Add new device to the device list
    $("#addDeviceForm").before("<li class='collection-item'>ID: " +
         $("#deviceId").val() + ", APIKEY: " + data["apikey"] + "</li>")
    hideAddDeviceForm();
}

// Show add device form and hide the add device button (really a link)
function showAddDeviceForm() {
   $("#deviceId").val("");           // Clear the input for the device ID
   $("#addDeviceControl").hide();    // Hide the add device link
   $("#addDeviceForm").slideDown();  // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hideAddDeviceForm() {
   $("#addDeviceControl").show();  // Hide the add device link
   $("#addDeviceForm").slideUp();  // Show the add device form
   $("#error").hide();
}

// Handle authentication on page load
$(function() {
  if( !window.localStorage.getItem('token') ) {
    window.location = "signin.html";
  }
  else {
    sendReqForStatus();
  }
  
  // Register event listeners
  $("#addDevice").click(showAddDeviceForm);
  $("#registerDevice").click(registerDevice);   
  $("#cancel").click(hideAddDeviceForm);   
});