const express = require('express');
const admin = require('firebase-admin');
const app = express();
const bcryptjs = require('bcryptjs');

admin.initializeApp({
    credential: admin.credential.cert('./permissions.json'),
    databaseURL: "https://fb-api-9406c.firebaseio.com"
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor Express en ejecución en el puerto ${port}`);
});

app.get('/hello-word', (req, res) => {
    return res.status(200).json({ message: 'Hello Word' })
});

app.use(require('./routes/products.routes'))
