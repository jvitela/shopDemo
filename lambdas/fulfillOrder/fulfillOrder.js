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
    console.error("Failed to create voucher", err);
    return {
      statusCode: 500,
      body: "Failed to create voucher",
    };
  }
}

async function getOrder(dynamoDB, orderId) {
  const params = {
    Key: { orderId },
    TableName: "shop-demo__orders",
  };

  // If there is no matching item, getItem does not return any data and
  //  there will be no Item element in the response.
  const resp = await dynamoDB.get(params).promise();
  return resp.Item;
}

async function updateOrder(dynamoDB, orderId, retries = 3) {
  while (retries >= 0) {
    try {
      const { version, status } = await getOrder(dynamoDB, orderId);

      // Abort if the order is already being processed or completed.
      if (status !== "CREATED") {
        retries = 0;
        throw new Error("Order has wrong status");
      }

      const request = {
        TableName: "shop-demo__order",
        Key: { orderId },
        UpdateExpression: "SET status = :s, version = :v + 1",
        ConditionExpression: "version = :v AND status = :C",
        ExpressionAttributeValues: {
          ":v": version,
          ":C": "CREATED",
          ":s": "PROCESSING",
        },
      };

      const response = await dynamoDB.update(request).promise();
      const order = response.Item;
      console.info(
        `Updated order ${order.orderId} to version ${order.version}`
      );
      return order;
    } catch (err) {
      console.error(`Failed to update order ${orderId}`, err);
      if (--retries < 1) {
        throw err;
      }
    }
  }
}

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
    console.error(`Failed to create voucher for ${orderId}`);
  }

  return null;
}

module.exports = fulfillOrder;
