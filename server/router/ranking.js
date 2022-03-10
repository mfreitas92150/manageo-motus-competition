const express = require("express");
const prismaClient = require('@prisma/client');
const datefns = require("date-fns");

const rankingService = require('../service/ranking')

const prisma = new prismaClient.PrismaClient()

const router = express.Router();

router.get("/", async (req, res) => {
    const dates = rankingService.getDateRanking()
    const ranking = await rankingService.getRanking(dates)
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

module.exports = router;