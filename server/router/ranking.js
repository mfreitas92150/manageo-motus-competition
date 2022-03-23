const express = require("express");
const prismaClient = require('@prisma/client');
const datefns = require("date-fns");

const rankingService = require('../service/ranking');

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

router.get("/championships", async (req, res) => {
    const championships = await prisma.cop_championship.findMany({
        orderBy: {
            begin: 'desc',
        }
    });
    res.send(championships)
})

router.post("/championships", async (req, res) => {
    const championShip = await prisma.cop_championship.create({
        data: {
            name: req.body.name,
            begin: req.body.begin,
            end: req.body.end
        }
    })
    res.send(`${championShip.id}`)
})

router.put("/championships", async (req, res) => {
    const championShip = await prisma.cop_championship.update({
        where: {
            id: req.body.id,
        },
        data: {
            name: req.body.name,
            begin: req.body.begin,
            end: req.body.end
        },
    })
    res.send(`${championShip.id}`)
})

router.delete("/championships", async (req, res) => {
    await prisma.cop_championship.delete({
        where: {
            id: parseInt(req.query.id),
        }
    })
    res.send("true")
})

router.get("/championships/user", async (req, res) => {
    const champUsers = await prisma.cop_championship_user.findMany({
        where: {
            championship_id: parseInt(req.query.id)
        }
    })
    const users = await prisma.cop_user.findMany();
    res.send(users.map(user => {
        return {
            email: user.email,
            participate: champUsers.find(u => u.user_email === user.email) != null
        }
    }))
})

router.put("/championships/user", async (req, res) => {
    const users = req.body

    users.forEach(async user => {
        const champUser = await prisma.cop_championship_user.findFirst({
            where: {
                AND: {
                    championship_id: parseInt(req.query.id),
                    user_email: user.email
                },
            }
        })
        if (user.participate) {
            if (!champUser) {
                await prisma.cop_championship_user.create({
                    data: {
                        championship_id: parseInt(req.query.id),
                        user_email: user.email
                    }
                })
            }
        } else {
            if (champUser) {
                await prisma.cop_championship_user.delete({
                    where: {
                        id: champUser.id
                    }
                })
            }
        }
    })

    res.send("true")
})

module.exports = router;