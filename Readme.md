# FireAPI

FireAPI is a Node.js package that provides a convenient interface to interact with the [Fire.com ](https://docs.fire.com/reference)API. It allows you to create payment requests, check payment statuses, list transactions for accounts, and handle webhooks. The package handles authentication and API requests, making it easier to integrate [Fire.com](https://docs.fire.com/reference)
services into your applications.

## Features

- Generate access tokens for secure API communication
- Create payment requests
- Retrieve details of payment requests
- Check the status of payments
- List transactions for an account
- Handle webhooks for event notifications

## Installation

To install the package, use npm:

```bash
npm install fire-open-payments
```

## Examples

You can find example code in the `example` folder of this package.

## Usage

### Importing the Module

To use the FireAPI module in your project, import it as follows:

```javascript
const FireAPI = require("fire-open-payments");
```

### Initializing the FireAPI Class

To initialize the FireAPI class, you need to provide a configuration object with the following properties:

- `fire_client_id` (string): Your Fire.com client ID
- `fire_client_key` (string): Your Fire.com client key
- `fire_refresh_token` (string): Your Fire.com refresh token
- `fire_mode` (string): The mode of operation, either "live" or "sandbox"

```javascript
const config = {
  fire_client_id: "your_client_id",
  fire_client_key: "your_client_key",
  fire_refresh_token: "your_refresh_token",
  fire_mode: "sandbox", // or 'live'
};

const fireAPI = new FireAPI(config);
```

### Generating an Access Token

You can generate an access token using the `getAccessToken` method. This token is automatically used for subsequent API requests.

```javascript
const accessToken = await fireAPI.getAccessToken();
console.log(accessToken);
```

### Creating a Payment Request

To create a payment request, use the `createPaymentRequest` method. This method requires several parameters:

- `request_title` (string): The title of the payment request.
- `amount` (number): The amount to be paid.
- `details` (string): Details about the payment.
- `currency` (string): The currency code (e.g., 'EUR').
- `return_url` (string, optional): The URL to redirect to after payment.
- `fire_account_no` (string): The Fire account number to receive the payment.
- `reference` (string): A reference for the payment.
- `expiry` (string, optional): The expiry date of the payment request in ISO format.

```javascript
const paymentRequestURL = await fireAPI.createPaymentRequest(
  "Payment Title",
  100.0,
  "Payment details",
  "EUR",
  "https://your-return-url.com",
  "fire_account_no", // account number to receive payment according to currency
  "reference123"
);
console.log(paymentRequestURL);
```

### Retrieving a Payment Request

To retrieve the details of a specific payment request, use the `getPaymentRequest` method with the payment ID.

```javascript
const paymentRequest = await fireAPI.getPaymentRequest("payment_id");
console.log(paymentRequest);
```

### Checking Payment Status

To check the status of a payment, use the `getPaymentRequestStatus` method with the payment UUID.

```javascript
const paymentStatus = await fireAPI.getPaymentRequestStatus("payment_uuid");
console.log(paymentStatus);
```

### Listing Transactions

To list transactions for an account, use the `getTransactions` method with the account ID.

```javascript
const transactions = await fireAPI.getTransactions("account_id");
console.log(transactions);
```

### Handling Webhooks

Webhooks allow you to be notified of events as they happen on your Fire.com accounts. This is useful if you have systems that need to know when things happen on your account, such as payments or withdrawals.

#### Configuring Your Webhook Settings

You can set up webhooks in the Fire business application. There are a set of Webhook API Tokens in the Profile > Webhooks section. The key ID (kid) in the JWT header will be the webhooks public token, and you should use the corresponding private token as the secret to verify the signature on the JWT.

#### Designing Your Webhook Processing

In general, webhooks do not guarantee data integrity, as communication or errors on the sender/receiver side can occur. To address these potential issues, both the sender and the receiver applications need to provide for idempotency. Idempotency ensures that an operation can be executed "at least once" and "at most once", resulting in the same outcome each time.

To implement idempotency on the sender side, retrying failed webhook requests might be necessary to ensure that the operation is executed "at least once", and our system is designed to automatically retry failed requests three to five times, with a one-minute interval between each attempt.

To achieve idempotency on your (the receiver) side, you need to ensure the "at most once" principle by disregarding duplicates. This can be done by enforcing a unique constraint on the payload data, such as `Txn_id`.

#### Receiving a Webhook at Your Server

You will receive an array of events as they occur. In general, there will be only one event per message, but as your volume increases, we will gather all events in a short time-window into one call to your webhook. This reduces the load on your server.

When the data is sent to your webhook endpoint it will be signed and encoded using JWT (JSON Web Token). JWT is a compact URL-safe means of representing data to be transferred between two parties (see [JWT.io](https://jwt.io) for more details and to get a code library for your programming environment). The signature is created using a shared secret that only you and Fire.com have access to, so you can be sure that it came from us.

A JWT looks like this:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0TY3ODkwI...ibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
```

This needs to be decoded using the library from JWT.io. You should ensure that the signature is valid by checking the HS256 signature included in the JWT was created using the private token corresponding to the key ID (kid) in the header.

## Example

Here is an example of a simple Express server that handles Fire.com webhooks:

```javascript
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
```

## Error Handling

Errors are logged to the console with detailed information. Ensure proper error handling in production environments.

```javascript
try {
  const accessToken = await fireAPI.getAccessToken();
} catch (error) {
  console.error("Error generating access token:", error);
}
```

## API Reference

### Constructor

#### `new FireAPI(config)`

Creates an instance of the FireAPI class.

- `config` (object): The configuration object containing required fields.

### Methods

#### `async getAccessToken()`

Generates and returns an access token for API communication.

#### `async createPaymentRequest(request_title, amount, details, currency, return_url, fire_account_no, reference, expiry)`

Creates a payment request and returns the payment URL.

- `request_title` (string): The title of the payment request.
- `amount` (number): The amount to be paid.
- `details` (string): Details about the payment.
- `currency` (string): The currency code.
- `return_url` (string, optional): The return URL after payment.
- `fire_account_no` (string): The Fire account number.
- `reference` (string): A reference for the payment.
- `expiry` (string, optional): The expiry date in ISO format.

#### `async getPaymentRequest(payment_id)`

Retrieves details of a specific payment request.

- `payment_id` (string): The ID of the payment request.

#### `async getPaymentRequestStatus(payment_uuid)`

Checks the status of a payment.

- `payment_uuid` (string): The UUID of the payment.

#### `async getTransactions(account_id)`

Lists transactions for a specific account.

- `account_id` (string): The ID of the account.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss changes.

## License

This package is licensed under the MIT License.

## Contact

For any questions or support, please contact [team@metadevzone.com].

---

Enjoy using FireAPI! If you have any feedback or issues, please don't hesitate to reach out.
