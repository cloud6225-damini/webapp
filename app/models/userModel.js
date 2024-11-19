const { DataTypes } = require('sequelize');
const { sequelize } = require('../databaseConfig/databaseConnect');
const ProfilePic = require('./profilePicModel'); 
const VerificationToken = require('./verificationEmailModel.js');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  account_created: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  account_updated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: false,
  hooks: {
    beforeCreate: (user) => {
      user.account_created = new Date();
      user.account_updated = new Date();
    },
    beforeUpdate: (user) => {
      user.account_updated = new Date();
    },
  },
});

// Define relationships with constraints change this to sing file
User.hasOne(ProfilePic, { foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
ProfilePic.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

User.hasOne(VerificationToken, { foreignKey: 'email', sourceKey: 'email', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
VerificationToken.belongsTo(User, { foreignKey: 'email', targetKey: 'email', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

module.exports = User;