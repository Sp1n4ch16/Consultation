const { OnlineConsult } = require("../database/mongodb");

const postPOnlineConsultAPI = async (req, res) => {
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
      await OnlineConsult.insertMany([data]);
      res.redirect("PHome");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = postPOnlineConsultAPI;
