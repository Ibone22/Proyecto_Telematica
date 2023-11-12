const { Router } = require("express");
const router = Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const bcryptjs = require('bcryptjs');

// Create product
router.post("/create/product", async (req, res) => {
  try {
    const { name, cantidad, precio } = req.body;

    if (!name || !cantidad || !precio) {
      return res.status(400).json({ error: 'Debes proporcionar nombre, cantidad y precio.' });
    }

    await db
      .collection("products")
      .doc()
      .create({ name, cantidad, precio });

    return res.status(200).json({ message: 'Producto creado exitosamente.' });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    return res.status(500).send(error);
  }
});
//get the characteristics of a specific product
router.get("/products/:product_id", async (req, res) => {
  try {
    const doc = db.collection("products").doc(req.params.product_id);
    const item = await doc.get();

    if (!item.exists) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    const data = item.data();
    const response = {
      name: data.name,
      cantidad: data.cantidad,
      precio: data.precio
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    return res.status(500).send(error);
  }
});
//get product list
router.get("/products", async (req, res) => {
  try {
    let query = db.collection("products");
    const querySnapshot = await query.get();
    let docs = querySnapshot.docs;

    const response = docs.map((doc) => ({
      name: doc.data().name,
      cantidad: doc.data().cantidad,
      precio: doc.data().precio
    }));

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
});
//Update product features
router.put("/products/:product_id", async (req, res) => {
  try {
    const document = db.collection("products").doc(req.params.product_id);
    const updateData = {};

    if (req.body.name) {
      updateData.name = req.body.name;
    }

    if (req.body.cantidad) {
      updateData.cantidad = req.body.cantidad;
    }

    if (req.body.precio) {
      updateData.precio = req.body.precio;
    }

    await document.update(updateData);

    return res.status(200).json();
  } catch (error) {
    return res.status(500).json();
  }
});
//delete product
router.delete("/products/delete/:product_id", async (req, res) => {
  try {
    const doc = db.collection("products").doc(req.params.product_id);
    await doc.delete();
    return res.status(200).json('Product was deleted successfully');
  } catch (error) {
    return res.status(500).send(error);
  }
});
///////////////////////////////////////////////////////////////////////////////////////
//Create admin user
router.post("/create/admin", async (req, res) => {
  try {
    const { user, password, email } = req.body; 

    if (!user || !password || !email) {
      return res.status(400).json('Se requieren el nombre de usuario, la contraseña y el correo electrónico.');
    }

    let passwordHash = await bcryptjs.hash(password, 8);

    await db
      .collection("admin")
      .doc(user)
      .create({ user, password: passwordHash, email });

    return res.status(200).json('Admin User was created');
  } catch (error) {
    return res.status(500).send(error);
  }
});
//admin user authentication
router.post("/login/admin", async (req, res) => {
  const { user, password } = req.body; // Desestructura el objeto req.body

  if (!user || !password) {
    return res.status(400).json('Se requieren tanto el nombre de usuario como la contraseña.');
  }

  const docRef = db.collection("admin").doc(user);

  try {
    const doc = await docRef.get();

    if (doc.exists) {
      const storedPassword = doc.data().password;
      const compare = bcryptjs.compareSync(password, storedPassword);

      if (compare) {
        return res.status(200).json("¡AUTENTICACIÓN EXITOSA!");
      } else {
        return res.status(401).json('Contraseña incorrecta');
      }
    } else {
      return res.status(404).send("Usuario no encontrado");
    }
  } catch (error) {
    console.error("Error al verificar el documento:", error);
    return res.status(500).json(error);
  }
});
//get admin users
router.get("/users/admin", async (req, res) => {
  try {
    let query = db.collection("admin");
    const querySnapshot = await query.get();
    let docs = querySnapshot.docs;

    const response = docs.map((doc) => ({
      user: doc.data().user,
      email: doc.data().email
    }));

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
});
//Update admin users
router.put("/users/admin/:users_id", async (req, res) => {
  try {
    const users_id = req.params.users_id;
    const { user, password, email } = req.body;

    const document = db.collection("admin").doc(users_id);
    const name = await document.get();

    if (!name.exists) {
      return res.status(404).json('Usuario no encontrado');
    }

    let updatedFields = {};

    if (user) {
      updatedFields.user = user;
    }

    if (password) {
      const passwordHash = await bcryptjs.hash(password, 8);
      updatedFields.password = passwordHash;
    }

    if (email) {
      updatedFields.email = email;
    }

    await document.update(updatedFields);

    return res.status(200).json('Usuario administrador actualizado correctamente');
  } catch (error) {
    return res.status(500).send(error);
  }
});
//delete admin user
router.delete("/users/admin/delete/:users_id", async (req, res) => {
  try {
    const users_id = req.params.users_id;

    if (!users_id) {
      return res.status(400).json('Se requiere el ID del usuario administrador.');
    }

    const document = db.collection("admin").doc(users_id);
    const user = await document.get();

    if (!user.exists) {
      return res.status(404).json('Usuario administrador no encontrado');
    }

    await document.delete();

    return res.status(200).json('Usuario administrador eliminado correctamente');
  } catch (error) {
    console.error("Error al eliminar el usuario administrador:", error);
    return res.status(500).json(error);
  }
});
//Create customer user
router.post("/create/users", async (req, res) => {
  try {
    const { user, password, email } = req.body; 

    if (!user || !password || !email) {
      return res.status(400).json('Se requieren el nombre de usuario, la contraseña y el correo electrónico.');
    }

    let passwordHash = await bcryptjs.hash(password, 8);

    await db
      .collection("users")
      .doc(user)
      .create({ user, password: passwordHash, email });

    return res.status(200).json('Customer User was created');
  } catch (error) {
    return res.status(500).send(error);
  }
});
//Customer user authentication
router.post("/login/users", async (req, res) => {
  const { user, password } = req.body; 

  if (!user || !password) {
    return res.status(400).json('Se requieren tanto el nombre de usuario como la contraseña.');
  }

  const docRef = db.collection("users").doc(user);

  try {
    const doc = await docRef.get();

    if (doc.exists) {
      const storedPassword = doc.data().password;
      const compare = bcryptjs.compareSync(password, storedPassword);

      if (compare) {
        return res.status(200).json("¡AUTENTICACIÓN EXITOSA!");
      } else {
        return res.status(401).json('Contraseña incorrecta');
      }
    } else {
      return res.status(404).send("Usuario no encontrado");
    }
  } catch (error) {
    console.error("Error al verificar el documento:", error);
    return res.status(500).json(error);
  }
});
//get customer users
router.get("/users", async (req, res) => {
  try {
    let query = db.collection("users");
    const querySnapshot = await query.get();
    let docs = querySnapshot.docs;

    const response = docs.map((doc) => ({
      user: doc.data().user,
      email: doc.data().email
    }));

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
});
//Update customer user
router.put("/users/:users_id", async (req, res) => {
  try {
    const users_id = req.params.users_id;
    const { user, password, email } = req.body;

    const document = db.collection("users").doc(users_id);
    const name = await document.get();

    if (!name.exists) {
      return res.status(404).json('Usuario no encontrado');
    }

    let updatedFields = {};

    if (user) {
      updatedFields.user = user;
    }

    if (password) {
      const passwordHash = await bcryptjs.hash(password, 8);
      updatedFields.password = passwordHash;
    }

    if (email) {
      updatedFields.email = email;
    }

    await document.update(updatedFields);

    return res.status(200).json('Usuario administrador actualizado correctamente');
  } catch (error) {
    return res.status(500).send(error);
  }
});
//delete customer user
router.delete("/users/delete/:users_id", async (req, res) => {
  try {
    const users_id = req.params.users_id;

    if (!users_id) {
      return res.status(400).json('Se requiere el ID del usuario administrador.');
    }

    const document = db.collection("users").doc(users_id);
    const user = await document.get();

    if (!user.exists) {
      return res.status(404).json('Usuario no encontrado');
    }

    await document.delete();

    return res.status(200).json('Usuario eliminado correctamente');
  } catch (error) {
    console.error("Error al eliminar el usuario administrador:", error);
    return res.status(500).json(error);
  }
});
  
module.exports = router;