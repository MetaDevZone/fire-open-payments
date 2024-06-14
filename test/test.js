// test/fireApi.test.js

const { describe, it, before } = require("mocha");
const nock = require("nock");
const FireAPI = require("../src/config");

const config = {
  fire_client_id: "test_client_id",
  fire_client_key: "test_client_key",
  fire_refresh_token: "test_refresh_token",
  fire_mode: "test",
};

describe("FireAPI", () => {
  let fireAPI;

  before(async () => {
    ({ expect } = await import("chai"));
    fireAPI = new FireAPI(config);
  });

  console.log(fireAPI);

  describe("getAccessToken", () => {
    it("should generate an access token", async () => {
      nock(config.fire_payment_request_url)
        .post("/business/v1/apps/accesstokens")
        .reply(200, {
          accessToken: "test_access_token",
        });

      const accessToken = await fireAPI.getAccessToken();
      expect(accessToken).to.equal("test_access_token");
    });
  });

  describe("createPaymentRequest", () => {
    it("should create a payment request and return the payment URL", async () => {
      nock(config.fire_payment_request_url)
        .post("/business/v1/paymentrequests")
        .reply(200, {
          code: "test_payment_code",
        });

      const paymentRequestURL = await fireAPI.createPaymentRequest(
        "Test Payment",
        100.0,
        "Test Details",
        "EUR",
        "https://return.url",
        "test_account_no",
        "test_reference"
      );

      expect(paymentRequestURL).to.equal(
        config.fire_redirect_url + "test_payment_code"
      );
    });
  });

  describe("getPaymentRequest", () => {
    it("should retrieve the payment request details", async () => {
      const paymentId = "test_payment_id";

      nock(config.fire_payment_request_url)
        .get(`/business/v1/paymentrequests/${paymentId}`)
        .reply(200, {
          id: paymentId,
          status: "PENDING",
        });

      const paymentRequest = await fireAPI.getPaymentRequest(paymentId);
      expect(paymentRequest.id).to.equal(paymentId);
      expect(paymentRequest.status).to.equal("PENDING");
    });
  });

  describe("getPaymentRequestStatus", () => {
    it("should retrieve the payment status", async () => {
      const paymentUuid = "test_payment_uuid";

      nock(config.fire_payment_request_url)
        .get(`/business/v1/payments/${paymentUuid}`)
        .reply(200, {
          uuid: paymentUuid,
          status: "SETTLED",
        });

      const paymentStatus = await fireAPI.getPaymentRequestStatus(paymentUuid);
      expect(paymentStatus.uuid).to.equal(paymentUuid);
      expect(paymentStatus.status).to.equal("SETTLED");
    });
  });

  describe("getTransactions", () => {
    it("should retrieve transactions for an account", async () => {
      const accountId = "test_account_id";

      nock(config.fire_payment_request_url)
        .get(`/business/v1/accounts/${accountId}/transactions`)
        .reply(200, {
          transactions: [],
        });

      const transactions = await fireAPI.getTransactions(accountId);
      expect(transactions.transactions).to.be.an("array");
    });
  });
});
