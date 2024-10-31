const { DataTypes } = require('sequelize');
const { sequelize } = require('../databaseConfig/databaseConnect');

const ProfilePic = sequelize.define('ProfilePic', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  s3Key: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  uploadDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users', 
      key: 'id'
    }
  }
}, {
  timestamps: false,
});

module.exports = ProfilePic;