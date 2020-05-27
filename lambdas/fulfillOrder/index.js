const AWS = require("aws-sdk");
const fulfillOrder = require("./fulfillOrder");

AWS.config.update({ region: process.env.AWS_REGION });
const dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });
const lambda = new AWS.Lambda();

exports.handler = async function handler(event) {
  const response = await fulfillOrder(dynamoDB, lambda, event);
  response.headers = {
    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
    "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
  };
  return response;
};
