/*
  event: {
    body: "{\"orderId\":\"123-abcd\", \"amount\":200}"
  }
*/
async function createVoucher(dynamoDB, event) {
  try {
    const payload = JSON.parse(event.body);

    if (payload.amount <= 100) {
      console.info(`Order ${payload.orderId} not qualify for voucher`);
      return { statusCode: 204 };
    }

    const voucher = {
      voucherId: payload.orderId,
      discount: 5,
      status: "READY",
    };

    const request = {
      Item: voucher,
      TableName: "shop-demo__voucher",
    };

    await dynamoDB.put(request).promise();

    console.info(`Created 5 EUR voucher for order ${payload.orderId}`);
    return {
      statusCode: 201,
      body: JSON.stringify(voucher),
    };
  } catch (err) {
    console.error("Failed to create voucher", err);
    return {
      statusCode: 500,
      body: "Failed to create voucher",
    };
  }
}

module.exports = createVoucher;
