import React from "react";
export function Confirmation({ order, voucher, onClick }) {
  return (
    <div className="card-body">
      <h5 className="card-title">Your order is complete</h5>
      <p className="card-text">
        Thank you for your purchase.
        <br />
        Order number: {order.orderId}
        <br />
        Total amount: {order.amount} EUR
        <br />
      </p>
      {voucher && (
        <div className="alert alert-success mx-2" role="alert">
          With the code below you will get a discount of {voucher.discount} EUR
          in your next order.
          <br />
          Code: <strong>{voucher.code}</strong>
        </div>
      )}
      <button className="btn btn-primary mt-2" onClick={onClick}>
        Start again
      </button>
    </div>
  );
}
