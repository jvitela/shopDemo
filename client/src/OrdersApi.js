import ky from "ky";

const httpClient = ky.create({
  prefixUrl: "https://r0ah3egg0d.execute-api.eu-central-1.amazonaws.com/dev",
});

export async function createOrder(items) {
  const json = { items };
  const order = await httpClient.post("order", { json }).json();
  return order;
}

export async function fulfillOrder(orderId) {
  const json = { orderId };
  const response = await httpClient.put("order", { json }).json();
  return response;
}
