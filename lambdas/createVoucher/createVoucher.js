const shortid = require("shortid");

/*
  event: {
    body: "{\"amount\":200}"
  }
*/
async function createVoucher(dynamoDB, event) {
  try {
    console.info("Received event", event);
    const request = JSON.parse(event.body);

    const voucher = {
      voucherId: shortid.generate(),
      discount: request.amount,
      status: "READY",
    };

    const req = {
      Item: voucher,
      TableName: "shop-demo__voucher",
      ConditionExpression: "attribute_not_exists(voucherId)",
    };

    await dynamoDB.put(req).promise();

    console.info(
      `Created ${voucher.discount} EUR voucher ${voucher.voucherId}`
    );
    return {
      statusCode: 201,
      body: JSON.stringify({
        code: voucher.voucherId,
        discount: voucher.discount,
      }),
    };
  } catch (err) {
    console.error("Failed to create voucher", err, event);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to create voucher" }),
    };
  }
}

module.exports = createVoucher;
