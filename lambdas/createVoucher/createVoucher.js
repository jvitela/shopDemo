/*
  event: {
    body: "{\"orderId\":\"123-abcd\", \"amount\":200}"
  }
*/
async function createVoucher(dynamoDB, event) {
  try {
    console.info("Received event", event);
    const payload = JSON.parse(event.body);

    if (payload.amount <= 100) {
      console.info(`Order ${payload.orderId} not qualify for voucher`);
      return { statusCode: 204 };
    }

    const voucher = {
      voucherId: payload.orderId,
      code: "5_EUR_DISCOUNT",
      discount: 5,
      status: "READY",
    };

    const request = {
      Item: voucher,
      TableName: "shop-demo__voucher",
      ConditionExpression: "attribute_not_exists(voucherId)",
    };

    await dynamoDB.put(request).promise();

    console.info(`Created 5 EUR voucher for order ${payload.orderId}`);
    return {
      statusCode: 201,
      body: JSON.stringify({
        code: voucher.code,
        discount: voucher.discount,
      }),
    };
  } catch (err) {
    console.error("Failed to create voucher", err, event);
    return {
      statusCode: 500,
      body: "Failed to create voucher",
    };
  }
}

module.exports = createVoucher;
