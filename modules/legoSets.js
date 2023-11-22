
require('dotenv').config(); //enabless us to use process.env
const Sequelize = require('sequelize');
// set up sequelize to point to our postgres database
let sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

// Define a "Project" model
const Theme = sequelize.define(
  'Theme',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true, // use "id" as a primary key
      autoIncrement: true, // automatically increment the value
    },
    name: Sequelize.STRING,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);


const Set = sequelize.define(
  'Set',
  {
    set_num: {
      type: Sequelize.STRING,
      primaryKey: true, // use "set_num" as a primary key
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

//type of relationship
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

sequelize.sync()
  .then(() => { console.log("data synched") })
  .catch(err => { console.log(err) })

function initialize() {
  return new Promise(async (resolve, reject) => {
    try {
      await sequelize.sync();
      resolve();
    }
    catch (error) {
      reject(error.message);
    }
  });
};


function getAllSets() {
  return new Promise((resolve, reject) => {
    Set.findAll({ include: [Theme] })
      .then((sets) => { resolve(sets) })
      .catch((err) => { reject(err.message) });
  })
};


function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    Set.findAll({ where: { set_num: setNum }, include: [Theme] })
      .then((sets) => { resolve(sets[0]) })
      .catch((err) => { reject("Unable to find requested set") })
  });
};




function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    Set.findAll({ include: [Theme], where: { '$Theme.name$': { [Sequelize.Op.iLike]: `%${theme}%` } } })
      .then((themenew) => { resolve(themenew); })
      .catch((err) => { reject("Unable to find requested sets"); });
  });
};

function addSet(setData) {
  return new Promise((resolve, reject) => {
    Set.create({
      set_num: setData.set_num,
      name: setData.name,
      year: setData.year,
      num_parts: setData.num_parts,
      theme_id: setData.theme_id,
      img_url: setData.img_url
    })
      .then(() => { resolve() })
      .catch((err) => { reject(err.errors[0].message) });
  });
}

function getAllThemes() {
  return new Promise(async (resolve, reject) => {
    try {
      let allThemes = await Theme.findAll();
      resolve(allThemes);
    }
    catch (error) { reject(error) }
  });
}

function editSet(set_num, setData) {
  return new Promise(async (resolve, reject) => {
    try {
      const s = await Set.findOne({ where: { set_num: set_num } });
      if (s) {
        await s.update(setData);
        resolve();
      } else { reject("Set not found") }
    }
    catch (err) { reject(err.errors[0].message) }
  });
}

function deleteSet(set_num) {
  return new Promise(async (resolve, reject) => {
    try {
      const s = await Set.findOne({
        where: { set_num: set_num }
      });
      if (s) {
        await s.destroy();
        resolve();
      }
      else{reject("Set not found")}
    }
    catch(error){
      reject (err.errors[0].message)
    }
  });
}
module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, getAllThemes, addSet, editSet, deleteSet }
