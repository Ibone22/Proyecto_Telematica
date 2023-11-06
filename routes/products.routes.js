const { Router } = require("express");
const router = Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const bcryptjs = require('bcryptjs');

// Create product
router.post("/api/products", async (req, res) => {
  try {
    await db
      .collection("products")
      .doc()
      .create({ name: req.body.name });
    return res.status(200).json();
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.get("/api/products/:product_id", (req, res) => {
  (async () => {
    try {
      const doc = db.collection("products").doc(req.params.product_id);
      const item = await doc.get();
      const response = item.data().name;
      return res.status(200).send(response);
    } catch (error) {
      return res.status(500).send(error);
    }
  })();
});

router.get("/api/products", async (req, res) => {
  try {
    let query = db.collection("products");
    const querySnapshot = await query.get();
    let docs = querySnapshot.docs;

    const response = docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      cantidad: doc.data().cantidad,
      precio: doc.data().precio
    }));

    return res.status(200).json(response[1]);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.put("/api/products/:product_id", async (req, res) => {
  try {
    const document = db.collection("products").doc(req.params.product_id);
    await document.update({
      name: req.body.name,
    });
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json();
  }
});

router.delete("/api/products/:product_id", async (req, res) => {
  try {
    const doc = db.collection("products").doc(req.params.product_id);
    await doc.delete();
    return res.status(200).json();
  } catch (error) {
    return res.status(500).send(error);
  }
});

// Create user
router.post("/api/users", async (req, res) => {
  try {
    await db
      .collection("users")
      .doc("/" + req.body.id + "/")
      .create({ name: req.body.name });
    return res.status(200).json();
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.get("/api/users/:users_id", (req, res) => {
  (async () => {
    try {
      const doc = db.collection("users").doc(req.params.users_id);
      const item = await doc.get();
      const response = item.data();
      return res.status(200).send(response);
    } catch (error) {
      return res.status(500).send(error);
    }
  })();
});

router.get("/api/users", async (req, res) => {
  try {
    let query = db.collection("users");
    const querySnapshot = await query.get();
    let docs = querySnapshot.docs;

    const response = docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      email: doc.data().cantidad
    }));

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.put("/api/users/:users_id", async (req, res) => {
  try {
    const document = db.collection("users").doc(req.params.users_id);
    await document.update({
      name: req.body.name,
    });
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json();
  }
});

router.delete("/api/users/:users_id", async (req, res) => {
  try {
    const doc = db.collection("users").doc(req.params.users_id);
    await doc.delete();
    return res.status(200).json();
  } catch (error) {
    return res.status(500).send(error);
  }
});
//Creación usuario administrador
router.post("/create/admin", async (req, res) => {
  
  const password = req.body.password;

  try {
    let passwordHash = await bcryptjs.hash(password,8);
    await db
      .collection("admin")
      .doc(req.body.user)
      .create({user: req.body.user, password: passwordHash});
    return res.status(200).json();
  } catch (error) {
    return res.status(500).send(error);
  }
});

//Autenticación de usuario administrador
router.post("/login/admin", async (req, res) => {
  const userIn = req.body.user;
  const passwordIn = req.body.password;
  const docRef = db.collection("admin").doc(userIn);

  try {
    const doc = await docRef.get();

    if (doc.exists) {
      const password = doc.data().password;
      let compare = bcryptjs.compareSync(passwordIn, password);
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

//Creación usuario cliente
router.post("/create/users", async (req, res) => {
  
  const password = req.body.password;

  try {
    let passwordHash = await bcryptjs.hash(password,8);
    await db
      .collection("users")
      .doc(req.body.user)
      .create({user: req.body.user, password: passwordHash});
    return res.status(200).json();
  } catch (error) {
    return res.status(500).send(error);
  }
});

//Autenticación de usuario cliente
router.post("/login/users", async (req, res) => {
  const userIn = req.body.user;
  const passwordIn = req.body.password;
  const docRef = db.collection("users").doc(userIn);

  try {
    const doc = await docRef.get();

    if (doc.exists) {
      const password = doc.data().password;
      let compare = bcryptjs.compareSync(passwordIn, password);
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
  
module.exports = router;