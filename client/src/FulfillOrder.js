import React from "react";
import { fulfillOrder } from "./OrdersApi";

export function FulfillOrder({
  order,
  onLoading,
  onSuccess,
  onError,
  disabled,
}) {
  async function onClick() {
    onLoading(true);
    try {
      const response = await fulfillOrder(order.orderId);
      onSuccess(response);
    } catch (err) {
      onError(err.message);
    } finally {
      onLoading(false);
    }
  }

  return (
    <>
      <div className="card-body">
        <h5 className="card-title">Confirm your order</h5>
        <p className="card-text">
          Please verify your selection
          <br />
        </p>
        <strong>
          Order <small>({order.orderId})</small>
        </strong>
      </div>
      <ItemsList items={order.items} />
      <div className="card-body">
        <p className="card-text">Total: {order.amount} EUR</p>
        <button
          className="btn btn-primary"
          disabled={disabled}
          onClick={onClick}
        >
          Finish
        </button>
      </div>
    </>
  );
}

function ItemsList({ items }) {
  return (
    <ul className="list-group list-group-flush">
      {items.map((item) => (
        <li className="list-group-item">
          {item.desc} <small>({item.price} EUR)</small>
        </li>
      ))}
    </ul>
  );
}
