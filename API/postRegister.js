const bcrypt = require("bcrypt");
const calculateAge = require("../src/calculateAge");
const crypto = require("crypto");
const { Register } = require("../database/mongodb");
const transporter = require("../src/nodemailer");

const registerAPI = async (req, res) => {
  try {
    const userBirthdate = req.body.birthdate;
    const userAge = calculateAge(userBirthdate);
    const data = {
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      full_name: req.body.firstName + " " + req.body.lastName,
      contact_number: req.body.contactNumber,
      address: req.body.address,
      birthdate: new Date(req.body.birthdate),
      age: userAge,
      gender: req.body.gender,
      email: req.body.email,
      password: req.body.password,
      isVerified: false,
      emailToken: crypto.randomBytes(64).toString("hex"),
    };
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(data.password, salt);
    data.password = hashpassword;
    await Register.insertMany([data]);

    //send verification to the user
    var mailOptions = {
      from: ' "Verify your email" <dummy8270@gmail.com',
      to: data.email,
      subject: "dummy8270 -verify your email",
      html: `<h2> ${data.first_name}! Thanks for registering on our site </h2>
                  <h4> Please verify your email to continue..</h4>
                  <a href="http://${req.headers.host}/login/verify-email?token=${data.emailToken}">Verify Your Email</a>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Verification email is sent to your gmail account");
      }
    });
    res.render("login");
  } catch (err) {
    console.log(err);
  }
};

module.exports = registerAPI;
