const prismaClient = require('@prisma/client');

const prisma = new prismaClient.PrismaClient()

module.exports.findUserChampionship = async (championshipId, email) => {
    const user = await prisma.cop_championship_user.findFirst({
        where: {
            AND: {
                championship_id: championshipId,
                user_email: email
            },
        }
    })
    return user;
}

