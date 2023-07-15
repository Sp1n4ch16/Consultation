const roomAPI = (req, res, next) => {
  res.render("room", {
    roomId: "room" + req.params.room,
    name: req.cookies.name,
    email: req.cookies.emailUser,
  });
};

module.exports = roomAPI;
