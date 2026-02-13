const axios = require("axios");
const { pool } = require("../config/db");

const VALORANT_WEAPONS_API = "https://valorant-api.com/v1/weapons";

function normalizeCategory(category) {
  if (!category) return null;
  return category.replace("EEquippableCategory::", "");
}

async function getWeaponFromPublicApi(apiId) {
  const response = await axios.get(VALORANT_WEAPONS_API, { timeout: 15000 });
  const weapons = response.data && response.data.data ? response.data.data : [];
  return weapons.find((item) => item.uuid === apiId || item.displayName === apiId) || null;
}

async function getPublicWeaponsCatalog(req, res, next) {
  try {
    const response = await axios.get(VALORANT_WEAPONS_API, { timeout: 15000 });
    const weapons = response.data && response.data.data ? response.data.data : [];

    const catalog = weapons
      .filter((item) => item && item.uuid && item.displayName)
      .map((item) => ({
        api_id: item.uuid,
        name: item.displayName,
        category: normalizeCategory(item.category),
        image: item.displayIcon || null,
        suggested_price: item.shopData && Number.isInteger(item.shopData.cost) ? item.shopData.cost : 0,
      }));

    return res.status(200).json(catalog);
  } catch (error) {
    return next(error);
  }
}

async function getAllWeapons(req, res, next) {
  try {
    const [rows] = await pool.query("SELECT * FROM weapons ORDER BY id ASC");
    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
}

async function getWeaponById(req, res, next) {
  try {
    const weaponId = Number(req.params.id);
    if (!Number.isInteger(weaponId) || weaponId <= 0) {
      return res.status(400).json({ message: "id de arma invalido." });
    }

    const [rows] = await pool.query("SELECT * FROM weapons WHERE id = ?", [weaponId]);
    if (!rows.length) {
      return res.status(404).json({ message: "Arma no encontrada." });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return next(error);
  }
}

async function createWeapon(req, res, next) {
  try {
    const { api_id, price } = req.body;
    const priceNumber = Number(price);

    if (!api_id || !Number.isInteger(priceNumber) || priceNumber <= 0) {
      return res
        .status(400)
        .json({ message: "api_id y price (entero mayor que 0) son obligatorios." });
    }

    const apiWeapon = await getWeaponFromPublicApi(api_id);
    if (!apiWeapon) {
      return res.status(404).json({ message: "No se encontro el arma en la API de Valorant." });
    }

    const image = apiWeapon.displayIcon || null;
    const name = apiWeapon.displayName;
    const category = normalizeCategory(apiWeapon.category);

    const [result] = await pool.query(
      "INSERT INTO weapons (api_id, name, category, image, price) VALUES (?, ?, ?, ?, ?)",
      [apiWeapon.uuid, name, category, image, priceNumber]
    );

    const [rows] = await pool.query("SELECT * FROM weapons WHERE id = ?", [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    if (error && error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "El arma ya existe en la base de datos." });
    }
    return next(error);
  }
}

async function updateWeapon(req, res, next) {
  try {
    const weaponId = Number(req.params.id);
    if (!Number.isInteger(weaponId) || weaponId <= 0) {
      return res.status(400).json({ message: "id de arma invalido." });
    }

    const { api_id, price } = req.body;
    const priceNumber = Number(price);
    if (price !== undefined && (!Number.isInteger(priceNumber) || priceNumber <= 0)) {
      return res.status(400).json({ message: "price debe ser entero mayor que 0." });
    }

    const [existingRows] = await pool.query("SELECT * FROM weapons WHERE id = ?", [weaponId]);
    if (!existingRows.length) {
      return res.status(404).json({ message: "Arma no encontrada." });
    }

    const currentWeapon = existingRows[0];
    let targetApiId = currentWeapon.api_id;
    let name = currentWeapon.name;
    let category = currentWeapon.category;
    let image = currentWeapon.image;

    if (api_id) {
      const apiWeapon = await getWeaponFromPublicApi(api_id);
      if (!apiWeapon) {
        return res.status(404).json({ message: "No se encontro el arma en la API de Valorant." });
      }
      targetApiId = apiWeapon.uuid;
      name = apiWeapon.displayName;
      category = normalizeCategory(apiWeapon.category);
      image = apiWeapon.displayIcon || null;
    }

    await pool.query(
      `UPDATE weapons
       SET api_id = ?, name = ?, category = ?, image = ?, price = ?
       WHERE id = ?`,
      [targetApiId, name, category, image, price !== undefined ? priceNumber : currentWeapon.price, weaponId]
    );

    const [rows] = await pool.query("SELECT * FROM weapons WHERE id = ?", [weaponId]);
    return res.status(200).json(rows[0]);
  } catch (error) {
    if (error && error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "api_id duplicado para otra arma." });
    }
    return next(error);
  }
}

async function deleteWeapon(req, res, next) {
  try {
    const weaponId = Number(req.params.id);
    if (!Number.isInteger(weaponId) || weaponId <= 0) {
      return res.status(400).json({ message: "id de arma invalido." });
    }

    const [result] = await pool.query("DELETE FROM weapons WHERE id = ?", [weaponId]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Arma no encontrada." });
    }

    return res.status(200).json({ message: "Arma eliminada." });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getPublicWeaponsCatalog,
  getAllWeapons,
  getWeaponById,
  createWeapon,
  updateWeapon,
  deleteWeapon,
};
