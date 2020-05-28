import React, { useState } from "react";
import { StepsHeader } from "./StepsHeader";
import { CreateOrder } from "./CreateOrder";
import { FulfillOrder } from "./FulfillOrder";
import { Confirmation } from "./Confirmation";
import { LoadingIndicator } from "./LoadingIndicator";

function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
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

  const onReset = () => {
    setError(null);
    setOrder(null);
    setVoucher(null);
    setStep(1);
  };

  return (
    <div className="container">
      <h1 className="my-4">Shop Demo 1,2,3</h1>
      <div className="card">
        <div className="card-header">
          <StepsHeader activeStep={step} />
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {step === 1 && (
          <CreateOrder
            disabled={step !== 1}
            onLoading={setLoading}
            onSuccess={onCreateSuccess}
            onError={displayError}
          />
        )}

        {step === 2 && (
          <FulfillOrder
            order={order}
            disabled={step !== 2}
            onLoading={setLoading}
            onSuccess={onFulfillSuccess}
            onError={displayError}
          />
        )}

        {step === 3 && (
          <Confirmation order={order} voucher={voucher} onClick={onReset} />
        )}
      </div>
      {loading && <LoadingIndicator />}
    </div>
  );
}

export default App;
