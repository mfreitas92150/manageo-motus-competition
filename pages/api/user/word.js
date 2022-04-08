const prismaClient = require("@prisma/client");
const datefns = require("date-fns");

const mots = require("./_word");

const prisma = new prismaClient.PrismaClient();

const updateWordDelay = process.env.UPDATE_WORD_DELAY

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

const getDateWord = () => {
  const currrentDate = new Date();
  const result = {
    lt: currrentDate,
  };

  if (updateWordDelay) {
    result.gt = datefns.subMinutes(currrentDate, updateWordDelay);
  } else {
    currrentDate.setHours(2);
    currrentDate.setMinutes(0);
    currrentDate.setSeconds(0);
    currrentDate.setMilliseconds(0);
    result.gt = currrentDate;
  }

  return result;
};



const getWord = async (req) => {
  const dates = getDateWord();
  const index = getRandomInt(mots.availables.length - 1);

  const word = mots.availables[index].toUpperCase();

  const wordFromDb = await prisma.cop_word.findFirst({
    where: {
      AND: {
        affected_at: {
          gte: dates.gt,
          lte: dates.lt,
        },
        email: req.query.email,
        championship_id: parseInt(req.query.championship),
      },
    },
  });
  if (wordFromDb) {
    return wordFromDb;
  } else {
    const guesses = [];
    for (let i = 0; i < 6; i++) {
      guesses.push([
        {
          char: word[0],
          state: 2,
        },
      ]);
    }
    const result = {
      word,
      affected_at: dates.lt,
      email: req.query.email,
      championship_id: parseInt(req.query.championship),
      guesses: JSON.stringify(guesses),
      current_guess: JSON.stringify([
        {
          char: word[0],
          state: 0,
        },
      ]),
      current_line: 0,
      success: false,
    };
    const wordCreated = await prisma.cop_word.create({
      data: result,
    });
    return wordCreated;
  }
};

const putWord = async (req) => {
  await prisma.cop_word.update({
    where: {
      id: req.body.id,
    },
    data: {
      guesses: JSON.stringify(req.body.guesses),
      success: req.body.success,
      current_line: req.body.current_line,
      current_guess: JSON.stringify(req.body.current_guess),
    },
  });
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    if (req.query.validWord) {
      res.status(200).json(mots.validates.includes(req.query.validWord));
    } else if (!req.query.email || !req.query.championship) {
      res.status(400).json(false);
    }
    const word = await getWord(req);
    res.status(200).json(word);
  } else if (req.method === "PUT") {
    await putWord(req);
    res.status(200).json(true);
  } else {
    // Handle any other HTTP method
    console.warn(`METHOD ${req.method} NOT ALLOWED`);
    res.status(205).json(false);
  }
}
