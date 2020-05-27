async function createVoucher(lambda, order) {
  try {
    const params = {
      FunctionName: "shopDemo_createVoucher",
      Payload: JSON.stringify({
        orderId: order.orderId,
        amount: order.amount,
      }),
    };
    const response = await lambda.invoke(params).promise();

    if (response.statusCode === 201) {
      return JSON.parse(response.body);
    }
  } catch (err) {
    console.error(`Failed to create voucher for ${order.orderId}`);
  }

  return null;
}
module.exports = createVoucher;
