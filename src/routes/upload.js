const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../middlewares/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200: { description: File uploaded }
 *       400: { description: No file uploaded }
 */
// Single file upload
router.post('/', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ fileUrl });
});

module.exports = router; 