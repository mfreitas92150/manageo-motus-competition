const prismaClient = require("@prisma/client");
const datefns = require("date-fns");

const prisma = new prismaClient.PrismaClient();

const getChampionships = async () => {
  const championships = await prisma.cop_championship.findMany({
    orderBy: {
      begin: "desc",
    },
  });
  return championships;
};

const createChampionship = async (req) => {
  const championShip = await prisma.cop_championship.create({
    data: {
      name: req.body.name,
      begin: req.body.begin,
      end: req.body.end,
    },
  });
  return championShip.id;
};

const updateChampionship = async (req) => {
  const championShip = await prisma.cop_championship.update({
    where: {
      id: req.body.id,
    },
    data: {
      name: req.body.name,
      begin: req.body.begin,
      end: req.body.end,
    },
  });
  return championShip.id;
};

const deleteChampionship = async (req) => {
  await prisma.cop_championship.delete({
    where: {
      id: parseInt(req.query.id),
    },
  });
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const id = await createChampionship(req);
    res.status(201).json(`${id}`);
  } else if (req.method === "GET") {
    const championships = await getChampionships();
    res.status(200).json(championships);
  } else if (req.method === "PUT") {
    const id = await updateChampionship(req, res);
    res.status(200).json(`${id}`);
  } else if (req.method === "DELETE") {
    await deleteChampionship(req, res);
    res.status(200).json(true);
  } else {
    // Handle any other HTTP method
    console.warn(`METHOD ${req.method} NOT ALLOWED`);
    res.status(205).json(false);
  }
}
