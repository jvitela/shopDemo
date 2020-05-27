import React from "react";
import ky from "ky";
import logo from "./logo.svg";
import "./App.css";

const api = ky.create({
  prefixUrl: "https://r0ah3egg0d.execute-api.eu-central-1.amazonaws.com/dev",
});

async function createOrder() {
  const json = {
    items: [{ id: "item01", qty: 10 }],
  };
  try {
    const order = await api.post("order", { json }).json();
    console.info(order);
    return order;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function fulfillOrder(orderId) {
  const json = { orderId };
  try {
    const response = await api.put("order", { json }).json();
    console.info(response);
    return response.voucher;
  } catch (err) {
    console.error(err);
    return null;
  }
}

function App() {
  async function onClick() {
    const order = await createOrder();
    if (order) {
      await fulfillOrder(order.orderId);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <div>
        Create order:
        <button onClick={onClick}>Create</button>
      </div>
    </div>
  );
}

export default App;
