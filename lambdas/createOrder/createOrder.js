const uuid = require("uuid");

const inventory = {
  item01: { price: 10 },
  item02: { price: 50 },
  item03: { price: 100 },
  item04: { price: 125 },
  item05: { price: 200 },
};

/*
  event: {
    body: "{\"items\":[{\"id\":\"item01\",\"qty\":1}]}"
  }
*/
async function createOrder(dynamoDB, event) {
  try {
    const shoppingCart = JSON.parse(event.body);

    const amount = shoppingCart.items.reduce((total, { id, qty }) => {
      return total + inventory[id].price * qty;
    }, 0);

    const orderId = uuid.v4();

    const request = {
      Item: {
        orderId,
        version: 1,
        status: "CREATED",
        items: JSON.stringify(shoppingCart.items),
      },
      TableName: "shop-demo__order",
    };

    await dynamoDB.put(request).promise();

    console.info(`Created order ${orderId}`);
    return {
      statusCode: 201,
      body: JSON.stringify({
        orderId,
        amount,
      }),
    };
  } catch (err) {
    console.error("Failed to create order", err);
    return {
      statusCode: 500,
      body: "Failed to create order",
    };
  }
}

module.exports = createOrder;
