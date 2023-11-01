const { Sequelize, DataTypes } = require('sequelize')
const { DATABASE_NAME,
    DATABASE_USERNAME,
    DATABASE_PASSWORD } = require('../config/db');


// Create an instance of sequelize
const sequelize =
    new Sequelize('abhidb1',
        DATABASE_USERNAME,
        DATABASE_PASSWORD, {
        host: 'localhost',
        dialect: 'mysql'
    })

// Validate and connect to the database
sequelize.authenticate()
    .then(() => console.log('Successfully connected to db!'))
    .catch((error) => console.log('Failed to connect db:', error))

// Define the student model 
const Products = sequelize.define('products', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  name: DataTypes.STRING,
  image:DataTypes.STRING,
  price:DataTypes.INTEGER,
  createdAt:DataTypes.INTEGER,
  updatedAt:DataTypes.INTEGER,
},{timestamps:false});

module.exports = {sequelize,Products}
