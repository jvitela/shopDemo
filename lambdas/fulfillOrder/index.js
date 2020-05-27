const AWS = require("aws-sdk");
const fulfillOrder = require("./fulfillOrder");

AWS.config.update({ region: process.env.AWS_REGION });
const dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });
const lambda = new AWS.Lambda();

exports.handler = async function handler(event) {
  return await fulfillOrder(dynamoDB, lambda, event);
};
