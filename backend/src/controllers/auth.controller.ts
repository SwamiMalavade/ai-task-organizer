import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import pool from "../config/database";

interface UserRow {
  id: number;
  email: string;
  password: string;
  name: string;
}

export const registerValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("name").trim().isLength({ min: 2 }),
];

export const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    const existingUsers = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUsers.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const result = await pool.query(
      "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id",
      [email, password, name]
    );

    const userId = result.rows[0].id;

    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: userId,
        email,
        name,
      },
    });
  } catch (error: any) {
    res
      .status(500)
      .json({
        error: "Registration failed: " + (error.message || "Unknown error"),
      });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT id, email, password, name FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0] as UserRow;

    const isValidPassword = password === user.password;
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};
