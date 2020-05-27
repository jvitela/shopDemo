async function getOrder(dynamoDB, orderId) {
  const params = {
    Key: { orderId },
    TableName: "shop-demo__order",
  };

  // If there is no matching item, getItem does not return any data and
  //  there will be no Item element in the response.
  const resp = await dynamoDB.get(params).promise();
  return resp.Item;
}
module.exports = getOrder;
