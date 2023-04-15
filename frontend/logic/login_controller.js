AWS.config.region = 'us-east-1'; // Update this with your region
var cognitoUserPoolId = 'us-east-1_7m2wDXZPM';
var cognitoClientId = '7lmee4detgua1eae435gccv0jo';

function submitForm() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  var authenticationData = {
    Username: username,
    Password: password
    };
  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    var poolData = {
    UserPoolId: cognitoUserPoolId,
    ClientId: cognitoClientId
  };
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  var userData = {
    Usernam: username,
    Pool: userPool
  };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);;
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      var accessToken = result.getAccessToken().getJwtToken();
      // Use the accessToken to access AWS resources
          console.log('Authentication successful');
          window.location.href = "index.html";
    },
    onFailure: function (err) {
      console.log('Authentication error: ' + err);
    }
  });
}
