// Register function for signing out.
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('signout').addEventListener('click', function() {
    window.localStorage.removeItem("token");
    window.location = "signin.html";
  });
});