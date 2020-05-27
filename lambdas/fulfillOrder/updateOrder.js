const getOrder = require("./getOrder");

async function updateOrder(dynamoDB, orderId) {
  let retries = 3;
  let lastError = new Error("???");
  while (retries-- > 0) {
    try {
      let order = await getOrder(dynamoDB, orderId);
      if (!order) {
        retries = 0;
        throw new Error("Order not found");
      }

      // Abort if the order is already being processed or completed.
      if (order.status !== "CREATED") {
        retries = 0;
        throw new Error("Order has wrong status");
      }

      const request = {
        TableName: "shop-demo__order",
        Key: { orderId },
        UpdateExpression: "SET status = :s, version = :v + 1",
        ConditionExpression: "version = :v AND status = :C",
        ExpressionAttributeValues: {
          ":v": order.version,
          ":C": "CREATED",
          ":s": "PROCESSING",
        },
      };

      const response = await dynamoDB.update(request).promise();
      order = response.Item;
      console.info(
        `Updated order ${order.orderId} to version ${order.version}`
      );
      return order;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

module.exports = updateOrder;
