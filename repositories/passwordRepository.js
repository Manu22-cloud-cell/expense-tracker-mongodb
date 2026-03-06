const ForgotPasswordRequests = require("../models/forgotPasswordReq");

const createResetRequest = (data) => {
  const request = new ForgotPasswordRequests(data);
  return request.save();
};

const findActiveRequest = (id) => {
  return ForgotPasswordRequests.findOne({ _id: id, isActive: true });
};

const deactivateRequest = (id) => {
  return ForgotPasswordRequests.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
};

module.exports = {
  createResetRequest,
  findActiveRequest,
  deactivateRequest
};