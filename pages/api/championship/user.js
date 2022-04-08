const prismaClient = require("@prisma/client");

const prisma = new prismaClient.PrismaClient();

const getChampionshipUsers = async (req) => {
  const champUsers = await prisma.cop_championship_user.findMany({
    where: {
      championship_id: parseInt(req.query.id),
    },
  });
  const users = await prisma.cop_user.findMany();
  return users.map((user) => {
    return {
      email: user.email,
      participate: champUsers.find((u) => u.user_email === user.email) != null,
    };
  });
};

const updateChampionshipUsers = async (req) => {
  const users = req.body;

  users.forEach(async (user) => {
    const champUser = await prisma.cop_championship_user.findFirst({
      where: {
        AND: {
          championship_id: parseInt(req.query.id),
          user_email: user.email,
        },
      },
    });
    if (user.participate) {
      if (!champUser) {
        await prisma.cop_championship_user.create({
          data: {
            championship_id: parseInt(req.query.id),
            user_email: user.email,
          },
        });
      }
    } else {
      if (champUser) {
        await prisma.cop_championship_user.delete({
          where: {
            id: champUser.id,
          },
        });
      }
    }
  });
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    const users = await getChampionshipUsers(req);
    res.status(200).json(users);
  } else if (req.method === "PUT") {
    await updateChampionshipUsers(req);
    res.status(200).json(true);
  } else {
    // Handle any other HTTP method
    console.warn(`METHOD ${req.method} NOT ALLOWED`);
    res.status(205).json([]);
  }
}
