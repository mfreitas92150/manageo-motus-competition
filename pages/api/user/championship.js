const prismaClient = require("@prisma/client");

const prisma = new prismaClient.PrismaClient();

const findUserChampionship = async (championshipId, email) => {
  const user = await prisma.cop_championship_user.findFirst({
    where: {
      AND: {
        championship_id: championshipId,
        user_email: email,
      },
    },
  });
  return user;
};

const getChampionshipForUser = async (email) => {
  const championship = await prisma.cop_championship.findFirst({
    where: {
      AND: {
        begin: {
          lte: new Date(),
        },
        end: {
          gte: new Date(),
        },
      },
    },
  });
  const nextChampionshipDb = await prisma.cop_championship.findFirst({
    where: {
      AND: {
        begin: {
          gte: new Date(),
        },
      },
    },
  });
  const nextChampionship = nextChampionshipDb && {
    id: nextChampionshipDb.id,
    begin: nextChampionshipDb.begin,
    name: nextChampionshipDb.name,
    participate:
      (await findUserChampionship(nextChampionshipDb.id, email)) !== null,
  };

  if (!championship) {
    return nextChampionship;
  }
  const champUser = await findUserChampionship(championship.id, email);
  return {
    ...championship,
    participate: champUser !== null,
    nextChampionship,
  };
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    const user = await getChampionshipForUser(req.query.email);
    res.status(200).json(user);
  } else {
    // Handle any other HTTP method
    console.warn(`METHOD ${req.method} NOT ALLOWED`);
    res.status(205).json(false);
  }
}
