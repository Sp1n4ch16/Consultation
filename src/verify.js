const { Register, Doctor } = require("../database/mongodb");

const verifyEmail = async (req, res, next) => {
  try {
    const user = await Register.findOne({ email: req.body.email });
    const userAdmin = await Doctor.findOne({ email: req.body.email });
    if (user.isVerified) {
      next();
    } else {
      res.redirect("verify");
      console.log("Please Check your email to Verify");
    }
  } catch (err) {
    res.redirect("loginFailed");
    console.log(err);
  }
};

module.exports = verifyEmail;
