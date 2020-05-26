const fnSuccessReq = (resp) =>
  jest.fn(() => ({
    promise: () =>
      new Promise((resolve) => setTimeout(() => resolve(resp), 100)),
  }));

const fnErrorReq = (err) =>
  jest.fn(() => ({
    promise: () =>
      new Promise((_, reject) => setTimeout(() => reject(err), 100)),
  }));

beforeEach(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
  console.info = jest.fn();
  console.log = jest.fn();
});

afterEach(() => {
  console.error.mockRestore();
  console.warn.mockRestore();
  console.info.mockRestore();
  console.log.mockRestore();
});

module.exports = {
  fnSuccessReq,
  fnErrorReq,
};
