const bcrypt = require("bcrypt");
const { pool } = require("../config/db");

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email y password son obligatorios." });
    }

    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.email, u.password, r.name AS role
       FROM users u
       INNER JOIN roles r ON r.id = u.role_id
       WHERE u.email = ?`,
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Credenciales invalidas." });
    }

    const user = rows[0];
    let passwordValid = false;

    try {
      passwordValid = await bcrypt.compare(password, user.password);
    } catch (error) {
      passwordValid = false;
    }

    // Compatibilidad con datos iniciales en texto plano.
    if (!passwordValid && password === user.password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id]);
      passwordValid = true;
      user.password = hashedPassword;
    }

    if (!passwordValid) {
      return res.status(401).json({ message: "Credenciales invalidas." });
    }

    req.session.user = sanitizeUser(user);
    return res.status(200).json({ message: "Login exitoso.", user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
}

function me(req, res) {
  return res.status(200).json({ user: req.session.user });
}

function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Sesion cerrada." });
  });
}

module.exports = {
  login,
  me,
  logout,
};
