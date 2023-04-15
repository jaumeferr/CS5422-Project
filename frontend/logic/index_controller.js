AWS.config.region = 'us-east-1'; // Update this with your region
var cognitoUserPoolId = 'us-east-1_7m2wDXZPM';
var cognitoClientId = '7lmee4detgua1eae435gccv0jo';

function checkAuth() {
  var poolData = {
    UserPoolId: cognitoUserPoolId,
    ClientId: cognitoClientId
  };
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  var cognitoUser = userPool.getCurrentUser();
  if (cognitoUser != null) {
    cognitoUser.getSession(function (err, session) {
      if (err) {
        console.log(err);
        //window.location.href = "login.html"; // Redirect to login page if not authenticated
      } else {
        console.log('User is authenticated');
        // User is authenticated, do something here if needed
      }
    });
  } else {
    console.log('User is not authenticated');
    window.location.href = "login.html"; // Redirect to login page if not authenticated
  }
}

checkAuth();

const sendButton = document.getElementById('send-button');
const userInput = document.getElementById('user-input');
const responseSection = document.getElementById('response-section');

sendButton.addEventListener('click', () => {
  const question = userInput.value;
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://192.168.1.20', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      // Add code to display response in response section
    }
  };
  xhr.send(JSON.stringify({ question: question }));
});

