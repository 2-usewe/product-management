const app = require('./app');
require('dotenv').config();
const port = process.env.PORT || 3000;
const {sequelize} = require('./models/product');


app.listen(port, () =>
  console.log(`Server running on port ${port}, http://localhost:${port}`)
);