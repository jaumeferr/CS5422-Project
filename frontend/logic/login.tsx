// ES5 example
const { CognitoIdentityClient, CreateIdentityPoolCommand } = require("@aws-sdk/client-cognito-identity");

// ES6+ example
import { CognitoIdentityClient, CreateIdentityPoolCommand } from "@aws-sdk/client-cognito-identity";

// a client can be shared by different commands.
const client = new CognitoIdentityClient({ region: "us-east-1" });

const params = {
  /** input parameters */
};
const command = new CreateIdentityPoolCommand(params);