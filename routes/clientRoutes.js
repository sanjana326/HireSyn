const express = require("express");
const router = express.Router();
const db = require("../db");

// CREATE COMPANY
router.post("/", (req, res) => {
  const {
    company_name,
    email,
    website,
    gst_number,
    company_type,
    address_line1,
    address_line2,
    city,
    state,
    country,
    pincode,
    contact1,
    contact2,
    contact3,
    contact4,
    status
  } = req.body;

  const sql = `
    INSERT INTO companies
    (company_name, email, website, gst_number, company_type,
     address_line1, address_line2, city, state, country, pincode,
     contact1, contact2, contact3, contact4, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    company_name, email, website, gst_number, company_type,
    address_line1, address_line2, city, state, country, pincode,
    contact1, contact2, contact3, contact4, status
  ], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Company added successfully" });
  });
});

// GET ALL COMPANIES
router.get("/", (req, res) => {
  const pageParam = parseInt(req.query.page, 10);
  const limitParam = parseInt(req.query.limit, 10);
  const paginate = !isNaN(pageParam) || !isNaN(limitParam);

  const page = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;
  const limit = !isNaN(limitParam) && limitParam > 0 ? limitParam : 10;

  if (paginate) {
    db.query("SELECT COUNT(*) AS total FROM companies", (countErr, countRes) => {
      if (countErr) return res.status(500).json(countErr);
      const total = countRes?.[0]?.total ?? 0;
      const pages = Math.max(1, Math.ceil(total / limit));
      const offset = (page - 1) * limit;

      db.query(
        "SELECT * FROM companies ORDER BY id DESC LIMIT ? OFFSET ?",
        [limit, offset],
        (listErr, rows) => {
          if (listErr) return res.status(500).json(listErr);
          res.json({
            data: rows,
            pagination: { total, page, limit, pages }
          });
        }
      );
    });
  } else {
    db.query("SELECT * FROM companies", (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    });
  }
});

// GET SINGLE COMPANY
router.get("/:id", (req, res) => {
  db.query("SELECT * FROM companies WHERE id = ?", [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result[0]);
    }
  );
});

// UPDATE COMPANY
router.put("/:id", (req, res) => {
  const {
    company_name,
    email,
    website,
    gst_number,
    company_type,
    address_line1,
    address_line2,
    city,
    state,
    country,
    pincode,
    contact1,
    contact2,
    contact3,
    contact4,
    status
  } = req.body;

  const sql = `
    UPDATE companies SET
    company_name=COALESCE(?, company_name),
    email=COALESCE(?, email),
    website=COALESCE(?, website),
    gst_number=COALESCE(?, gst_number),
    company_type=COALESCE(?, company_type),
    address_line1=COALESCE(?, address_line1),
    address_line2=COALESCE(?, address_line2),
    city=COALESCE(?, city),
    state=COALESCE(?, state),
    country=COALESCE(?, country),
    pincode=COALESCE(?, pincode),
    contact1=COALESCE(?, contact1),
    contact2=COALESCE(?, contact2),
    contact3=COALESCE(?, contact3),
    contact4=COALESCE(?, contact4),
    status=COALESCE(?, status)
    WHERE id=?
  `;

  db.query(sql, [
    company_name ?? null,
    email ?? null,
    website ?? null,
    gst_number ?? null,
    company_type ?? null,
    address_line1 ?? null,
    address_line2 ?? null,
    city ?? null,
    state ?? null,
    country ?? null,
    pincode ?? null,
    contact1 ?? null,
    contact2 ?? null,
    contact3 ?? null,
    contact4 ?? null,
    status ?? null,
    req.params.id
  ], (err, result) => {
    if (err) return res.status(500).json(err);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json({ message: "Company updated successfully" });
  });
});

// DELETE COMPANY
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM companies WHERE id = ?", [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (!result || result.affectedRows === 0) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json({ message: "Company deleted successfully" });
    }
  );
});

module.exports = router;
