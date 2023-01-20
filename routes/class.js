const express = require('express')
const prisma = require('../app/db')
const asyncWrapper = require('../lib/asyncWrapper')
const auth = require('../middlewares/auth')
const student = require('../middlewares/student')
const classSchema = require('../schemas/class')
const router = express.Router()

router.use(auth, student)

router.post(
    '/',
    asyncWrapper(async (req, res, next) => {
        const user = req.user
        const student = req.student

        if (student.enroll)
            throw { message: 'student can enroll in only one class' }

        const { error, value: classData } = classSchema.validate(req.body)
        if (error) throw { message: error.message, status: 400 }

        const newClass = await prisma.$transaction(async (tx) => {
            // Create a class
            const newClass = await prisma.class.create({
                data: { ...classData, crId: student.id },
            })

            // Add enrollment
            await prisma.enroll.create({
                data: {
                    status: 'approved',
                    approvedAt: new Date(),
                    studentId: student.id,
                    classId: newClass.id,
                },
            })
            return newClass
        })

        res.status(201)
        res.json(newClass)
    })
)

module.exports = router