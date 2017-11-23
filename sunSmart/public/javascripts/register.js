function sendReqForRegister() {
  var email = document.getElementById("email").value;
  var deviceId = document.getElementById("deviceId").value;
  
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", RegisterResponse);
  xhr.responseType = "json";
  xhr.open("POST", 'http://ec2-18-221-222-52.us-east-2.compute.amazonaws.com:3000/devices/register');
  xhr.setRequestHeader("Content-type", "application/json");
  
  console.log(JSON.stringify({deviceId:deviceId, email:email}));
  
  xhr.send(JSON.stringify({deviceId:deviceId, email:email}));
}

function RegisterResponse(){
     
      var deviceId = document.getElementById("deviceId").value;
     var responseDiv = document.getElementById('ServerResponse');
     var responseHTML = "";
    
    if (this.status === 201) {
       
         responseHTML="<span> Device "+ deviceId + " was registered </span>";
               
    }
    
    else if (this.status === 400){
        
        responseHTML="<span> Device "+ deviceId + " is already registered </span>";
    }
       
    else {
            console.log("fail");
            // Use a span with dark red text for errors
            responseHTML = "<span class='red-text text-darken-2'>";
            responseHTML += "Error: " + this.response.error;
            responseHTML += "</span>";
    }

      // Update the response div in the webpage and make it visible
      responseDiv.style.display = "block";
      responseDiv.innerHTML = responseHTML;
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("register").addEventListener("click", sendReqForRegister);
  
});

