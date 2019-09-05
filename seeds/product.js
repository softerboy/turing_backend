const faker = require('faker')

const tableName = 'product'

function randomBetween(min, max) {
  return Math.random() * (max - min + 1) + min
}

exports.seed = function(knex) {
  const entries = []
  for (let i = 0; i < 20; i++) {
    entries.push({
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      price: randomBetween(12, 23).toFixed(2),
      discounted_price: randomBetween(12, 23).toFixed(2),
      image: faker.random.image(),
      image_2: faker.random.image(),
      thumbnail: faker.random.image(),
    })
  }

  // Deletes ALL existing entries
  return knex(tableName)
    .del()
    .then(function() {
      // Inserts seed entries
      return knex(tableName).insert(entries)
    })
}
