const passwordService = require("../services/passwordService");


// FORGOT PASSWORD

const forgotPassword = async (req, res, next) => {
  try {

    const { email } = req.body;

    if (!email) {
      const err = new Error("Email is required");
      err.statusCode = 400;
      throw err;
    }

    const result = await passwordService.forgotPassword(email);

    res.status(200).json(result);

  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};



// RESET PASSWORD PAGE

const resetPasswordPage = async (req, res, next) => {
  try {

    const { id } = req.params;

    const filePath = await passwordService.resetPasswordPage(id);

    res.sendFile(filePath);

  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};



// UPDATE PASSWORD

const updatePassword = async (req, res, next) => {
  try {

    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      const err = new Error("Password is required");
      err.statusCode = 400;
      throw err;
    }

    await passwordService.updatePassword(id, password);

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