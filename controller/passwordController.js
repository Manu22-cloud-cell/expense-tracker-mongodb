const tranEmailApi = require("../utils/email");
const bcrypt = require("bcryptjs");
const ForgotPasswordRequests = require("../models/forgotPasswordReq");
const User = require("../models/users");
const path = require("path");


//FORGOT PASSWORD

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      const err = new Error("Email is required");
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    const request = await ForgotPasswordRequests.create({
      userId: user.id
    });

    const resetLink = `${process.env.API_BASE_URL}/password/resetpassword/${request.id}`;

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

    res.status(200).json({ message: "Reset email sent successfully" });

  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};


//RESET PASSWORD PAGE

const resetPasswordPage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await ForgotPasswordRequests.findOne({
      where: { id, isActive: true }
    });

    if (!request) {
      const err = new Error("Link expired or invalid");
      err.statusCode = 400;
      throw err;
    }

    res.sendFile(
      path.join(__dirname, "../Frontend/password/resetPassword.html")
    );

  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};


//UPDATE PASSWORD

const updatePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      const err = new Error("Password is required");
      err.statusCode = 400;
      throw err;
    }

    const request = await ForgotPasswordRequests.findOne({
      where: { id, isActive: true }
    });

    if (!request) {
      const err = new Error("Invalid or expired link");
      err.statusCode = 400;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.update(
      { password: hashedPassword },
      { where: { id: request.userId } }
    );

    await ForgotPasswordRequests.update(
      { isActive: false },
      { where: { id } }
    );

    res.send("<h3>Password updated successfully. You can login now.</h3>");

  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};

module.exports = {
  forgotPassword,
  resetPasswordPage,
  updatePassword
};

