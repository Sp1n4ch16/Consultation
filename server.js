const session = require("express-session");
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const http = require("http");
const exp = require("constants");
const server = http.createServer(app);
const cookieparser = require("cookie-parser");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const multer = require("multer");
require("dotenv").config();

const verifyEmail = require("./src/verify");
const calculateAge = require("./src/calculateAge");
const loginVerify = require("./src/login-verify");

const {
  Register,
  Appointment,
  OnlineConsult,
  Doctor,
  appointmentDone,
  consultDone,
  doctorInfo,
  ScreenRecord,
} = require("./database/mongodb");

const view = path.join(__dirname, "views");
app.set("view engine", "ejs");
app.set("views", view);

app.use(express.static("src"));
app.use(express.static("CSS"));
app.use(express.static("database"));
app.use(express.static("images"));
app.use(cookieparser());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "secret",
    cookie: { maxAge: 60000 },
    saveUninitialized: false,
    resave: false,
  })
);

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
const createToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
});

app.get("/", (req, res) => {
  res.render("login");
});
app.get("/loginFailed", (req, res) => {
  res.render("loginFailed");
});
app.get("/loginSuccess", (req, res) => {
  res.render("loginSuccess");
});

app.get("/login/verify-email", loginVerify, async (req, res) => {
  res.redirect("/");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/PHome", (req, res) => {
  res.render("Phome");
});
app.get("/DHome", async (req, res) => {
  try {
    const doctors = await doctorInfo.find();
    console.log(doctors);
    res.render("DHome", { doctors });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching doctors.");
  }
});
app.get("/POnlineConsult", async (req, res) => {
  try {
    const doctors = await doctorInfo.find();
    res.render("POnlineConsult", { doctors });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching doctors.");
  }
});

/*-----LOGIN-----*/
app.post("/login", verifyEmail, async (req, res) => {
  try {
    const { email, password } = req.body;
    const check = await Register.findOne({ email: email });
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
});

/*-----REGISTER------*/
app.post("/register", async (req, res) => {
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
});

/*---ONLINE CONSULTATION----*/
app.post("/POnlineConsult", upload.single("image"), async (req, res) => {
  const checkdate = req.body.date;
  const data = {
    name: req.cookies.name,
    date: req.body.date,
    description: req.body.description,
    email: req.cookies.emailUser,
    age: req.cookies.age,
    gender: req.cookies.gender,
    isVerified: false,
    paid: "Unpaid",
    status: "Waiting to Approved",
  };
  try {
    const existingAppointment = await OnlineConsult.findOne({
      date: checkdate,
    });
    if (existingAppointment) {
      // Appointment already booked
      res.redirect("bookFailed");
      console.log("Booked Already");
    } else {
      console.log(data);
      await OnlineConsult.insertMany([data]);
      console.log(data);
      res.redirect("PHome");
    }
  } catch (error) {
    console.log(error);
  }
});

server.listen(3000, () => {
  console.log("Port running on 3000");
});
