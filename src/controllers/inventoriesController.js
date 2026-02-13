const { pool } = require("../config/db");

function mapInventoryRows(rows) {
  if (!rows.length) return null;

  const base = {
    inventory_id: rows[0].inventory_id,
    user_id: rows[0].user_id,
    username: rows[0].username,
    weapons: [],
  };

  rows.forEach((row) => {
    if (row.weapon_id) {
      base.weapons.push({
        inventory_weapon_id: row.inventory_weapon_id,
        weapon_id: row.weapon_id,
        api_id: row.api_id,
        name: row.weapon_name,
        skin_id: row.skin_id,
        skin_name: row.skin_name,
        skin_image: row.skin_image,
        category: row.category,
        image: row.image,
        price: row.price,
        quantity: row.quantity,
      });
    }
  });

  return base;
}

async function resolveSkinIdForWeapon(weaponId) {
  const [skinRows] = await pool.query(
    "SELECT id FROM skins WHERE weapon_id = ? ORDER BY id ASC LIMIT 1",
    [weaponId]
  );
  if (skinRows.length) {
    return skinRows[0].id;
  }

  const [weaponRows] = await pool.query("SELECT id, api_id, name, image FROM weapons WHERE id = ?", [
    weaponId,
  ]);
  if (!weaponRows.length) {
    return null;
  }

  const weapon = weaponRows[0];
  const technicalApiSkinId = `${weapon.api_id}-default-skin`;
  const technicalSkinName = `${weapon.name} Default`;

  const [insertResult] = await pool.query(
    "INSERT INTO skins (weapon_id, api_skin_id, name, image) VALUES (?, ?, ?, ?)",
    [weapon.id, technicalApiSkinId, technicalSkinName, weapon.image]
  );

  return insertResult.insertId;
}

async function getInventoryByUserId(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "userId invalido." });
    }

    const [userRows] = await pool.query("SELECT id, username FROM users WHERE id = ?", [userId]);
    if (!userRows.length) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const [rows] = await pool.query(
      `SELECT
          i.id AS inventory_id,
          i.user_id,
          u.username,
          iw.id AS inventory_weapon_id,
          iw.quantity,
          s.id AS skin_id,
          s.name AS skin_name,
          s.image AS skin_image,
          w.id AS weapon_id,
          w.api_id,
          w.name AS weapon_name,
          w.category,
          w.image,
          w.price
       FROM inventories i
       INNER JOIN users u ON u.id = i.user_id
       LEFT JOIN inventory_weapons iw ON iw.inventory_id = i.id
       LEFT JOIN weapons w ON w.id = iw.weapon_id
       LEFT JOIN skins s ON s.id = iw.skin_id
       WHERE i.user_id = ?
       ORDER BY iw.id ASC`,
      [userId]
    );

    if (!rows.length) {
      const [insertResult] = await pool.query("INSERT INTO inventories (user_id) VALUES (?)", [userId]);
      return res.status(200).json({
        inventory_id: insertResult.insertId,
        user_id: userRows[0].id,
        username: userRows[0].username,
        weapons: [],
      });
    }

    return res.status(200).json(mapInventoryRows(rows));
  } catch (error) {
    return next(error);
  }
}

async function getAllInventories(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT
          i.id AS inventory_id,
          i.user_id,
          u.username,
          iw.id AS inventory_weapon_id,
          iw.quantity,
          s.id AS skin_id,
          s.name AS skin_name,
          s.image AS skin_image,
          w.id AS weapon_id,
          w.api_id,
          w.name AS weapon_name,
          w.category,
          w.image,
          w.price
       FROM inventories i
       INNER JOIN users u ON u.id = i.user_id
       LEFT JOIN inventory_weapons iw ON iw.inventory_id = i.id
       LEFT JOIN weapons w ON w.id = iw.weapon_id
       LEFT JOIN skins s ON s.id = iw.skin_id
       ORDER BY i.id ASC, iw.id ASC`
    );

    const grouped = new Map();

    rows.forEach((row) => {
      if (!grouped.has(row.inventory_id)) {
        grouped.set(row.inventory_id, {
          inventory_id: row.inventory_id,
          user_id: row.user_id,
          username: row.username,
          weapons: [],
        });
      }

      if (row.weapon_id) {
        grouped.get(row.inventory_id).weapons.push({
          inventory_weapon_id: row.inventory_weapon_id,
          weapon_id: row.weapon_id,
          api_id: row.api_id,
          name: row.weapon_name,
          skin_id: row.skin_id,
          skin_name: row.skin_name,
          skin_image: row.skin_image,
          category: row.category,
          image: row.image,
          price: row.price,
          quantity: row.quantity,
        });
      }
    });

    return res.status(200).json(Array.from(grouped.values()));
  } catch (error) {
    return next(error);
  }
}

async function addWeaponToInventory(req, res, next) {
  try {
    const inventoryId = Number(req.params.inventoryId);
    const { weapon_id, quantity } = req.body;
    const weaponId = Number(weapon_id);
    const quantityNumber = quantity === undefined ? 1 : Number(quantity);

    if (!Number.isInteger(inventoryId) || inventoryId <= 0) {
      return res.status(400).json({ message: "inventoryId invalido." });
    }
    if (!Number.isInteger(weaponId) || weaponId <= 0) {
      return res.status(400).json({ message: "weapon_id invalido." });
    }
    if (!Number.isInteger(quantityNumber) || quantityNumber <= 0) {
      return res.status(400).json({ message: "quantity debe ser entero mayor que 0." });
    }

    const [inventoryRows] = await pool.query("SELECT id FROM inventories WHERE id = ?", [inventoryId]);
    if (!inventoryRows.length) {
      return res.status(404).json({ message: "Inventario no encontrado." });
    }

    const [weaponRows] = await pool.query("SELECT id FROM weapons WHERE id = ?", [weaponId]);
    if (!weaponRows.length) {
      return res.status(404).json({ message: "Arma no encontrada." });
    }

    const skinId = await resolveSkinIdForWeapon(weaponId);
    if (!skinId) {
      return res.status(400).json({ message: "No fue posible resolver skin_id tecnico." });
    }

    const [existingRows] = await pool.query(
      `SELECT id, quantity
       FROM inventory_weapons
       WHERE inventory_id = ? AND weapon_id = ? AND skin_id = ?`,
      [inventoryId, weaponId, skinId]
    );

    if (existingRows.length) {
      const existing = existingRows[0];
      await pool.query("UPDATE inventory_weapons SET quantity = ? WHERE id = ?", [
        existing.quantity + quantityNumber,
        existing.id,
      ]);
    } else {
      await pool.query(
        "INSERT INTO inventory_weapons (inventory_id, weapon_id, skin_id, quantity) VALUES (?, ?, ?, ?)",
        [inventoryId, weaponId, skinId, quantityNumber]
      );
    }

    return res.status(200).json({ message: "Arma agregada al inventario." });
  } catch (error) {
    return next(error);
  }
}

async function removeWeaponFromInventory(req, res, next) {
  try {
    const inventoryId = Number(req.params.inventoryId);
    const weaponId = Number(req.params.weaponId);

    if (!Number.isInteger(inventoryId) || inventoryId <= 0) {
      return res.status(400).json({ message: "inventoryId invalido." });
    }
    if (!Number.isInteger(weaponId) || weaponId <= 0) {
      return res.status(400).json({ message: "weaponId invalido." });
    }

    const [result] = await pool.query(
      "DELETE FROM inventory_weapons WHERE inventory_id = ? AND weapon_id = ?",
      [inventoryId, weaponId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Relacion inventario-arma no encontrada." });
    }

    return res.status(200).json({ message: "Arma eliminada del inventario." });
  } catch (error) {
    return next(error);
  }
}

async function resolveInventoryByUserId(userId) {
  const [userRows] = await pool.query("SELECT id FROM users WHERE id = ?", [userId]);
  if (!userRows.length) {
    return { error: "Usuario no encontrado." };
  }

  const [inventoryRows] = await pool.query("SELECT id FROM inventories WHERE user_id = ?", [userId]);
  if (inventoryRows.length) {
    return { inventoryId: inventoryRows[0].id };
  }

  const [insertResult] = await pool.query("INSERT INTO inventories (user_id) VALUES (?)", [userId]);
  return { inventoryId: insertResult.insertId };
}

async function addSkinToUserInventory(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const skinId = Number(req.body.skin_id);
    const quantity = req.body.quantity === undefined ? 1 : Number(req.body.quantity);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "userId invalido." });
    }
    if (!Number.isInteger(skinId) || skinId <= 0) {
      return res.status(400).json({ message: "skin_id invalido." });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "quantity debe ser entero mayor que 0." });
    }

    const inventoryResolution = await resolveInventoryByUserId(userId);
    if (inventoryResolution.error) {
      return res.status(404).json({ message: inventoryResolution.error });
    }

    const [skinRows] = await pool.query("SELECT id, weapon_id FROM skins WHERE id = ?", [skinId]);
    if (!skinRows.length) {
      return res.status(404).json({ message: "Skin no encontrada." });
    }

    const inventoryId = inventoryResolution.inventoryId;
    const weaponId = skinRows[0].weapon_id;

    const [existingRows] = await pool.query(
      "SELECT id, quantity FROM inventory_weapons WHERE inventory_id = ? AND weapon_id = ? AND skin_id = ?",
      [inventoryId, weaponId, skinId]
    );

    if (existingRows.length) {
      await pool.query("UPDATE inventory_weapons SET quantity = ? WHERE id = ?", [
        existingRows[0].quantity + quantity,
        existingRows[0].id,
      ]);
    } else {
      await pool.query(
        "INSERT INTO inventory_weapons (inventory_id, weapon_id, skin_id, quantity) VALUES (?, ?, ?, ?)",
        [inventoryId, weaponId, skinId, quantity]
      );
    }

    return res.status(200).json({ message: "Skin agregada al inventario del usuario." });
  } catch (error) {
    return next(error);
  }
}

async function updateUserInventorySkin(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const inventoryWeaponId = Number(req.params.inventoryWeaponId);
    const nextSkinIdRaw = req.body.skin_id;
    const quantityRaw = req.body.quantity;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "userId invalido." });
    }
    if (!Number.isInteger(inventoryWeaponId) || inventoryWeaponId <= 0) {
      return res.status(400).json({ message: "inventoryWeaponId invalido." });
    }
    if (nextSkinIdRaw === undefined && quantityRaw === undefined) {
      return res.status(400).json({ message: "Debes enviar skin_id y/o quantity." });
    }

    const [rowSet] = await pool.query(
      `SELECT iw.id, iw.inventory_id, iw.weapon_id, iw.skin_id, iw.quantity
       FROM inventory_weapons iw
       INNER JOIN inventories i ON i.id = iw.inventory_id
       WHERE iw.id = ? AND i.user_id = ?`,
      [inventoryWeaponId, userId]
    );

    if (!rowSet.length) {
      return res.status(404).json({ message: "Item de inventario no encontrado para ese usuario." });
    }

    const current = rowSet[0];
    let nextSkinId = current.skin_id;
    let nextWeaponId = current.weapon_id;
    let nextQuantity = current.quantity;

    if (nextSkinIdRaw !== undefined) {
      const parsedSkinId = Number(nextSkinIdRaw);
      if (!Number.isInteger(parsedSkinId) || parsedSkinId <= 0) {
        return res.status(400).json({ message: "skin_id invalido." });
      }
      const [skinRows] = await pool.query("SELECT id, weapon_id FROM skins WHERE id = ?", [parsedSkinId]);
      if (!skinRows.length) {
        return res.status(404).json({ message: "Skin no encontrada." });
      }
      nextSkinId = skinRows[0].id;
      nextWeaponId = skinRows[0].weapon_id;
    }

    if (quantityRaw !== undefined) {
      const parsedQuantity = Number(quantityRaw);
      if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
        return res.status(400).json({ message: "quantity debe ser entero mayor que 0." });
      }
      nextQuantity = parsedQuantity;
    }

    await pool.query(
      "UPDATE inventory_weapons SET weapon_id = ?, skin_id = ?, quantity = ? WHERE id = ?",
      [nextWeaponId, nextSkinId, nextQuantity, inventoryWeaponId]
    );

    return res.status(200).json({ message: "Skin de inventario actualizada." });
  } catch (error) {
    return next(error);
  }
}

async function removeSkinFromUserInventory(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const inventoryWeaponId = Number(req.params.inventoryWeaponId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "userId invalido." });
    }
    if (!Number.isInteger(inventoryWeaponId) || inventoryWeaponId <= 0) {
      return res.status(400).json({ message: "inventoryWeaponId invalido." });
    }

    const [result] = await pool.query(
      `DELETE iw
       FROM inventory_weapons iw
       INNER JOIN inventories i ON i.id = iw.inventory_id
       WHERE iw.id = ? AND i.user_id = ?`,
      [inventoryWeaponId, userId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Item de inventario no encontrado para ese usuario." });
    }

    return res.status(200).json({ message: "Skin eliminada del inventario del usuario." });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getInventoryByUserId,
  getAllInventories,
  addWeaponToInventory,
  removeWeaponFromInventory,
  addSkinToUserInventory,
  updateUserInventorySkin,
  removeSkinFromUserInventory,
};
