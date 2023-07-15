const { Register } = require("../database/mongodb");
const bcrypt = require("bcrypt");
const createToken = require("../src/jwt");

const loginAPI = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const check = await Register.findOne({ email: email }).exec(); // Add .exec() to execute the query
    if (check) {
      const match = await bcrypt.compare(password, check.password);
      if (match) {
        if (check.userRole === "1") {
          //create token
          const doctors = await doctorInfo.find();
          const token = createToken(check._id);
          const user = check.email;
          const name = check.first_name;
          const age = check.age;
          //store token in cookie
          res.cookie("access-token", token);
          res.cookie("emailUser", user);
          res.cookie("name", name);
          res.cookie("age", age);
          res.render("DHome", { doctors });
        } else if (check.userRole === "0") {
          //create token
          const token = createToken(check._id);
          const user = check.email;
          const name = check.full_name;
          const age = check.age;
          const gender = check.gender;
          //store token in cookie
          res.cookie("access-token", token);
          res.cookie("emailUser", user);
          res.cookie("name", name);
          res.cookie("age", age);
          res.cookie("gender", gender);
          res.redirect("loginSuccess");
        }
      } else {
        console.log("invalid password");
        res.redirect("loginFailed");
      }
    }
  } catch (err) {
    res.redirect("loginFailed");
    console.log(err);
  }
};

module.exports = loginAPI;
