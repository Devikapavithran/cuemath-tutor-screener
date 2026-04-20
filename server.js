const express = require("express");
const path    = require("path");

const app = express();
app.use(express.json({ limit: "1mb" }));

// Serve built React app
app.use(express.static(path.join(__dirname, "dist")));

/**
 * Secure proxy — Anthropic API key lives only here on the server.
 * The frontend never sees the key.
 */
app.post("/api/analyze", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server configuration error: API key not set." });
  }

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string" || prompt.length > 8000) {
    return res.status(400).json({ error: "Invalid request." });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", response.status, err);
      return res.status(502).json({ error: "AI analysis failed. Please try again." });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// SPA fallback — all routes serve index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Cuemath Screener running on port ${PORT}`));
