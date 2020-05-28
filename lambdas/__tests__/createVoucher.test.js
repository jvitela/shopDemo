const createVoucher = require("../createVoucher/createVoucher");
const { fnSuccessReq, fnErrorReq } = require("../TestUtils");

describe("createVoucher", () => {
  test("Returns statusCode 201 on success", async () => {
    const event = {
      body: JSON.stringify({
        amount: 10,
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
      discount: 10,
    });
    expect(dynamoDB.put).toHaveBeenCalledTimes(1);
  });

  test("Returns statusCode 500 on error", async () => {
    const event = {
      body: JSON.stringify({
        amount: 20,
      }),
    };
    const dynamoDB = {
      put: fnErrorReq(new Error("Internal")),
    };
    const response = await createVoucher(dynamoDB, event);
    expect(response).toMatchObject({
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to create voucher" }),
    });
    expect(dynamoDB.put).toHaveBeenCalledTimes(1);
  });
});
