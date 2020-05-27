const createVoucher = require("../createVoucher/createVoucher");
const { fnSuccessReq, fnErrorReq } = require("../TestUtils");

describe("createVoucher", () => {
  test("Returns statusCode 201 on success", async () => {
    const event = {
      body: JSON.stringify({
        orderId: "123",
        amount: 200,
      }),
    };
    const dynamoDB = {
      put: fnSuccessReq(),
    };
    const response = await createVoucher(dynamoDB, event);
    expect(response).toMatchObject({
      statusCode: 201,
      body: expect.any(String),
    });
    expect(JSON.parse(response.body)).toMatchObject({
      code: expect.any(String),
      discount: expect.any(Number),
    });
    expect(dynamoDB.put).toHaveBeenCalledTimes(1);
  });

  test("Returns statusCode 204 if order does not qualify", async () => {
    const event = {
      body: JSON.stringify({
        orderId: "321",
        amount: 20,
      }),
    };
    const dynamoDB = {
      put: fnErrorReq(),
    };
    const response = await createVoucher(dynamoDB, event);
    expect(response).toMatchObject({
      statusCode: 204,
    });
    expect(response.body).toBeUndefined();
    expect(dynamoDB.put).not.toHaveBeenCalled();
  });

  test("Returns statusCode 500 on error", async () => {
    const event = {
      body: JSON.stringify({
        orderId: "123",
        amount: 200,
      }),
    };
    const dynamoDB = {
      put: fnErrorReq(new Error("Internal")),
    };
    const response = await createVoucher(dynamoDB, event);
    expect(response).toMatchObject({
      statusCode: 500,
      body: "Failed to create voucher",
    });
    expect(dynamoDB.put).toHaveBeenCalledTimes(1);
  });
});
