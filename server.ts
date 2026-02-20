import express from "express";
import { createServer as createViteServer } from "vite";
import pool from "./src/db.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/properties", async (req, res) => {
    const { type, operation, minPrice, maxPrice } = req.query;
    let query = "SELECT * FROM properties WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND type = $${paramIndex++}`;
      params.push(type);
    }
    if (operation) {
      query += ` AND operation = $${paramIndex++}`;
      params.push(operation);
    }
    if (minPrice) {
      query += ` AND price >= $${paramIndex++}`;
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      query += ` AND price <= $${paramIndex++}`;
      params.push(Number(maxPrice));
    }

    query += " ORDER BY featured DESC, created_at DESC";
    try {
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const propertyRes = await pool.query("SELECT * FROM properties WHERE id = $1", [req.params.id]);
      if (propertyRes.rows.length === 0) return res.status(404).json({ error: "Property not found" });

      const imagesRes = await pool.query("SELECT * FROM property_images WHERE property_id = $1", [req.params.id]);
      res.json({ ...propertyRes.rows[0], images: imagesRes.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/properties", async (req, res) => {
    const { title, description, price, location, type, operation, bedrooms, bathrooms, area, featured, main_image, images } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const insertPropertyQuery = `
        INSERT INTO properties (title, description, price, location, type, operation, bedrooms, bathrooms, area, featured, main_image)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `;
      const propertyRes = await client.query(insertPropertyQuery, [
        title, description, price, location, type, operation, bedrooms, bathrooms, area, !!featured, main_image
      ]);
      const propertyId = propertyRes.rows[0].id;

      if (images && Array.isArray(images)) {
        const insertImageQuery = "INSERT INTO property_images (property_id, url) VALUES ($1, $2)";
        for (const url of images) {
          await client.query(insertImageQuery, [propertyId, url]);
        }
      }
      await client.query('COMMIT');
      res.json({ id: propertyId });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      client.release();
    }
  });

  app.put("/api/properties/:id", async (req, res) => {
    const { title, description, price, location, type, operation, bedrooms, bathrooms, area, featured, status, main_image, images } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const updatePropertyQuery = `
        UPDATE properties SET 
          title = $1, description = $2, price = $3, location = $4, type = $5, 
          operation = $6, bedrooms = $7, bathrooms = $8, area = $9, 
          featured = $10, status = $11, main_image = $12
        WHERE id = $13
      `;
      await client.query(updatePropertyQuery, [
        title, description, price, location, type, operation, bedrooms, bathrooms, area, !!featured, status, main_image, req.params.id
      ]);

      await client.query("DELETE FROM property_images WHERE property_id = $1", [req.params.id]);

      if (images && Array.isArray(images)) {
        const insertImageQuery = "INSERT INTO property_images (property_id, url) VALUES ($1, $2)";
        for (const url of images) {
          await client.query(insertImageQuery, [req.params.id, url]);
        }
      }
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      client.release();
    }
  });

  app.delete("/api/properties/:id", async (req, res) => {
    try {
      await pool.query("DELETE FROM properties WHERE id = $1", [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const total = await pool.query("SELECT COUNT(*) as count FROM properties");
      const active = await pool.query("SELECT COUNT(*) as count FROM properties WHERE status = 'disponible'");
      const sold = await pool.query("SELECT COUNT(*) as count FROM properties WHERE status = 'vendida'");
      const inquiries = await pool.query("SELECT COUNT(*) as count FROM inquiries");

      res.json({
        total: parseInt(total.rows[0].count),
        active: parseInt(active.rows[0].count),
        sold: parseInt(sold.rows[0].count),
        inquiries: parseInt(inquiries.rows[0].count)
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Favorites API
  app.get("/api/favorites", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT p.* FROM properties p
        JOIN favorites f ON p.id = f.property_id
      `);
      res.json(result.rows.map(row => ({ ...row, featured: !!row.featured })));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/favorites/:id", async (req, res) => {
    try {
      await pool.query("INSERT INTO favorites (property_id) VALUES ($1) ON CONFLICT DO NOTHING", [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/favorites/:id", async (req, res) => {
    try {
      await pool.query("DELETE FROM favorites WHERE property_id = $1", [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Inquiries API
  app.get("/api/inquiries", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT i.*, p.title as property_title, p.main_image as property_image
        FROM inquiries i
        LEFT JOIN properties p ON i.property_id = p.id
        ORDER BY i.created_at DESC
      `);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/inquiries", async (req, res) => {
    const { property_id, client_name, client_phone, message } = req.body;
    try {
      await pool.query(`
        INSERT INTO inquiries (property_id, client_name, client_phone, message)
        VALUES ($1, $2, $3, $4)
      `, [property_id, client_name, client_phone, message]);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
