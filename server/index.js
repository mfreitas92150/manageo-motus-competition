const express = require("express");
const path = require('path');
const prismaClient = require('@prisma/client');
const mots = require('./mots.js')
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
    const index = getRandomInt(mots.length - 1);
    const word = mots[index].toUpperCase();
    res.send({ word })
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);

});


