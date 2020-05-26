const AWS = require("aws-sdk");
const createVoucher = require("./createVoucher");

AWS.config.update({ region: process.env.AWS_REGION });
const dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

exports.handler = async function handler(event) {
  return await createVoucher(dynamoDB, event);
};
