const express = require("express");
const prismaClient = require('@prisma/client');
const datefns = require("date-fns");

const mots = require('../mots.js')

const prisma = new prismaClient.PrismaClient()
const router = express.Router()

const rankingService = require('../service/ranking')

const updateWordDelay = process.env.UPDATE_WORD_DELAY

const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}

const getDateWord = () => {
    const currrentDate = new Date();
    const result = {
        lt: currrentDate
    }
    if (updateWordDelay) {
        result.gt = datefns.subMinutes(currrentDate, updateWordDelay)
    } else {
        currrentDate.setHours(2)
        currrentDate.setMinutes(0)
        currrentDate.setSeconds(0)
        currrentDate.setMilliseconds(0)
        result.gt = currrentDate
    }

    return result
}

router.get("/", async (req, res) => {
    if (req.query.email) {
        const user = await prisma.cop_user.findUnique({
            where: {
                email: req.query.email,
            },
        })
        if (!user) {
            const newUser = {
                email: req.query.email,
                role: 'user',
                validate: false,
            }
            await prisma.cop_user.create({ data: newUser })
            res.send({
                ...newUser,
                new: true
            })
        } else {
            res.send(user)
        }
    } else {
        const users = await prisma.cop_user.findMany();
        res.send(users)
    }

});

router.post("/", async (req, res) => {
    const user = await prisma.cop_user.create({ data: req.body })
    res.send(`${user.id}`)
});

router.put("/", async (req, res) => {
    const user = await prisma.cop_user.update({
        where: {
            email: req.body.email,
        },
        data: {
            validate: req.body.validate,
        },
    })
    res.send(`${user.id}`)
})

router.delete("/", async (req, res) => {
    await prisma.cop_word.delete({
        where: {
            email: req.query.email,
        }
    })
    res.send("true")
});

router.get("/championship", async (req, res) => {
    const championship = await prisma.cop_championship.findFirst({
        where: {
            AND: {
                begin: {
                    lte: new Date()
                },
                end: {
                    gte: new Date()
                }
            }
        }
    })
    if (!championship) {
        res.send({})
        return
    }
    const champUser = await prisma.cop_championship_user.findFirst({
        where: {
            AND: {
                championship_id: championship.id,
                user_email: req.query.email
            },
        }
    })
    res.send({
        ...championship,
        participate: champUser !== null
    })
})

router.get("/word", async (req, res) => {
    const dates = getDateWord()
    const index = getRandomInt(mots.availables.length - 1);

    const word = mots.availables[index].toUpperCase();

    const wordFromDb = await prisma.cop_word.findFirst({
        where: {
            AND: {
                affected_at: {
                    gte: dates.gt,
                    lte: dates.lt
                },
                email: req.query.email
            }
        }
    })
    if (wordFromDb) {
        res.send(wordFromDb)
    } else {
        const guesses = [];
        for (let i = 0; i < 6; i++) {
            guesses.push([{
                char: word[0],
                state: 2
            }])
        }
        const result = {
            word,
            affected_at: dates.lt,
            email: req.query.email,
            guesses: JSON.stringify(guesses),
            current_guess: JSON.stringify([{
                char: word[0],
                state: 0
            }]),
            current_line: 0,
            success: false,
        };

        res.send(await prisma.cop_word.create({
            data: result
        }))
    }
});

router.put("/word", async (req, res) => {
    await prisma.cop_word.update({
        where: {
            id: req.body.id,
        },
        data: {
            guesses: JSON.stringify(req.body.guesses),
            success: req.body.success,
            current_line: req.body.current_line,
            current_guess: JSON.stringify(req.body.current_guess)
        },
    })
    if (req.body.success) {
        rankingService.udpateRank(req.body.email, 6 - req.body.current_line)
    }
})

module.exports = router;
