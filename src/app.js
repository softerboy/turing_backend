require('dotenv-flow').config()

const Koa = require('koa')
const { ApolloServer } = require('apollo-server-koa')
const { importSchema } = require('graphql-import')

const typeDefs = importSchema('src/schema.graphql')
const resolvers = require('./resolvers')
const db = require('./db')

const context = {
  db,
}

const app = new Koa()
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  context,
})

server.applyMiddleware({ app })

const port = process.env.PORT
app.listen({ port }, () => console.log(`App listens on port ${port}`))
