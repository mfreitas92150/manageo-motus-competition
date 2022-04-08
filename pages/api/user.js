const prismaClient = require("@prisma/client");

const prisma = new prismaClient.PrismaClient();

const getUser = async (email) => {
  const user = await prisma.cop_user.findUnique({
    where: {
      email: email,
    },
  });
  if (!user) {
    const newUser = {
      email: email,
      role: "user",
      validate: false,
    };
    await prisma.cop_user.create({ data: newUser });
    return {
      ...newUser,
      new: true,
    };
  } else {
    return user;
  }
};
const getUsers = async () => {
  const users = await prisma.cop_user.findMany();
  return users;
};

const updateUser = async (req) => {
  const user = await prisma.cop_user.update({
    where: {
      email: req.body.email,
    },
    data: {
      validate: req.body.validate,
    },
  });
  return user.id;
};

const deleteUser = async (req) => {
  await prisma.cop_word.delete({
    where: {
      email: req.query.email,
    },
  });
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    if (req.query.email) {
      const user = getUser(req.query.email);
      res.status(200).json(user);
    } else {
      const users = await getUsers();
      res.status(200).json(users);
    }
  } else if (req.method === "PUT") {
    const id = await updateUser(req);
    res.status(200).json(`${id}`);
  } else if (req.method === "DELETE") {
    await deleteUser(req);
    res.status(200).json(true);
  } else {
    // Handle any other HTTP method
    console.warn(`METHOD ${req.method} NOT ALLOWED`);
    res.status(205).json(false);
  }
}
