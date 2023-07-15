const doctorInfo = require("../database/mongodb");

const myappointmentAPI = async (req, res, next) => {
  try {
    const doctors = await doctorInfo.find();
    console.log(doctors);
    res.render("DHome", { doctors });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching doctors.");
  }
};

module.exports = myappointmentAPI;
