const { Register, Doctor } = require("../database/mongodb");

const login_verify = async (req, res, next) => {
  try {
    const token = req.query.token;
    const user = await Register.findOne({ emailToken: token });
    if (user) {
      user.emailToken = null;
      user.isVerified = true;
      user.userRole = "0";
      await user.save();
      console.log("email is verified");
      next();
    } else {
      res.redirect("/register");
      console.log("email is not verified");
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = login_verify;
