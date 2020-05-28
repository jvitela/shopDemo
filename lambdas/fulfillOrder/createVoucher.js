async function createVoucher(lambda, order) {
  if (order.amount <= 100) {
    console.info(`Order ${order.orderId} does not qualify for voucher`);
    return null;
  }

  try {
    const params = {
      FunctionName: "shopDemo_createVoucher",
      Payload: JSON.stringify({
        body: JSON.stringify({
          amount: 5,
        }),
      }),
    };
    const response = await lambda.invoke(params).promise();
    console.info(
      "Received response from Lambda shopDemo_createVoucher",
      response
    );

    const payload = JSON.parse(response.Payload);
    return JSON.parse(payload.body);
  } catch (err) {
    console.error(`Failed to create voucher for ${order.orderId}`, err);
  }

  return null;
}
module.exports = createVoucher;
