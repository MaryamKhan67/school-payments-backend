const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers["authorization"];
  
  // Check if token exists and has correct format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided or invalid format" });
  }

  // Extract token (remove "Bearer " prefix)
  const token = authHeader.split(" ")[1];
  
  // Additional check for empty token
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Add debug logging to check if JWT_SECRET is available
    console.log("JWT_SECRET present:", !!process.env.JWT_SECRET);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT Verification Error:", err.message);
    return res.status(401).json({ 
      message: "Invalid token",
      error: err.message // Include specific error for debugging
    });
  }
};

module.exports = authMiddleware;