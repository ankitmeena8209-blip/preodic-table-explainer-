module.exports = (req, res) => {
  const email = process.env.CONTACT_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  if (!email || email.trim() === "" || email.includes("example.com")) {
    return res.status(503).json({ error: "Contact email is currently unavailable." });
  }

  const format = req.query ? req.query.format : null;
  if (format === "json") {
    return res.status(200).json({ mailto: `mailto:${email}` });
  }

  res.writeHead(302, { Location: `mailto:${email}` });
  return res.end();
};
