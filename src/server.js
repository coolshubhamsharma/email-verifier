const express = require("express");
const path = require("path");
const verifyEmail = require("./verifyEmail");

const app = express();
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/verify", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "email_required"
      });
    }

    const result = await verifyEmail(email);
    res.json(result);

  } catch (err) {
    res.status(500).json({
      error: "internal_server_error",
      message: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
