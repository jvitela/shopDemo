const createOrder = require("../createOrder/createOrder");
const { fnSuccessReq, fnErrorReq } = require("../TestUtils");

describe("createOrder", () => {
  test("Returns statusCode 201 on success", async () => {
    const event = {
      body: JSON.stringify({
        items: [{ id: "item01", qty: 5 }],
      }),
    };
    const dynamoDB = {
      put: fnSuccessReq(),
    };
    const response = await createOrder(dynamoDB, event);
    expect(response).toMatchObject({
      statusCode: 201,
      body: expect.any(String),
    });
    expect(JSON.parse(response.body)).toMatchObject({
      orderId: expect.any(String),
      amount: expect.any(Number),
    });
    expect(dynamoDB.put).toHaveBeenCalledTimes(1);
  });

  test("Returns statusCode 500 on error", async () => {
    const event = {
      body: JSON.stringify({
        items: [{ id: "item01", qty: 5 }],
      }),
    };
    const dynamoDB = {
      put: fnErrorReq(new Error("Internal")),
    };
    const response = await createOrder(dynamoDB, event);
    expect(response).toMatchObject({
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to create order" }),
    });
    expect(dynamoDB.put).toHaveBeenCalledTimes(1);
  });
});
