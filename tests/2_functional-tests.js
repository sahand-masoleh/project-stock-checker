const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const URL = '/api/stock-prices'

suite('Functional Tests', function() {
  test('get one stock', (done)=>{
    chai
    .request(server)
    .get(URL)
    .query({stock: 'goog'})
    .end((err, res)=>{
      assert.property(res.body, 'stockData')
      done()
    }) 
  })

  test('propery types', (done)=>{
    chai
    .request(server)
    .get(URL)
    .query({stock: 'goog'})
    .end((err,res)=>{
      assert.isString(res.body.stockData.stock)
      assert.isNumber(res.body.stockData.price)
      assert.isNumber(res.body.stockData.likes)
      done()
    })
  })

  test('pass a boolean like value', done=>{
    chai
    .request(server)
    .get(URL)
    .query({stock: 'goog', like: true})
    .end((err, res)=>{
      assert.equal(res.status, 200)
      done()
    })
  })

  test('get two stocks', done=>{
    chai
    .request(server)
    .get(URL)
    .query({stock: ['goog','msft']})
    .end((err, res)=>{
      assert.isArray(res.body.stockData)
      assert.propertyVal(res.body.stockData[0], 'stock', 'GOOG')
      assert.property(res.body.stockData[0], 'rel_likes')
      assert.propertyVal(res.body.stockData[1], 'stock', 'MSFT')
      assert.property(res.body.stockData[1], 'rel_likes')
      done()
    })
  })

    test('pass a boolean like value for two stocks', done=>{
    chai
    .request(server)
    .get(URL)
    .query({stock: ['goog', 'msft'], like: true})
    .end((err, res)=>{
      assert.equal(res.status, 200)
      done()
    })
  })
});
