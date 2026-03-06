const User = require('./users');
const Expenses = require('./expenses');
const Payment = require('./payment');
const ForgotPasswordRequests = require('./forgotPasswordReq');
const DownloadedReport=require("./downloadedReport");


User.hasMany(Expenses, { foreignKey: "userId" });
Expenses.belongsTo(User, { foreignKey: "userId" });


User.hasMany(Payment);
Payment.belongsTo(User);

User.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(User);

User.hasMany(DownloadedReport);
DownloadedReport.belongsTo(User);


module.exports = {
    User,
    Expenses,
    Payment,
    ForgotPasswordRequests,
    DownloadedReport
}