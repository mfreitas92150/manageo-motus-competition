const express = require("express");
const path = require('path');
const prismaClient = require('@prisma/client');
const mots = require('./mots.js')
const datefns = require("date-fns");

const prisma = new prismaClient.PrismaClient()

const PORT = process.env.PORT || 3001;

const app = express();

const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
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
    console.info(req.body)

    const user = await prisma.cop_ranking.findUnique({
        where: {
            email: req.body.email,
        },
    })
    console.info(user)
    if (user) {
        console.info("update")
        await prisma.cop_ranking.update({
            where: {
                email: req.body.email,
            },
            data: {
                rank: req.body.point + user.rank,
            },
        })
    } else {
        console.info("create")
        await prisma.cop_ranking.create({
            data: {
                email: req.body.email,
                rank: req.body.point
            }
        })
    }

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
    const ranking = await prisma.cop_ranking.findMany({
        orderBy: [
            {
                rank: 'desc',
            }
        ]
    })
    res.send(ranking)
})

app.get("/api/word", async (req, res) => {
    if (process.env.TEST_MODE) {
        res.send({ word: "TESTER" })
        return;
    }
    const currrentDate = new Date();
    const currentDateMinus5 = datefns.subMinutes(currrentDate, 5)
    const wordFromDb = await prisma.cop_word.findFirst({
        where: {
            affected_at: {
                gte: currentDateMinus5,
                lt: currrentDate
            }
        }
    })
    if (wordFromDb) {
        res.send({ word: wordFromDb.word })
    } else {
        const index = getRandomInt(mots.length - 1);
        const word = mots[index].toUpperCase();
        await prisma.cop_word.create({
            data: {
                word,
                affected_at: currrentDate
            }
        })
        res.send({ word })
    }

});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

const validWord = (word, guess) => {
    const validWord = word.substring(1).split('')
    let charToFind = word.substring(1).split('')
    const guessWord = guess.filter((g, index) => index > 0).map(g => g.char)

    return [
        {
            char: word.substring(0, 1),
            state: 2
        },
        ...guessWord.map((g, index) => {
            const wChar = validWord[index];
            let state = 0;
            if (wChar === g) {
                state = 2
                var index = charToFind.indexOf(g);
                charToFind = charToFind.splice(index, 1);
            } else if (charToFind.includes(g)) {
                state = 1
                var index = charToFind.indexOf(g);
                charToFind = charToFind.splice(index, 1);
            }
            return {
                char: g,
                state
            }
        })]
}

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);

    if (process.env.TEST_MODE) {
        console.info("Mode test")
    }
    
});


