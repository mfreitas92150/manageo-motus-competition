
const datefns = require("date-fns");
const prismaClient = require('@prisma/client');

const prisma = new prismaClient.PrismaClient()

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
        result.until = datefns.addDays(currrentDate, 15)
    }

    return result
}

const getRanking = async (dates) => {
    const currentDates = dates || getDateRanking()
    let ranking = await prisma.cop_ranking.findFirst({
        where: {
            create_at: {
                gte: currentDates.gt,
                lte: currentDates.lt
            }
        }
    })
    if (!ranking) {
        ranking = await prisma.cop_ranking.create({
            data: {
                create_at: currentDates.lt
            }
        })
    }
    return ranking
}

module.exports.getDateRanking = getDateRanking
module.exports.getRanking = getRanking

module.exports.udpateRank = async (email, point) => {

    const dates = getDateRanking()
    const ranking = getRanking()

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