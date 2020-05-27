async function createVoucher(lambda, order) {
  try {
    const params = {
      FunctionName: "shopDemo_createVoucher",
      Payload: JSON.stringify({
        body: JSON.stringify({
          orderId: order.orderId,
          amount: order.amount,
        }),
      }),
    };
    const response = await lambda.invoke(params).promise();
    console.info(
      "Received response from Lambda shopDemo_createVoucher",
      response
    );

    const result = JSON.parse(response.Payload);
    if (result && result.statusCode === 201) {
      return JSON.parse(result.body);
    } else {
      console.info("Order not qualified for voucher", response);
    }
  } catch (err) {
    console.error(`Failed to create voucher for ${order.orderId}`, err);
  }

  return null;
}
module.exports = createVoucher;
