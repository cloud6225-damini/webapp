const { DataTypes } = require('sequelize');
const { sequelize } = require('../databaseConfig/databaseConnect');

const VerificationToken = sequelize.define('VerificationToken', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
  instanceMethods: {
    isExpired() {
      const expiryTime = 2 * 60 * 1000; // 2 minutes in milliseconds
      return Date.now() - this.created_at.getTime() > expiryTime;
    },
  },
});

module.exports = VerificationToken;