const axios = require("axios");
const { pool } = require("../config/db");

const VALORANT_SKINS_API = "https://valorant-api.com/v1/weapons/skins";
const VALORANT_WEAPONS_API = "https://valorant-api.com/v1/weapons";

function resolveSkinImage(skin) {
  if (!skin) return null;
  if (skin.displayIcon) return skin.displayIcon;
  if (Array.isArray(skin.chromas) && skin.chromas.length && skin.chromas[0].fullRender) {
    return skin.chromas[0].fullRender;
  }
  return null;
}

async function getSkinFromPublicApi(apiSkinIdOrName) {
  const response = await axios.get(VALORANT_SKINS_API, { timeout: 15000 });
  const skins = response.data && response.data.data ? response.data.data : [];
  return skins.find((item) => item.uuid === apiSkinIdOrName || item.displayName === apiSkinIdOrName) || null;
}

async function getWeaponFromPublicApi(apiWeaponIdOrName) {
  const response = await axios.get(VALORANT_WEAPONS_API, { timeout: 15000 });
  const weapons = response.data && response.data.data ? response.data.data : [];
  return weapons.find((item) => item.uuid === apiWeaponIdOrName || item.displayName === apiWeaponIdOrName) || null;
}

async function resolveLocalWeaponId({ weapon_id, weapon_api_id }) {
  if (weapon_id !== undefined && weapon_id !== null && weapon_id !== "") {
    const localWeaponId = Number(weapon_id);
    if (!Number.isInteger(localWeaponId) || localWeaponId <= 0) {
      throw new Error("weapon_id invalido.");
    }

    const [rows] = await pool.query("SELECT id FROM weapons WHERE id = ?", [localWeaponId]);
    if (!rows.length) {
      throw new Error("Arma no encontrada.");
    }
    return localWeaponId;
  }

  if (!weapon_api_id) {
    throw new Error("Debes enviar weapon_id o weapon_api_id.");
  }

  const [existingRows] = await pool.query("SELECT id FROM weapons WHERE api_id = ?", [weapon_api_id]);
  if (existingRows.length) {
    return existingRows[0].id;
  }

  const apiWeapon = await getWeaponFromPublicApi(weapon_api_id);
  if (!apiWeapon) {
    throw new Error("No se encontro el arma en la API de Valorant.");
  }

  const category = apiWeapon.category ? apiWeapon.category.replace("EEquippableCategory::", "") : null;
  const price = apiWeapon.shopData && Number.isInteger(apiWeapon.shopData.cost) ? apiWeapon.shopData.cost : 0;

  const [insertResult] = await pool.query(
    "INSERT INTO weapons (api_id, name, category, image, price) VALUES (?, ?, ?, ?, ?)",
    [apiWeapon.uuid, apiWeapon.displayName, category, apiWeapon.displayIcon || null, price]
  );

  return insertResult.insertId;
}

async function getPublicSkinsCatalog(req, res, next) {
  try {
    const search = String(req.query.search || "").trim().toLowerCase();
    const weaponApiId = String(req.query.weapon_api_id || "").trim();
    const response = await axios.get(VALORANT_WEAPONS_API, { timeout: 15000 });
    const weapons = response.data && response.data.data ? response.data.data : [];

    const sourceWeapons = weaponApiId
      ? weapons.filter((weapon) => weapon.uuid === weaponApiId || weapon.displayName === weaponApiId)
      : weapons;

    const skins = sourceWeapons.flatMap((weapon) =>
      (weapon.skins || []).map((skin) => ({
        ...skin,
        weapon_api_id: weapon.uuid,
        weapon_name: weapon.displayName,
      }))
    );

    const filtered = skins
      .filter((item) => item && item.uuid && item.displayName)
      .filter((item) => (search ? item.displayName.toLowerCase().includes(search) : true))
      .slice(0, 200)
      .map((item) => ({
        api_skin_id: item.uuid,
        name: item.displayName,
        image: resolveSkinImage(item),
        weapon_api_id: item.weapon_api_id,
        weapon_name: item.weapon_name,
      }));

    return res.status(200).json(filtered);
  } catch (error) {
    return next(error);
  }
}

async function getAllSkins(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.weapon_id, s.api_skin_id, s.name, s.image, s.created_at, w.name AS weapon_name
       FROM skins s
       INNER JOIN weapons w ON w.id = s.weapon_id
       ORDER BY s.id ASC`
    );
    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
}

async function getSkinById(req, res, next) {
  try {
    const skinId = Number(req.params.id);
    if (!Number.isInteger(skinId) || skinId <= 0) {
      return res.status(400).json({ message: "id de skin invalido." });
    }

    const [rows] = await pool.query(
      `SELECT s.id, s.weapon_id, s.api_skin_id, s.name, s.image, s.created_at, w.name AS weapon_name
       FROM skins s
       INNER JOIN weapons w ON w.id = s.weapon_id
       WHERE s.id = ?`,
      [skinId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Skin no encontrada." });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return next(error);
  }
}

async function createSkin(req, res, next) {
  try {
    const { weapon_id, weapon_api_id, api_skin_id, user_id, quantity } = req.body;
    if (!api_skin_id) {
      return res.status(400).json({ message: "api_skin_id es obligatorio." });
    }

    const weaponId = await resolveLocalWeaponId({ weapon_id, weapon_api_id });

    const apiSkin = await getSkinFromPublicApi(api_skin_id);
    if (!apiSkin) {
      return res.status(404).json({ message: "No se encontro la skin en la API de Valorant." });
    }

    const [result] = await pool.query(
      "INSERT INTO skins (weapon_id, api_skin_id, name, image) VALUES (?, ?, ?, ?)",
      [weaponId, apiSkin.uuid, apiSkin.displayName, resolveSkinImage(apiSkin)]
    );

    if (user_id !== undefined && user_id !== null && user_id !== "") {
      const userIdNumber = Number(user_id);
      const quantityNumber = quantity === undefined ? 1 : Number(quantity);

      if (!Number.isInteger(userIdNumber) || userIdNumber <= 0) {
        return res.status(400).json({ message: "user_id invalido." });
      }
      if (!Number.isInteger(quantityNumber) || quantityNumber <= 0) {
        return res.status(400).json({ message: "quantity debe ser entero mayor que 0." });
      }

      const [userRows] = await pool.query("SELECT id FROM users WHERE id = ?", [userIdNumber]);
      if (!userRows.length) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      let inventoryId;
      const [inventoryRows] = await pool.query("SELECT id FROM inventories WHERE user_id = ?", [userIdNumber]);
      if (inventoryRows.length) {
        inventoryId = inventoryRows[0].id;
      } else {
        const [inventoryInsert] = await pool.query("INSERT INTO inventories (user_id) VALUES (?)", [userIdNumber]);
        inventoryId = inventoryInsert.insertId;
      }

      const [existingInventoryWeaponRows] = await pool.query(
        "SELECT id, quantity FROM inventory_weapons WHERE inventory_id = ? AND weapon_id = ? AND skin_id = ?",
        [inventoryId, weaponId, result.insertId]
      );

      if (existingInventoryWeaponRows.length) {
        const current = existingInventoryWeaponRows[0];
        await pool.query("UPDATE inventory_weapons SET quantity = ? WHERE id = ?", [
          current.quantity + quantityNumber,
          current.id,
        ]);
      } else {
        await pool.query(
          "INSERT INTO inventory_weapons (inventory_id, weapon_id, skin_id, quantity) VALUES (?, ?, ?, ?)",
          [inventoryId, weaponId, result.insertId, quantityNumber]
        );
      }
    }

    const [rows] = await pool.query(
      `SELECT s.id, s.weapon_id, s.api_skin_id, s.name, s.image, s.created_at, w.name AS weapon_name
       FROM skins s
       INNER JOIN weapons w ON w.id = s.weapon_id
       WHERE s.id = ?`,
      [result.insertId]
    );

    return res.status(201).json(rows[0]);
  } catch (error) {
    if (error && error.message) {
      return res.status(400).json({ message: error.message });
    }
    if (error && error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "api_skin_id ya existe en la base de datos." });
    }
    return next(error);
  }
}

async function updateSkin(req, res, next) {
  try {
    const skinId = Number(req.params.id);
    if (!Number.isInteger(skinId) || skinId <= 0) {
      return res.status(400).json({ message: "id de skin invalido." });
    }

    const { weapon_id, weapon_api_id, api_skin_id } = req.body;

    const [existingRows] = await pool.query("SELECT * FROM skins WHERE id = ?", [skinId]);
    if (!existingRows.length) {
      return res.status(404).json({ message: "Skin no encontrada." });
    }

    const currentSkin = existingRows[0];
    const targetWeaponId =
      weapon_id !== undefined || weapon_api_id
        ? await resolveLocalWeaponId({ weapon_id, weapon_api_id })
        : currentSkin.weapon_id;

    let targetApiSkinId = currentSkin.api_skin_id;
    let targetName = currentSkin.name;
    let targetImage = currentSkin.image;

    if (api_skin_id) {
      const apiSkin = await getSkinFromPublicApi(api_skin_id);
      if (!apiSkin) {
        return res.status(404).json({ message: "No se encontro la skin en la API de Valorant." });
      }
      targetApiSkinId = apiSkin.uuid;
      targetName = apiSkin.displayName;
      targetImage = resolveSkinImage(apiSkin);
    }

    await pool.query(
      "UPDATE skins SET weapon_id = ?, api_skin_id = ?, name = ?, image = ? WHERE id = ?",
      [targetWeaponId, targetApiSkinId, targetName, targetImage, skinId]
    );

    const [rows] = await pool.query(
      `SELECT s.id, s.weapon_id, s.api_skin_id, s.name, s.image, s.created_at, w.name AS weapon_name
       FROM skins s
       INNER JOIN weapons w ON w.id = s.weapon_id
       WHERE s.id = ?`,
      [skinId]
    );

    return res.status(200).json(rows[0]);
  } catch (error) {
    if (error && error.message) {
      return res.status(400).json({ message: error.message });
    }
    if (error && error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "api_skin_id ya existe en otra skin." });
    }
    return next(error);
  }
}

async function deleteSkin(req, res, next) {
  try {
    const skinId = Number(req.params.id);
    if (!Number.isInteger(skinId) || skinId <= 0) {
      return res.status(400).json({ message: "id de skin invalido." });
    }

    const [result] = await pool.query("DELETE FROM skins WHERE id = ?", [skinId]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Skin no encontrada." });
    }

    return res.status(200).json({ message: "Skin eliminada." });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getPublicSkinsCatalog,
  getAllSkins,
  getSkinById,
  createSkin,
  updateSkin,
  deleteSkin,
};
