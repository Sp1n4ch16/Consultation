const { doctorInfo } = require("../database/mongodb");

const onlineConsultAPI = async (req, res, next) => {
  try {
    const doctors = await doctorInfo.find();
    res.render("POnlineConsult", { doctors });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching doctors.");
  }
};

module.exports = onlineConsultAPI;
