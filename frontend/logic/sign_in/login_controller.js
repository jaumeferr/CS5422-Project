AWS.config.region = 'us-east-1';

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    //Replace into our identity pool id
    IdentityPoolId: 'your-identity-pool-id'
});

var userPool = new AWS.CognitoIdentityServiceProvider.CognitoUserPool({
    //Replace into our user pool id and app client id
    UserPoolId: 'us-east-1_iN0Hhgzdk',
    ClientId: '168535498641-neti0odj1jmloj3hlertft6to67lc667.apps.googleusercontent.com'
});

var form = document.querySelector('form');

form.addEventListener('submit', function(event) {
    event.preventDefault();
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var authenticationData = {
        Username: username,
        Password: password
    };
    var authenticationDetails = new AWS.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
    var userData = {
        Username: username,
        Pool: userPool
    };
    var cognitoUser = new AWS.CognitoIdentityServiceProvider.CognitoUser(userData);
    
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function(result) {
        console.log('Authentication successful');
        },
        onFailure: function(err) {
        console.log('Authentication error: ' + err);
        }
    });
});

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  }