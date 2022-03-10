const express = require("express");
const path = require('path');
const prismaClient = require('@prisma/client');
const mots = require('./mots.js')
const datefns = require("date-fns");

const prisma = new prismaClient.PrismaClient()

const PORT = process.env.PORT || 3001;

const app = express();

const updateWordDelay = process.env.UPDATE_WORD_DELAY
const updateRankDelay = process.env.UPDATE_RANK_DELAY

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

const getDateRanking = () => {
    const currrentDate = new Date();
    const result = {
        lt: currrentDate
    }
    if (updateRankDelay) {
        result.gt = datefns.subMinutes(currrentDate, updateRankDelay)
        result.until = datefns.addMinutes(currrentDate, updateRankDelay)
    } else {
        currrentDate.setHours(2)
        currrentDate.setMinutes(0)
        currrentDate.setSeconds(0)
        currrentDate.setMilliseconds(0)
        result.gt = datefns.subDays(currrentDate, 15)
        result.until = datefns.addMinutes(currrentDate, 15)
    }

    return result
}

const udpateRank = async (email, point) => {

    const dates = getDateRanking()
    let ranking = await prisma.cop_ranking.findFirst({
        where: {
            create_at: {
                gte: dates.gt,
                lt: dates.lt
            }
        }
    })

    if (!ranking) {
        ranking = await prisma.cop_ranking.create({
            data: {
                create_at: dates.lt
            }
        })
    }

    const user = await prisma.cop_user_ranking.findFirst({
        where: {
            AND: {
                ranking_id: ranking.id,
                email: email,
            }
        },
    })

    if (user) {
        await prisma.cop_user_ranking.update({
            where: {
                id: user.id
            },
            data: {
                point: point + user.point,
            },
        })
    } else {
        await prisma.cop_user_ranking.create({
            data: {
                email: email,
                ranking_id: ranking.id,
                point: point
            }
        })
    }

}

app.use(express.json());

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.get("/api/user", async (req, res) => {
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

app.post("/api/user", async (req, res) => {
    await prisma.cop_user.create({ data: req.body })
});

app.put("/api/user", async (req, res) => {
    await prisma.cop_user.update({
        where: {
            email: req.body.email,
        },
        data: {
            validate: req.body.validate,
        },
    })
})

app.post("/api/user/rank", async (req, res) => {
    udpateRank(req.body.email, req.body.point)
})

app.post("/api/user/guess", async (req, res) => {
    const currentDate = Date.now()

    await prisma.cop_user.create({
        data:
        {
            email: req.body.user,
            word: req.body.word,
            guess_try: req.body.guess_try,
            guess: req.body.guess,
        }
    })
})

app.put("/api/user", async (req, res) => {
    await prisma.cop_user.update({
        where: {
            email: req.body.email,
        },
        data: {
            validate: req.body.validate,
        },
    })
})

app.delete("/api/user", async (req, res) => {
    await prisma.cop_word.delete({
        where: {
            email: req.query.email,
        }
    })
});

app.get("/api/ranking", async (req, res) => {
    const dates = getDateRanking()
    let ranking = await prisma.cop_ranking.findFirst({
        where: {
            create_at: {
                gte: dates.gt,
                lt: dates.lt
            }
        }
    })
    if (!ranking) {
        ranking = await prisma.cop_ranking.create({
            data: {
                create_at: dates.lt
            }
        })
    }
    const users = await prisma.cop_user_ranking.findMany({
        where: {
            ranking_id: ranking.id
        },
        orderBy: {
            point: 'desc',
        }
    })
    res.send({
        ...ranking,
        until_at: ranking.until,
        start: datefns.format(ranking.create_at, 'dd/MM/yyyy'),
        end: datefns.format(dates.until, 'dd/MM/yyyy'),
        users
    })
})

app.get("/api/word", async (req, res) => {
    if (process.env.TEST_MODE === "true") {
        res.send({ word: "TESTER" })
        return;
    }
    const dates = getDateWord()
    const wordFromDb = await prisma.cop_word.findFirst({
        where: {
            AND: {
                affected_at: {
                    gte: dates.gt,
                    lt: dates.lt
                },
                email: req.query.email
            }
        }
    })
    if (wordFromDb) {
        res.send(wordFromDb)
    } else {
        const index = getRandomInt(mots.length - 1);
        const word = mots[index].toUpperCase();
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

app.put("/api/word", async (req, res) => {
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
        udpateRank(req.body.email, 6 - req.body.current_line)
    }
})

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
    if (process.env.TEST_MODE === "true") {
        console.info("Mode test")
    }
    if (updateWordDelay) {
        console.info(`updateWordDelay: ${updateWordDelay}`)
    }

    udpateRank('test1@test.fr', 12)
    udpateRank('test2@test.fr', 8)
    udpateRank('test3@test.fr', 1)
});


