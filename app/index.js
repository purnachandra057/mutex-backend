const express = require('express')
const bodyParser = require('body-parser')
const errorHandler = require('../middlewares/errorHandler')
const { PrismaClient } = require('@prisma/client')
const asyncWrapper = require('../lib/asyncWrapper')

const app = express()
const prisma = new PrismaClient()

app.use(bodyParser.json())

app.get(
    '/',
    asyncWrapper(async (req, res, next) => {
        const userCount = await prisma.user.count()
        res.json({ userCount })
    })
)

app.use(errorHandler)

module.exports = app
