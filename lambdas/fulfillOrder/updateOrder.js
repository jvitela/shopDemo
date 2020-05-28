const getOrder = require("./getOrder");

async function updateOrder(dynamoDB, orderId, numRetries = 3) {
  let canRetry = numRetries > 1;
  try {
    let order = await getOrder(dynamoDB, orderId);
    if (!order) {
      canRetry = false;
      throw new Error("Order not found");
    }

    // Abort if the order is already being processed or completed.
    if (order.status !== "CREATED") {
      canRetry = false;
      throw new Error(`Order has wrong status "${order.status}"`);
    }

    const request = {
      TableName: "shop-demo__order",
      Key: { orderId },
      UpdateExpression: "SET #status = :P, version = version + :i",
      ConditionExpression: "version = :v AND #status = :C",
      ExpressionAttributeValues: {
        ":v": order.version,
        ":i": 1,
        ":C": "CREATED",
        ":P": "FULFILLED",
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ReturnValues: "ALL_NEW",
    };

    const response = await dynamoDB.update(request).promise();
    order = response.Attributes;
    console.info(`Updated order ${order.orderId} to version ${order.version}`);
    canRetry = false;
    return order;
  } catch (err) {
    if (canRetry) {
      const result = await updateOrder(dynamoDB, orderId, numRetries - 1);
      return result;
    } else {
      throw err;
    }
  }
}

module.exports = updateOrder;
