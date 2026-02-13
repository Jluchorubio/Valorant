
const db =require('../config/db');exports.obtenerProductos =(req, res) => {
    
    db.query('SELECT * FROM productos',(err, results) => {
        if (err)return res.status(500).json({error:'Error en consulta' });
    res.json(results);
    });
};

exports.obtenerProductoPorId =(req, res) => {
    const id = req.params.id;

    db.query('SELECT * FROM productos WHERE id = ?', [id],(err, results) => {
        if (err)return res.status(500).json({error:'Error en consulta' });
        if (results.length ===0) {
            return res.status(404).json({error:'Producto no encontrado' });
        }

    res.json(results[0]);
    });
};

exports.crearProducto =(req, res) => {const { nombre, precio } = req.body;

    db.query('INSERT INTO productos (nombre, precio) VALUES (?, ?)',
        [nombre, precio],(err, result) => {if (err)return res.status(500).json({error:'Error al insertar' });

        res.status(201).json({mensaje:'Producto creado' });
        }
    );
};

exports.actualizarProducto =(req, res) => {const id = req.params.id;const { nombre, precio } = req.body;

  db.query('UPDATE productos SET nombre = ?, precio = ? WHERE id = ?',
    [nombre, precio, id],(err, result) => {if (err)return res.status(500).json({error:'Error al actualizar' });

      res.json({mensaje:'Producto actualizado' });
    }
  );
};

exports.eliminarProducto =(req, res) => {const id = req.params.id;

  db.query('DELETE FROM productos WHERE id = ?', [id],(err, result) => {if (err)return res.status(500).json({error:'Error al eliminar' });

    res.json({mensaje:'Producto eliminado' });
  });
};