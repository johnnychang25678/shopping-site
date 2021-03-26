/* eslint-disable no-undef */
const assert = require('assert')
const request = require('supertest')
const sinon = require('sinon')
const chai = require('chai')
const app = require('../../app')
const db = require('../../models')

const should = chai.should()

const { Product } = db

describe('Test product routes', () => {
  before(async () => {
    // clear db
    await Product.destroy({
      where: {},
      truncate: true,
    })
    // create dummy data
    await Product.bulkCreate([
      {
        name: 'name',
        description: 'description',
        price: 1000,
        image: 'image',
      },
      {
        name: 'name2',
        description: 'description2',
        price: 1500,
        image: 'image2',
      },
    ])
  })
  it('GET /products, should return all products', (done) => {
    request(app)
      .get('/products')
      .expect((res) => {
        res.text.should.include('name')
        res.text.should.include('name2')
      })
      .end((err, res) => {
        if (err) return done(err)
        return done()
      })
  })
  it('GET /products/:id', (done) => {
    request(app)
      .get('/products/1')
      .expect((res) => {
        res.text.should.include('name')
      })
      .end((err, res) => {
        if (err) return done(err)
        return done()
      })
  })

  after(async () => {
    // clear db
    await Product.destroy({
      where: {},
      truncate: true,
    })
  })
})
