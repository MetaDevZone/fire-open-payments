async function checkRequiredParams(requiredParams, params) {
  let all_ok = true;
  let missing_params = [];

  for (let param of requiredParams) {
    if (!params[param]) {
      all_ok = false;
      missing_params.push(param);
    }
  }

  return {
    status: all_ok,
    missing_params,
  };
}

module.exports = {
  checkRequiredParams,
};
