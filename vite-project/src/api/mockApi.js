export const simulateApiCall = (errorCodeToSimulate = null) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (errorCodeToSimulate) {
        reject({
          response: {
            status: 400,
            data: {
              success: false,
              errorCode: errorCodeToSimulate,
            },
          },
        });
      } else {
        resolve({ data: 'Success! Data loaded.' });
      }
    }, 800);
  });
};
