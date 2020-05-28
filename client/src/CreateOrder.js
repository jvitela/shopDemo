import React, { useState } from "react";
import { createOrder } from "./OrdersApi";

export function CreateOrder({ onLoading, onSuccess, onError, disabled }) {
  const [items, setItems] = useState([]);

  async function onClick() {
    onLoading(true);
    try {
      const request = items.map((item) => ({
        id: item.id,
        qty: 1,
      }));

      const order = await createOrder(request);
      onSuccess({
        ...order,
        items,
      });
    } catch (err) {
      onError(err);
    } finally {
      onLoading(false);
    }
  }

  const onItemChange = (item, selected) => {
    if (selected) {
      setItems([...items, item]);
    } else {
      setItems(items.filter((itm) => itm.id !== item.id));
    }
  };

  const total = items.reduce((total, item) => total + item.price, 0);
  return (
    <>
      <div className="card-body">
        <h5 className="card-title">Select your items</h5>
        <p className="card-text">
          For orders which cost more than 100 EUR <br />
          you will receive a discount voucher for 5 EUR.
        </p>
      </div>
      <ItemsList selected={items} onChange={onItemChange} />
      <div className="card-body">
        <p className="card-text">Total: {total} EUR</p>
        <button
          className="btn btn-primary"
          disabled={disabled || total <= 0}
          onClick={onClick}
        >
          Continue
        </button>
      </div>
    </>
  );
}

const availableItems = [
  { id: "item01", desc: "Item 01", price: 10 },
  { id: "item02", desc: "Item 02", price: 50 },
  { id: "item03", desc: "Item 03", price: 100 },
  { id: "item04", desc: "Item 04", price: 125 },
  { id: "item05", desc: "Item 05", price: 200 },
];

function ItemsList({ selected, onChange }) {
  const selectedIds = selected.map((itm) => itm.id);
  return (
    <ul className="list-group list-group-flush">
      {availableItems.map((item) => (
        <Item
          key={item.id}
          item={item}
          selected={selectedIds.includes(item.id)}
          onChange={onChange}
        />
      ))}
    </ul>
  );
}

function Item({ item, selected, onChange }) {
  return (
    <li className="list-group-item">
      <input
        id={item.id}
        type="checkbox"
        value={item.id}
        onChange={() => onChange(item, !selected)}
      />
      <label
        htmlFor={item.id}
        className="form-check-label ml-2"
        checked={selected}
      >
        {item.desc} <small>({item.price} EUR)</small>
      </label>
    </li>
  );
}
