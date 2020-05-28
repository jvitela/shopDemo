import React from "react";

export function LoadingIndicator({ show }) {
  return (
    <>
      <div
        className="modal fade show d-block"
        tabindex="-1"
        role="dialog"
        aria-hidden={show ? "false" : "true"}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-body text-center">
            <span className="badge badge-light p-3">Loading...</span>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show"></div>
    </>
  );
}
