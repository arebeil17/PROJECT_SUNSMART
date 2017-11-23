// Initiates an Ajax call to a GET endpoint for user status
/*
function sendReqForRegister() {
  var email = document.getElementById("email").value;
  var deviceId = document.getElementById("deviceId").value;
  
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", RegisterResponse);
  xhr.responseType = "json";
  xhr.open("POST", 'http://ec2-18-221-222-52.us-east-2.compute.amazonaws.com:3000/devices/register');
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(JSON.stringify({deviceId:deviceId, email:email}));
}
*/
var user = {    
                fullName: "Andres Rebeil",
                email: "andres07@email.arizona.edu",
                deviceId: "1e002b001047343438323536",
                lastAccess: "Yesterday, 11:59pm"
            };
            
document.addEventListener("DOMContentLoaded", setUser);
            
function setUser(){
   
    document.getElementById("email").innerHTML = " " + user.email;
    document.getElementById("fullName").innerHTML= " " + user.fullName;
    document.getElementById("lastAccess").innerHTML = " " + user.lastAccess;

}            

function sendReqToGetData(){
	var deviceId = "1e002b001047343438323536";
    console.log(deviceId);
  //var deviceId = document.getElementById("deviceId").value;
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", displayMostRecentDevices);
    xhr.responseType = "json";   
    xhr.open("GET", "http://ec2-18-221-222-52.us-east-2.compute.amazonaws.com:3000/samples/last/" + deviceId);
    //xhr.setRequestHeader("content-type", "application/json");
    xhr.send();
  
}

 function displayMostRecentDevices(){
   
   var deviceList = document.getElementById("devices");
   
   if(this.status === 200){
    
        var jsonResponse = this.response;
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
        
        listString += "<tr>";
        if(jsonResponse.hasOwnProperty("deviceId"))
            listString += "<td> " + jsonResponse.deviceId + " </td>";
        else
            listString += "<td></td>";
            
        if(jsonResponse.hasOwnProperty("longitude"))
            listString += "<td> " + jsonResponse.longitude + " </td>";
        else
            listString += "<td></td>";

        if(jsonResponse.hasOwnProperty("latitude"))

            listString += "<td> " + jsonResponse.latitude + " </td>";
        else
            listString += "<td></td>";

        if(jsonResponse.hasOwnProperty("uv"))

            listString += "<td> " + jsonResponse.uv + " </td>";
        else
            listString += "<td></td>";
            
        if(jsonResponse.hasOwnProperty("zip"))
            listString += "<td> " + jsonResponse.zip + " </td>";
        else
            listString += "<td></td>";

        if(jsonResponse.hasOwnProperty("submitTime"))
        
            listString += "<td> " + jsonResponse.submitTime + " </td>";
        else
            listString += "<td></td>";
        listString += "</tr>";
        listString += "</table>";
        
        document.getElementById("deviceTable").innerHTML = listString;
        
       // var newListElement = document.createElement("li");
       // var listData = document.createTextNode(listString);
       // newListElement.appendChild(listData);
       // deviceList.appendChild(newListElement);  
   }

   
}

//document.getElementById("refreshData").addEventListener("click", sendReqToGetData(user.deviceId));
