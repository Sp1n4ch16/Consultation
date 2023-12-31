const session = require("express-session");
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const http = require("http");
const server = http.createServer(app);
const cookieparser = require("cookie-parser");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server, { cors: { origin: "*" } });
require("dotenv").config();

const verifyEmail = require("./src/verify");
const calculateAge = require("./src/calculateAge");
const loginVerify = require("./src/login-verify");
const transferAppointmentsToHistory = require("./src/trasnferAppointemt");
const { storage, upload } = require("./src/multer");
const transporter = require("./src/nodemailer");
const createToken = require("./src/jwt");

const myappointmentAPI = require("./API/getmyappointment");
const dhomeAPI = require("./API/getDHome");
const onlineConsultAPI = require("./API/getPOnlineConsult");
const roomAPI = require("./API/getRoom");
const loginAPI = require("./API/postLogin");
const registerAPI = require("./API/postRegister");
const postPOnlineConsultAPI = require("./API/postPOnlineConsult");

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

app.set("view engine", "ejs");

app.use(express.static("src"));
app.use(express.static("CSS"));
app.use(express.static("database"));
app.use(express.static("images"));
app.use(express.static("views"));
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

//socket.io chat
const users = {};

io.on("connection", socket => {
  socket.on("join-room", (roomId, userId, name) => {
    users[socket.id] = name;
    socket.broadcast.emit("user-connected", userId);
    socket.broadcast.emit("join-name", name);

    socket.on("disconnect", () => {
      socket.broadcast.emit("user-disconnected", userId);
    });
  });

  socket.on("send-chat-message", message => {
    socket.broadcast.emit("chat-message", {
      message: message,
      name: users[socket.id],
    });
  });
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
app.get("/verify", (req, res) => {
  res.render("verify");
});

app.get("/login/verify-email", loginVerify, async (req, res) => {
  res.redirect("/");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/PHome", (req, res) => {
  res.render("PHome");
});

app.get("/DHome", dhomeAPI, (req, res) => {});

app.get("/POnlineConsult", onlineConsultAPI, (req, res) => {});

app.get("/myappointment", transferAppointmentsToHistory, myappointmentAPI);

app.get("/PAppointment", (req, res) => {
  res.render("PAppointment");
});

app.get("/room", (req, res) => {
  res.redirect(`/room${uuidv4()}`);
});

app.get("/room:room", roomAPI, (req, res) => {});

/*-----LOGIN-----*/
app.post("/login", verifyEmail, loginAPI, (req, res) => {});

/*-----REGISTER------*/
app.post("/register", registerAPI, (req, res) => {});

/*---ONLINE CONSULTATION----*/
app.post(
  "/POnlineConsult",
  upload.single("image"),
  postPOnlineConsultAPI,
  async (req, res) => {}
);

server.listen(3000, () => {
  console.log("Port running on 3000");
});
