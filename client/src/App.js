import React, { useState } from "react";
import { createOrder, fulfillOrder } from "./OrdersApi";

function App() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [voucher, setVoucher] = useState(null);

  const nextStep = () => setStep(step + 1);
  const displayError = (error) => {
    debugger;
    let msg = "Unknown error";
    if (error) {
      if (error.response && error.response.body) {
        error = JSON.parse(error.response.body);
      }

      if (error.message) {
        msg = error.message;
      }
    }
    setError(msg);
  };

  const onCreateSuccess = (order) => {
    setError(null);
    setOrder(order);
    nextStep();
  };

  const onFulfillSuccess = (response) => {
    setError(null);
    nextStep();
    if (response.voucher) {
      setVoucher(response.voucher);
    }
  };

  return (
    <div className="container">
      <h1>Shop Demo</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <CreateOrder
        disabled={step !== 1}
        onSuccess={onCreateSuccess}
        onError={displayError}
      />

      {step >= 2 && (
        <FulfillOrder
          order={order}
          disabled={step !== 2}
          onSuccess={onFulfillSuccess}
          onError={displayError}
        />
      )}

      {step >= 3 && <OrderConfirmation order={order} voucher={voucher} />}
    </div>
  );
}

function CreateOrder({ onSuccess, onError, disabled }) {
  async function onClick() {
    const items = [{ id: "item01", qty: 10 }];
    try {
      const order = await createOrder(items);
      onSuccess(order);
    } catch (err) {
      onError(err);
    }
  }

  return (
    <div className="card mb-4" style={{ width: "18rem" }}>
      <div className="card-body">
        <h5 className="card-title">1st Step</h5>
        <p className="card-text">
          Please select your items
          <br />
          For orders which cost more than 100 EUR you will receive a discount
          voucher of 5 EUR.
        </p>
      </div>
      {/* <ItemsList /> */}
      <div className="card-body">
        <button
          className="btn btn-primary"
          disabled={disabled}
          onClick={onClick}
        >
          Create Order
        </button>
      </div>
    </div>
  );
}

// function ItemsList() {
//   return (
//     <ul className="list-group list-group-flush">
//       <li className="list-group-item">
//         <input type="checkbox" value="item01" />
//         <label className="form-check-label ml-2">Item 01</label>
//       </li>
//     </ul>
//   );
// }

function FulfillOrder({ order, onSuccess, onError, disabled }) {
  async function onClick() {
    try {
      const response = await fulfillOrder(order.orderId);
      onSuccess(response);
    } catch (err) {
      onError(err.message);
    }
  }

  return (
    <div className="card mb-4" style={{ width: "18rem" }}>
      <div className="card-body">
        <h5 className="card-title">2nd Step</h5>
        <p className="card-text">Confirm that you payed for this order</p>
        <button
          className="btn btn-primary"
          disabled={disabled}
          onClick={onClick}
        >
          Order payed
        </button>
      </div>
    </div>
  );
}

function OrderConfirmation({ order, voucher }) {
  return (
    <div className="card mb-4" style={{ width: "18rem" }}>
      <div className="card-body">
        <h5 className="card-title">3rd Step</h5>
        <div className="alert alert-success" role="alert">
          Your order has been completed
        </div>
        <p className="card-text">
          The total cost of the order was: {order.amount}
        </p>
        {voucher && (
          <>
            <p className="card-text">
              You have a discount code of {voucher.discount} EUR in your next
              order:
              <strong>{voucher.code}</strong>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
