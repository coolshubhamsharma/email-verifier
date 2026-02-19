const express = require("express");
const verifyEmail = require("./verifyEmail");

const app = express();
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Email Verification API is running"
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Verification endpoint
app.post("/verify", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "email_required"
      });
    }

    const result = await verifyEmail(email);
    return res.json(result);

  } catch (err) {
    return res.status(500).json({
      error: "internal_server_error",
      message: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
