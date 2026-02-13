const bcrypt = require("bcrypt");
const { pool } = require("../config/db");

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role_id: user.role_id,
    role: user.role,
    created_at: user.created_at,
  };
}

async function getAllUsers(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.email, u.role_id, u.created_at, r.name AS role
       FROM users u
       INNER JOIN roles r ON r.id = u.role_id
       ORDER BY u.id ASC`
    );

    return res.status(200).json(rows.map(sanitizeUser));
  } catch (error) {
    return next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "id de usuario invalido." });
    }

    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.email, u.role_id, u.created_at, r.name AS role
       FROM users u
       INNER JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?`,
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    return res.status(200).json(sanitizeUser(rows[0]));
  } catch (error) {
    return next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const { username, email, password, role_id } = req.body;

    if (!username || !email || !password || !role_id) {
      return res
        .status(400)
        .json({ message: "username, email, password y role_id son obligatorios." });
    }

    const roleIdNumber = Number(role_id);
    if (!Number.isInteger(roleIdNumber) || roleIdNumber <= 0) {
      return res.status(400).json({ message: "role_id invalido." });
    }

    const [roleRows] = await pool.query("SELECT id FROM roles WHERE id = ?", [roleIdNumber]);
    if (!roleRows.length) {
      return res.status(400).json({ message: "El role_id no existe." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, roleIdNumber]
    );

    await pool.query("INSERT INTO inventories (user_id) VALUES (?)", [result.insertId]);

    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.email, u.role_id, u.created_at, r.name AS role
       FROM users u
       INNER JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?`,
      [result.insertId]
    );

    return res.status(201).json(sanitizeUser(rows[0]));
  } catch (error) {
    if (error && error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email ya registrado." });
    }
    return next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "id de usuario invalido." });
    }

    const { username, email, password, role_id } = req.body;
    if (!username && !email && !password && !role_id) {
      return res.status(400).json({ message: "Debes enviar al menos un campo a actualizar." });
    }

    const [existingRows] = await pool.query("SELECT id FROM users WHERE id = ?", [userId]);
    if (!existingRows.length) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (role_id !== undefined) {
      const roleIdNumber = Number(role_id);
      if (!Number.isInteger(roleIdNumber) || roleIdNumber <= 0) {
        return res.status(400).json({ message: "role_id invalido." });
      }
      const [roleRows] = await pool.query("SELECT id FROM roles WHERE id = ?", [roleIdNumber]);
      if (!roleRows.length) {
        return res.status(400).json({ message: "El role_id no existe." });
      }
    }

    const updates = [];
    const values = [];

    if (username) {
      updates.push("username = ?");
      values.push(username);
    }
    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      values.push(hashedPassword);
    }
    if (role_id !== undefined) {
      updates.push("role_id = ?");
      values.push(Number(role_id));
    }

    values.push(userId);
    await pool.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);

    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.email, u.role_id, u.created_at, r.name AS role
       FROM users u
       INNER JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?`,
      [userId]
    );

    return res.status(200).json(sanitizeUser(rows[0]));
  } catch (error) {
    if (error && error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email ya registrado." });
    }
    return next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "id de usuario invalido." });
    }

    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [userId]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    return res.status(200).json({ message: "Usuario eliminado." });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
