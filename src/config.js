const axios = require("axios");
const crypto = require("crypto");
class FireAPI {
  constructor(config) {
    this.config = this.checkRequiredFields(config);
    this.accessToken = null;
  }

  checkRequiredFields(config) {
    const requiredFields = [
      "fire_client_id",
      "fire_client_key",
      "fire_refresh_token",
      "fire_mode",
    ];
    requiredFields.forEach((field) => {
      if (!config[field]) {
        throw new Error(`${field} is required`);
      }
    });

    config.fire_payment_request_url =
      config.fire_mode != "live"
        ? "https://api-preprod.fire.com/"
        : "https://api.fire.com/";

    config.fire_redirect_url =
      config.fire_mode != "live"
        ? "https://payments-preprod.fire.com/"
        : "https://payments.fire.com/";

    return config;
  }

  async getAccessToken() {
    const { fire_client_id, fire_client_key, fire_refresh_token } = this.config;
    const nonce = Math.floor(Math.random() * 1000000000).toString();
    const hashedData = getHashedData(nonce, fire_client_key);

    let fire_url =
      this.config.fire_payment_request_url + "business/v1/apps/accesstokens";
    try {
      const res = await axios.post(
        fire_url,
        {
          clientId: fire_client_id,
          refreshToken: fire_refresh_token,
          nonce: nonce,
          grantType: "AccessToken",
          clientSecret: hashedData,
        },
        {
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
        }
      );
      this.accessToken = res.data.accessToken;
      return this.accessToken;
    } catch (error) {
      console.log({
        response: error?.response.data.errors,
        error: error?.response?.error,
      });
      return error
    }
  }

  /**
   *
   * @param {*} request_title  - Title of the payment request
   * @param {*} amount  - Amount to be paid
   * @param {*} details  - Details of the payment request
   * @param {*} currency  - Currency code
   * @param {*} return_url  - URL to redirect after payment
   * @param {*} fire_account_no  - Account number to receive payment according to currency
   * @param {*} reference  - Reference number
   * @param {*} expiry  - Expiry date of the payment request in ISO format
   * @returns
   * @description: Create a payment request to fire.com
   */

  async createPaymentRequest(
    request_title,
    amount,
    details,
    currency,
    return_url = "",
    fire_account_no,
    reference,
    expiry = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString()
  ) {
    if (!this.accessToken) {
      await this.getAccessToken();
    }
    let fire_url =
      this.config.fire_payment_request_url + "business/v1/paymentrequests";
    try {
      var fire_request_obj = {
        currency: currency,
        type: "OTHER",
        icanTo: fire_account_no,
        amount: amount,
        myRef: reference,
        description: request_title,
        maxNumberPayments: 1,
        expiry: expiry,
        orderDetails: details,
      };

      if (!!return_url) {
        fire_request_obj.returnUrl = return_url;
      }

      const res = await axios.post(fire_url, fire_request_obj, {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      return this.config.fire_redirect_url + res.data.code;
    } catch (error) {
      console.log({
        response: error?.response.data.errors,
        error: error.response.data.errors,
      });
      return error
    }
  }

  /**
   *
   * @param {*} payment_id - Payment request ID
   * @returns
   * @description: Return the payment request details
   */

  async getPaymentRequest(payment_id) {
    if (!this.accessToken) {
      await this.getAccessToken();
    }
    let fire_url =
      this.config.fire_payment_request_url +
      `business/v1/paymentrequests/${payment_id}`;
    try {
      const res = await axios.get(fire_url, {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
      return res.data;
    } catch (error) {
      console.log({
        response: error?.response.data.errors,
        error: error?.response?.error,
      });
      return error
    }
  }

  /**
   * @param {*} payment_uuid - Payment UUID
   * @returns
   * @description: Return the payment request status
   **/

  async getPaymentRequestStatus(payment_uuid) {
    if (!this.accessToken) {
      await this.getAccessToken();
    }
    let fire_url =
      this.config.fire_payment_request_url +
      `business/v1/payments/${payment_uuid}`;
    try {
      const res = await axios.get(fire_url, {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
      return res.data;
    } catch (error) {
      console.log({
        response: error?.response.data.errors,
        error: error?.response?.error,
      });
      return error
    }
  }

  //List transactions for an account (v1)
  /**
   *
   * @param {*} account_id  - Account ID of the fire account
   * @returns
   * @description: Return the list of transactions
   */

  async getTransactions(account_id) {
    if (!this.accessToken) {
      await this.getAccessToken();
    }
    let fire_url =
      this.config.fire_payment_request_url +
      `business/v1/accounts/${account_id}/transactions`;
    try {
      const res = await axios.get(fire_url, {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
      return res.data;
    } catch (error) {
      console.log({
        response: error?.response.data.errors,
        error: error?.response?.error,
      });
      return error
    }
  }
}

const getHashedData = (nonce, clientKey) => {
  const dataToHash = nonce + clientKey;
  return crypto.createHash("sha256").update(dataToHash).digest("hex");
};

const checkRequiredFields = (credentials) => {
  if (!credentials.fire_client_id) {
    throw new Error("fire_client_id is required");
  }
  if (!credentials.fire_client_key) {
    throw new Error("fire_client_key is required");
  }
  if (!credentials.fire_refresh_token) {
    throw new Error("fire_refresh_token is required");
  }
  if (!credentials.fire_mode) {
    throw new Error("fire_mode is required");
  }

  return credentials;
};

module.exports = FireAPI;
