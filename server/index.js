const express = require("express");
const path = require('path');
const prismaClient = require('@prisma/client');
const mots = require('./mots.js')
const datefns = require("date-fns");

const userRouter = require('./router/user')
const rankingRouter = require('./router/ranking')

const rankingService = require('./service/ranking')

const prisma = new prismaClient.PrismaClient()

const PORT = process.env.PORT || 3001;

const app = express();

const updateWordDelay = process.env.UPDATE_WORD_DELAY
const updateRankDelay = process.env.UPDATE_RANK_DELAY



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

app.use("/api/user", userRouter);
app.use("/api/ranking", rankingRouter);

app.post("/api/user/rank", async (req, res) => {
    udpateRank(req.body.email, req.body.point)
})


app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});


app.listen(PORT, async () => {
    console.log(`Server listening on ${PORT}`);
    if (process.env.TEST_MODE === "true") {
        console.info("Mode test")
    }
    if (updateWordDelay) {
        console.info(`updateWordDelay: ${updateWordDelay}`)
    }
});


