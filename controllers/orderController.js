const nodemailer = require('nodemailer')
const db = require('../models')
const Order = db.Order
const Cart = db.Cart
const OrderItem = db.OrderItem
const Product = db.Product

// 藍新金流串接
const crypto = require('crypto')
const URL = process.env.URL
const MerchantID = process.env.MERCHANT_ID
const HashKey = process.env.HASH_KEY
const HashIV = process.env.HASH_IV
const PayGateWay = "https://ccore.spgateway.com/MPG/mpg_gateway"
const ReturnURL = URL + "/spgateway/callback?from=ReturnURL"
const NotifyURL = URL + "/spgateway/callback?from=NotifyURL"
const ClientBackURL = URL + "/orders"

function genDataChain(TradeInfo) {
  let results = [];
  for (let kv of Object.entries(TradeInfo)) {
    results.push(`${kv[0]}=${kv[1]}`);
  }
  return results.join("&");
}

// encrypt
function create_mpg_aes_encrypt(TradeInfo) {
  let encrypt = crypto.createCipheriv("aes256", HashKey, HashIV);
  let enc = encrypt.update(genDataChain(TradeInfo), "utf8", "hex");
  return enc + encrypt.final("hex");
}
// hash
function create_mpg_sha_encrypt(TradeInfo) {
  let sha = crypto.createHash("sha256");
  let plainText = `HashKey=${HashKey}&${TradeInfo}&HashIV=${HashIV}`

  return sha.update(plainText).digest("hex").toUpperCase();
}

// decrypt
function create_mpg_aes_decrypt(TradeInfo) {
  let decrypt = crypto.createDecipheriv("aes256", HashKey, HashIV);
  decrypt.setAutoPadding(false);
  let text = decrypt.update(TradeInfo, "hex", "utf8");
  let plainText = text + decrypt.final("utf8");
  let result = plainText.replace(/[\x00-\x20]+/g, "");
  return result;
}


function getTradeInfo(Amt, Desc, email) {

  console.log('===== getTradeInfo =====')
  console.log(Amt, Desc, email)
  console.log('==========')

  data = {
    'MerchantID': MerchantID, // 商店代號
    'RespondType': 'JSON', // 回傳格式
    'TimeStamp': Date.now(), // 時間戳記
    'Version': 1.5, // 串接程式版本
    'MerchantOrderNo': Date.now(), // 商店訂單編號
    'LoginType': 0, // 智付通會員
    'OrderComment': 'OrderComment', // 商店備註
    'Amt': Amt, // 訂單金額
    'ItemDesc': Desc, // 產品名稱
    'Email': email, // 付款人電子信箱
    'ReturnURL': ReturnURL, // 支付完成返回商店網址
    'NotifyURL': NotifyURL, // 支付通知網址/每期授權結果通知
    'ClientBackURL': ClientBackURL, // 支付取消返回商店網址
  }

  console.log('===== getTradeInfo: data =====')
  console.log(data)


  mpg_aes_encrypt = create_mpg_aes_encrypt(data)
  mpg_sha_encrypt = create_mpg_sha_encrypt(mpg_aes_encrypt)

  console.log('===== getTradeInfo: mpg_aes_encrypt, mpg_sha_encrypt =====')
  console.log(mpg_aes_encrypt)
  console.log(mpg_sha_encrypt)

  tradeInfo = {
    'MerchantID': MerchantID, // 商店代號
    'TradeInfo': mpg_aes_encrypt, // 加密後參數
    'TradeSha': mpg_sha_encrypt,
    'Version': 1.5, // 串接程式版本
    'PayGateWay': PayGateWay,
    'MerchantOrderNo': data.MerchantOrderNo,
  }

  console.log('===== getTradeInfo: tradeInfo =====')
  console.log(tradeInfo)

  return tradeInfo
}


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'zjps3407@gmail.com',
    pass: process.env.GMAIL_PASSWORD
  },
});

const orderController = {
  getOrders: async (req, res) => {
    try {
      const orders = await Order.findAll({
        include: 'items'
      })

      const ordersJSON = orders.map(order => order.toJSON())

      return res.render('orders', { orders: ordersJSON, })
    } catch (err) {
      console.log(err)
    }
  },
  postOrder: async (req, res) => {
    try {
      const { cartId, name, address, phone, shipping_status, payment_status, amount } = req.body
      const findCart = Cart.findByPk(cartId, { include: [{ model: Product, as: 'items' }] })
      // Cart{id:..., items: [...]}
      const createOrder = Order.create({
        name,
        address,
        phone,
        shipping_status,
        payment_status,
        amount
      })

      const [cart, order] = await Promise.all([findCart, createOrder])

      const createOrderItems = cart.items.map(product => {
        return OrderItem.create({
          OrderId: order.id,
          ProductId: product.id,
          price: product.price,
          quantity: product.CartItem.quantity
        })
      })

      const mailOptions = {
        from: 'zjps3407@gmail.com',
        to: 'zjps3407+AC@gmail.com',
        subject: `${order.id} 訂單成立`,
        text: `${order.id} 訂單成立`,
      }

      const mailSent = await transporter.sendMail(mailOptions)
      await Promise.all([...createOrderItems, mailSent])

      console.log('Email sent: ' + mailSent.response) // email sent success message

      return res.redirect('/orders')
    } catch (err) {
      console.log(err)
    }

  },
  cancelOrder: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id)
      await order.update({
        ...req.body,
        shipping_status: '-1',
        payment_status: '-1'
      })
      return res.redirect('back')
    } catch (err) {
      console.log(err)
    }

  },
  getPayment: async (req, res) => {
    try {
      console.log('===== getPayment =====')
      console.log(req.params.id)
      console.log('==========')

      const order = await Order.findByPk(req.params.id)
      const tradeInfo = getTradeInfo(order.amount, '產品名稱', 'zjps3407@gmail.com')

      console.log('========= req.body ===========')
      console.log(req.body)

      console.log('========= tradeInfo ===========')
      console.log(tradeInfo)

      const snUpdatedOrder = await order.update({
        ...req.body,
        sn: tradeInfo.MerchantOrderNo
      })

      return res.render('payment', {
        order: snUpdatedOrder,
        tradeInfo
      })
    } catch (err) {
      console.log(err)
    }

  },
  spgatewayCallback: async (req, res) => {
    console.log('===== spgatewayCallback =====')
    console.log(req.method)
    console.log(req.query)
    console.log(req.body)
    console.log('==========')

    console.log('===== spgatewayCallback: TradeInfo =====')
    console.log(req.body.TradeInfo)

    // 解密藍新付款成功的notificaiton
    const data = JSON.parse(create_mpg_aes_decrypt(req.body.TradeInfo))

    console.log('===== spgatewayCallback: create_mpg_aes_decrypt、data =====')
    console.log(data)

    const orders = await Order.findAll({
      where: { sn: data.Result.MerchantOrderNo }
    })

    await orders[0].update({
      ...req.body,
      payment_status: 1
    })

    return res.redirect('/orders')

  }
}

module.exports = orderController