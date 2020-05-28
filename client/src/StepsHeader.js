import React from "react";

export function StepsHeader({ activeStep }) {
  const badge = (step) =>
    activeStep === step ? "badge-primary" : "badge-light";
  return (
    <ul className="nav nav-pills card-header-pills">
      <li className="nav-item">
        <span className={`badge badge-pill ${badge(1)} px-4 py-2`}>Select</span>
      </li>
      <li className="nav-item">
        <span className={`badge badge-pill ${badge(2)} ml-4 px-4 py-2`}>
          Confirm
        </span>
      </li>
      <li className="nav-item">
        <span className={`badge badge-pill ${badge(3)} ml-4 px-4 py-2`}>
          Review
        </span>
      </li>
    </ul>
  );
}
