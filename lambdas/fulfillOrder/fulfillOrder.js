const createVoucher = require("./createVoucher");
const updateOrder = require("./updateOrder");
/*
  event: {
    body: "{ \"orderId\":\"o123\" }"
  }
*/
async function fulfillOrder(dynamoDB, lambda, event) {
  try {
    const request = JSON.parse(event.body);
    const order = await updateOrder(dynamoDB, request.orderId);
    const voucher = await createVoucher(lambda, order);
    return {
      statusCode: 200,
      body: JSON.stringify({ voucher }),
    };
  } catch (err) {
    console.error("Failed to fulfill order", err);
    return {
      statusCode: 500,
      body: "Failed to fulfill order",
    };
  }
}

module.exports = fulfillOrder;
