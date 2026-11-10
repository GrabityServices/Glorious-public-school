
function indiaOnly(req, res, next) {
  const country = req.get("CF-IPCountry");

  if (!country) {
    return res.status(403).json({
      success: false,
      error: "Unable to verify your login location.",
    });
  }

  if (country.toUpperCase() !== "IN") {
    return res.status(403).json({
      success: false,
      error: "Administrator login is restricted to India.",
    });
  }

  next();
}

module.exports = indiaOnly;