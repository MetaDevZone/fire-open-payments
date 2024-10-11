/*
How to install fire-open-payments package
use command on terminal
npm install fire-open-payments 
*/

//How to import fire-open-payments package

const FireApi = require("fire-open-payments");

/*
How to initialize FireAPI class
At very first you need to initialize the FireAPI class with the required fields.
Replace the following fields with your own values
1) fire_client_id
2) fire_client_key
3) fire_refresh_token
4) fire_mode    (live or sandbox)
*/

const fireApi = new FireApi({
  fire_client_id: "your_client_id",
  fire_client_key: "your_client_key",
  fire_refresh_token: "your_refresh_token",
  fire_mode: "sandbox",
});

//or

// const config = {
//   fire_client_id: "your_client_id",
//   fire_client_key: "your_client_key",
//   fire_refresh_token: "your_refresh_token",
//   fire_mode: "sandbox",
// };
// const fireApi = new FireApi(config);

//How to generate access token
//When you generate the access token . Package will use For the later requests
const accessToken = await fireAPI.getAccessToken();

/*
How to create payment request
To create a payment request you need to pass the following parameters
1) payment title
2) amount
3) payment details
4) currency code
5) return URL
6) account number to receive payment according to currency
7) reference number
8) due date , expiry date is optional



*/

try {
  const paymentRequestURL = await fireAPI.createPaymentRequest(
    "SandBox Payment", // payment title
    100.0, // amount
    "Make payment for testing system.", // payment details
    "EUR", // currency code
    "https://your-return-url.com", // return URL
    "fire_account_no", // account number to receive payment according to currency
    "reference123", // reference number
    new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString()
  );
} catch (error) {
  res.status(400).json({ message: error.message });
}

/*
How to get payment request details
1)pass the payment request id to get the payment request  
*/

try {
  const paymentRequest = await fireAPI.getPaymentRequest("payment_id"); // payment request id
  //use can use paymentRequest object to get the payment request details
} catch (error) {
  res.status(400).json({ message: error.message });
}

/*
How to check payment request status
1) Pass the payment uuid to get the payment request status
*/

try {
  const paymentStatus = await fireAPI.getPaymentRequestStatus("payment_uuid"); // payment uuid
  //use can use paymentStatus object to get the payment request status
} catch (error) {
  res.status(400).json({ message: error.message });
}

/*
How to Get the Transactions list
1) pass the fire Account Id to get the transaction list
*/

try {
  const transactions = await fireAPI.getTransactions("account_id");
  //use can use transactions object to get the payment request list
} catch (error) {
  res.status(400).json({ message: error.message });
}

/*
How to Handle Webhook
1) create a post route to handle the webhook
2) pass the token to the webhook
3) decode the token to get the status
4) handle the payment success or failure
5) update the payment status in your database
*/

const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.json());

app.post("/webhook", (req, res) => {
  try {
    let token = req.body.toString("utf-8");
    const decoded = jwt.decode(token);
    if (decoded.status == "PAID" || decoded.status == "SETTLED") {
      //Handle payment success here
    } else if (decoded.status == "NOT_AUTHORISED") {
      //Handle payment failure here
    } else {
      //handle other status here like pending
      //Handle other statuses here
    }

    res.status(200).send("OK");
  } catch (error) {
    res.status(401).send("Unauthorized");
  }
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
