function calculateAge(birthdate) {
  const currentDate = new Date();
  const birthdateParts = birthdate.split("-");
  const userBirthdate = new Date(
    birthdateParts[0],
    birthdateParts[1] - 1,
    birthdateParts[2]
  );

  let age = currentDate.getFullYear() - userBirthdate.getFullYear();

  if (
    currentDate.getMonth() < userBirthdate.getMonth() ||
    (currentDate.getMonth() === userBirthdate.getMonth() &&
      currentDate.getDate() < userBirthdate.getDate())
  ) {
    age--;
  }

  return age;
}

module.exports = calculateAge;
