const fulfillOrder = require("../fulfillOrder/fulfillOrder");
const {
  fnSuccess,
  fnError,
  fnSuccessReq,
  fnErrorReq,
} = require("../TestUtils");

describe("fulfillOrder", () => {
  test("Returns statusCode 200 on success", async () => {
    const event = {
      body: JSON.stringify({
        orderId: "123",
      }),
    };
    const lambda = {
      invoke: fnSuccessReq({
        statusCode: 201,
        body: JSON.stringify({
          code: "abc",
          discount: 5,
        }),
      }),
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          orderId: "123",
          version: 1,
          status: "CREATED",
          amount: 200,
        },
      }),
      update: fnSuccessReq({
        Item: {
          orderId: "123",
          version: 2,
          status: "PROCESSING",
          amount: 200,
        },
      }),
    };
    const response = await fulfillOrder(dynamoDB, lambda, event);

    expect(response).toMatchObject({
      statusCode: 200,
      body: expect.any(String),
    });
    expect(JSON.parse(response.body)).toMatchObject({
      voucher: expect.objectContaining({
        code: expect.any(String),
        discount: expect.any(Number),
      }),
    });
    expect(dynamoDB.get).toHaveBeenCalledTimes(1);
    expect(dynamoDB.update).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalled();
  });

  test("Returns statusCode 200 on success without voucher", async () => {
    const event = {
      body: JSON.stringify({
        orderId: "123",
      }),
    };
    const lambda = {
      invoke: fnSuccessReq({
        statusCode: 204,
      }),
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          orderId: "123",
          version: 1,
          status: "CREATED",
          amount: 200,
        },
      }),
      update: fnSuccessReq({
        Item: {
          orderId: "123",
          version: 2,
          status: "PROCESSING",
          amount: 200,
        },
      }),
    };
    const response = await fulfillOrder(dynamoDB, lambda, event);

    expect(response).toMatchObject({
      statusCode: 200,
      body: expect.any(String),
    });
    expect(JSON.parse(response.body)).toMatchObject({
      voucher: null,
    });
    expect(dynamoDB.get).toHaveBeenCalledTimes(1);
    expect(dynamoDB.update).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalled();
  });

  test("Retries to update the order", async () => {
    const event = {
      body: JSON.stringify({
        orderId: "123",
      }),
    };
    const lambda = {
      invoke: fnSuccessReq({
        statusCode: 204,
      }),
    };
    let count = 0;
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          orderId: "123",
          version: 1,
          status: "CREATED",
          amount: 200,
        },
      }),

      update: jest.fn(() => ({
        promise: () =>
          new Promise((resolve, reject) =>
            setTimeout(() => {
              if (count++ === 0) {
                // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html
                reject(new Error("The conditional request failed."));
              }
              resolve({
                Item: {
                  orderId: "123",
                  version: 1,
                  status: "CREATED",
                  amount: 200,
                },
              });
            }, 100)
          ),
      })),
    };
    const response = await fulfillOrder(dynamoDB, lambda, event);

    expect(response).toMatchObject({
      statusCode: 200,
      body: expect.any(String),
    });
    expect(dynamoDB.get).toHaveBeenCalledTimes(2);
    expect(dynamoDB.update).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalled();
    expect(console.info).toHaveBeenCalled();
  });

  test("Retry up to 3 times if update fails", async () => {
    const event = {
      body: JSON.stringify({
        orderId: "123",
      }),
    };
    const lambda = {
      invoke: fnSuccessReq({
        statusCode: 204,
      }),
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          orderId: "123",
          version: 1,
          status: "CREATED",
          amount: 200,
        },
      }),
      update: fnErrorReq(),
    };
    const response = await fulfillOrder(dynamoDB, lambda, event);

    expect(response).toMatchObject({
      statusCode: 500,
      body: expect.any(String),
    });
    expect(dynamoDB.get).toHaveBeenCalledTimes(3);
    expect(dynamoDB.update).toHaveBeenCalledTimes(3);
    expect(console.error).toHaveBeenCalled();
  });

  test("Returns statusCode 500 if order is not in status CREATED", async () => {
    const event = {
      body: JSON.stringify({
        orderId: "123",
      }),
    };
    const paymentApi = {
      isPaymentCompleted: fnSuccess(false),
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          orderId: "123",
          version: 1,
          status: "COMPLETED",
          amount: 200,
        },
      }),
    };
    const response = await fulfillOrder(dynamoDB, null, paymentApi, event);
    expect(response).toMatchObject({
      statusCode: 500,
      body: "Failed to create voucher",
    });
    expect(console.error).toHaveBeenCalled();
  });

  test("Returns statusCode 500 when order doesn't exists", async () => {
    const event = {
      body: JSON.stringify({
        orderId: "123",
      }),
    };
    const paymentApi = {
      isPaymentCompleted: fnSuccess(false),
    };
    const dynamoDB = {
      get: fnErrorReq(new Error("Not found")),
    };
    const response = await fulfillOrder(dynamoDB, null, paymentApi, event);
    expect(response).toMatchObject({
      statusCode: 500,
      body: "Failed to create voucher",
    });
    expect(console.error).toHaveBeenCalled();
  });
});
