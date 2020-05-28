const fulfillOrder = require("../fulfillOrder/fulfillOrder");
const { fnSuccessReq, fnErrorReq } = require("../TestUtils");

describe("fulfillOrder", () => {
  test("Returns statusCode 200 on success", async () => {
    const event = {
      body: JSON.stringify({
        orderId: "123",
      }),
    };
    const lambda = {
      invoke: fnSuccessReq({
        Payload: JSON.stringify({
          statusCode: 201,
          body: JSON.stringify({
            code: "abc",
            discount: 5,
          }),
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
        Attributes: {
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
      invoke: fnErrorReq(),
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          orderId: "123",
          version: 1,
          status: "CREATED",
          amount: 80,
        },
      }),
      update: fnSuccessReq({
        Attributes: {
          orderId: "123",
          version: 2,
          status: "PROCESSING",
          amount: 80,
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
    expect(lambda.invoke).not.toHaveBeenCalled();
    expect(console.info).toHaveBeenCalled();
  });

  test("Retries to update the order", async () => {
    const event = {
      body: JSON.stringify({
        orderId: "123",
      }),
    };
    let count = 0;
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          orderId: "123",
          version: 1,
          status: "CREATED",
          amount: 50,
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
                Attributes: {
                  orderId: "123",
                  version: 2,
                  status: "CREATED",
                  amount: 50,
                },
              });
            }, 100)
          ),
      })),
    };
    const response = await fulfillOrder(dynamoDB, null, event);

    expect(response).toMatchObject({
      statusCode: 200,
      body: expect.any(String),
    });
    expect(dynamoDB.get).toHaveBeenCalledTimes(2);
    expect(dynamoDB.update).toHaveBeenCalledTimes(2);
    expect(console.error).not.toBeCalled();
    expect(console.info).toHaveBeenCalled();
  });

  test("Retry up to 3 times if update fails", async () => {
    const event = {
      body: JSON.stringify({
        orderId: "123",
      }),
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          orderId: "123",
          version: 1,
          status: "CREATED",
          amount: 20,
        },
      }),
      update: fnErrorReq(),
    };
    const response = await fulfillOrder(dynamoDB, null, event);

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
    const response = await fulfillOrder(dynamoDB, null, event);
    expect(response).toMatchObject({
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fulfill order" }),
    });
    expect(console.error).toHaveBeenCalled();
  });

  test("Returns statusCode 500 when order doesn't exists", async () => {
    const event = {
      body: JSON.stringify({
        orderId: "123",
      }),
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: undefined,
      }),
    };
    const response = await fulfillOrder(dynamoDB, null, event);
    expect(response).toMatchObject({
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fulfill order" }),
    });
    expect(console.error).toHaveBeenCalled();
    expect(console.error.mock.calls[0][0]).toEqual("Failed to fulfill order");
    expect(console.error.mock.calls[0][1]).toMatchObject({
      message: "Order not found",
    });
  });

  test("Returns statusCode 500 when fails to read order", async () => {
    const event = {
      body: JSON.stringify({
        orderId: "123",
      }),
    };
    const error = new Error("Internal");
    const dynamoDB = {
      get: fnErrorReq(error),
    };
    const response = await fulfillOrder(dynamoDB, null, event);
    expect(response).toMatchObject({
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fulfill order" }),
    });
    expect(console.error).lastCalledWith("Failed to fulfill order", error);
  });
});
