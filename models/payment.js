const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Payment.belongsTo(models.Order)
    }
  }
  Payment.init(
    {
      amount: DataTypes.INTEGER,
      sn: DataTypes.STRING(1024),
      payment_method: DataTypes.STRING,
      paid_at: DataTypes.DATE,
      params: DataTypes.TEXT,
      OrderId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Payment',
    }
  )
  return Payment
}
