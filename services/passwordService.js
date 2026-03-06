const bcrypt = require("bcryptjs");
const path = require("path");

const passwordRepo = require("../repositories/passwordRepository");
const userRepo = require("../repositories/userRepository");

const tranEmailApi = require("../utils/email");


// FORGOT PASSWORD

const forgotPassword = async (email) => {

  const user = await userRepo.findUserByEmail(email);

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const request = await passwordRepo.createResetRequest({
    userId: user._id
  });

  const resetLink =
    `${process.env.API_BASE_URL}/password/resetpassword/${request._id}`;

  await tranEmailApi.sendTransacEmail({
    sender: {
      email: process.env.EMAIL_SENDER,
      name: "Expense Tracker"
    },
    to: [{ email }],
    subject: "Reset your password",
    htmlContent: `
      <h3>Password Reset</h3>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
    `
  });

  return { message: "Reset email sent successfully" };
};



// RESET PASSWORD PAGE

const resetPasswordPage = async (id) => {

  const request = await passwordRepo.findActiveRequest(id);

  if (!request) {
    const err = new Error("Link expired or invalid");
    err.statusCode = 400;
    throw err;
  }

  return path.join(__dirname, "../Frontend/password/resetPassword.html");
};



// UPDATE PASSWORD

const updatePassword = async (id, password) => {

  const request = await passwordRepo.findActiveRequest(id);

  if (!request) {
    const err = new Error("Invalid or expired link");
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userRepo.findUserById(request.userId);

  user.password = hashedPassword;

  await user.save();

  await passwordRepo.deactivateRequest(id);

  return true;
};


module.exports = {
  forgotPassword,
  resetPasswordPage,
  updatePassword
};