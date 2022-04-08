import React, { useCallback, useEffect, useState } from "react";

import { differenceInSeconds } from "date-fns";
import useEventListener from "@use-it/event-listener";
import { Box, Container, Typography, Grid, Alert } from "@mui/material";
import GamingKeyBoard from "./GamingKeyBoard";
import GamingTestMode from "./GamingTestMode";
import GamingGrid from "./GamingGrid";
import styled from "@emotion/styled";
import GamingCountDown from "./GamingCountDown";
import Gamingjoke from "./GamingJoke";
import GamingResult from "./GamingResult";

const MyBox = styled(Box)({
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
});

const GamingContainer = styled(Grid)({
  display: "flex",
  justifyContent: "space-around",
});

const GameContainer = styled(Grid)({});

const WarningAlert = styled(Alert)({
  backgroundColor: "#DAB14A",
  color: "#fff",
});

export default function Gaming({ user, championship }) {
  const [started, setStarted] = useState(false);

  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [endTime, setEndTime] = useState(null);

  const [lineCountStart, setLineCountStart] = useState(null);
  const [lineCountCurrent, setLineCountEnd] = useState(new Date());

  const [badWord, setBadWord] = useState(false);

  const [state, setState] = useState({
    currentLine: 0,
    guesses: [],
    goodChars: [],
    inButNoPlaceChars: [],
    badChars: [],
    jokes: [],
  });

  const [gamingResultOpen, setGamingResultOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/user/word?email=${user.email}&championship=${championship.id}`)
      .then((res) => res.json())
      .then((data) => {
        const guesses = JSON.parse(data.guesses);
        const goods = guesses
          .flatMap((g) => g.filter((c, index) => index > 0))
          .filter((g) => g.state === 2)
          .map((g) => g.char);
        const almosts = guesses
          .flatMap((g) => g.filter((c, index) => index > 0))
          .filter((g) => g.state === 1)
          .map((g) => g.char);
        const bads = guesses
          .flatMap((g) => g.filter((c, index) => index > 0))
          .filter((g) => g.state === 0)
          .map((g) => g.char);

        setState({
          word: data.word,
          currentGuess: JSON.parse(data.current_guess),
          currentLine: data.current_line,
          guesses: guesses,
          success: data.success,
          id: data.id,
          goodChars: goods,
          inButNoPlaceChars: almosts,
          badChars: bads,
          jokes: [],
        });

        if (!data.success && data.current_line < 6) {
          setStartTime(new Date());
        } else {
          setGamingResultOpen(true);
        }
      });

    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setLineCountEnd(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [user.email, championship.id]);

  const updateWord = useCallback(
    (guess, guesses, success) => {
      fetch("/api/user/word", {
        method: "PUT",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word: state.word,
          current_guess: guess,
          current_line: success ? state.currentLine : state.currentLine + 1,
          guesses,
          success,
          email: user.email,
          id: state.id,
        }),
      });
    },
    [state, user.email]
  );

  useEffect(() => {
    if (!state.word) {
      return;
    }
    if (state.currentLine >= 6) {
      return;
    }
    if (
      differenceInSeconds(lineCountCurrent, lineCountStart) >=
      process.env.NEXT_PUBLIC_GAMING_LINE_COUNTER
    ) {
      setLineCountStart(new Date());
      setLineCountEnd(new Date());

      const guess = [
        {
          char: state.word.substring(0, 1),
          state: 2,
        },
      ];

      for (let i = 1; i < state.word.length; i++) {
        guess.push({
          char: "",
          state: 3,
        });
      }
      const guesses = [...state.guesses];
      guesses[state.currentLine] = guess;
      const jokes = [];
      if (state.currentLine >= 5) {
        setEndTime(new Date());
        setLineCountStart(null);
        setGamingResultOpen(true);
      } else {
        jokes.push("Accélère ! On dirait Charlotte !");
      }
      

      setState({
        ...state,
        guesses,
        currentLine: state.currentLine + 1,
        jokes,
      });

      updateWord(guess, guesses, false);
    }
  }, [lineCountCurrent, lineCountStart, state, updateWord]);

  const startLineCounter = () => {
    if (!state.success && state.currentLine < 6 && !lineCountStart) {
      setLineCountStart(new Date());
      setLineCountEnd(new Date());
    }
  };

  const addChar = (char) => {
    if (!state.word || endTime) {
      return;
    }
    startLineCounter();
    const guess = [
      ...state.guesses[state.currentLine],
      {
        char: char,
        state: 0,
      },
    ];
    const guesses = [...state.guesses];
    guesses[state.currentLine] = guess;
    setState({
      ...state,
      guesses,
    });
  };

  const removeChar = () => {
    if (!state.word) {
      return;
    }
    setBadWord(false);
    const guess = [...state.guesses[state.currentLine]];
    if (guess.length > 1) {
      guess.pop();
      const guesses = [...state.guesses];
      guesses[state.currentLine] = guess;
      setState({
        ...state,
        guesses,
      });
    }
  };

  const checkWord = () => {
    if (
      !state.word ||
      endTime ||
      state.guesses[state.currentLine].length !== state.word.length
    ) {
      return;
    }
    const guess = [...state.guesses[state.currentLine]];
    const word = state.word;
    const result = validWord(word, guess);
    const guesses = [...state.guesses];
    guesses[state.currentLine] = result;
    const success = !result.find((c) => c.state !== 2);

    const goods = guesses
      .flatMap((g) => g.filter((c, index) => index > 0))
      .filter((g) => g.state === 2)
      .map((g) => g.char);
    const almosts = guesses
      .flatMap((g) => g.filter((c, index) => index > 0))
      .filter((g) => g.state === 1)
      .map((g) => g.char);
    const bads = guesses
      .flatMap((g) => g.filter((c, index) => index > 0))
      .filter((g) => g.state === 0)
      .map((g) => g.char);

    setLineCountStart(new Date());
    const jokes = [];

    setLineCountEnd(new Date());
    let joke;
    if (success || state.currentLine >= 5) {
      setEndTime(new Date());
      setLineCountStart(null);
      if (success) {
        if (state.currentLine === 0) {
          joke = "La chaaaaaaatte !";
        } else if (state.currentLine === 1) {
          joke = "Bernard Pivot de la Duranne !";
        } else if (state.currentLine === 2) {
          joke = "Un talent comme toi, devrait être augmenté immédiatement !";
        } else if (state.currentLine === 3) {
          joke = "Moyenne : Note égale à la moitié de la note maximale.";
        } else if (state.currentLine === 4) {
          joke = "On en parlera lors de ton entretien annuel…";
        } else if (state.currentLine === 5) {
          joke = "C'est un peu la honte quand même…";
        }
      } else {
        joke = "0 + 0 = La tête à JUL";
      }
      jokes.push(joke);
      setGamingResultOpen(true);
    }

    setState({
      ...state,
      guesses,
      success,
      goodChars: goods,
      inButNoPlaceChars: almosts,
      badChars: bads,
      currentLine: success ? state.currentLine : state.currentLine + 1,
      jokes,
    });

    updateWord(guess, guesses, success, joke);
  };

  const validWord = (word, guess) => {
    const validWord = word.substring(1).split("");
    const charToFind = word.substring(1).split("");
    const guessWord = guess.filter((c, index) => index > 0).map((g) => g.char);

    const newGuess = guessWord.map((g, index) => {
      const wChar = validWord[index];
      let state = 0;
      if (wChar === g) {
        state = 2;
        const i = charToFind.indexOf(g);
        charToFind.splice(i, 1);
      }
      return {
        char: g,
        state,
      };
    });

    return [
      {
        char: word.substring(0, 1),
        state: 2,
      },
      ...newGuess.map((g, index) => {
        if (g.state !== 2 && charToFind.includes(g.char)) {
          const i = charToFind.indexOf(g);
          charToFind.splice(i, 1);
          return {
            char: g.char,
            state: 1,
          };
        }
        return g;
      }),
    ];
  };

  const validWordExistant = () => {
    if (process.env.NEXT_PUBLIC_TEST_MODE === "true") {
      checkWord();
      return;
    }
    fetch(
      `/api/user/word?validWord=${state.guesses[state.currentLine]
        .map((c) => c.char)
        .join("")}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          checkWord();
        } else {
          setBadWord(true);
          setState({...state,
        jokes: ["Mot inconnu"]})
        }
      });
  };

  useEventListener("keydown", (event) => {
    if (!state.word) {
      return;
    }

    const currentChar =
      event.key.length === 1 && event.key.toUpperCase().split()[0];
    const guess = state.guesses[state.currentLine];
    if (state.success) {
      return;
    }
    if (event.key === "Backspace" && guess.length > 1) {
      removeChar();
      return;
    }
    if (
      event.key === "Enter" &&
      state.guesses[state.currentLine].length === state.word.length
    ) {
      validWordExistant();
      return;
    }

    startLineCounter();
    if (
      currentChar &&
      currentChar.match(/[A-Z]/g) &&
      guess.length < state.word.length
    ) {
      addChar(currentChar);
      return;
    }
  });
  return (
    <div>
      <GamingContainer>
        <GameContainer>
          {gamingResultOpen && (
            <GamingResult
              handleClose={() => setGamingResultOpen(false)}
              state={state}
            />
          )}
            <GamingTestMode
              started={started}
              startTime={startTime}
              currentTime={currentTime}
              endTime={endTime}
              lineCountStart={lineCountStart}
              lineCountCurrent={lineCountCurrent}
              badWord={badWord}
              state={state}
              championship={championship}
            />
          <GamingCountDown
            started={started}
            lineCountStart={lineCountStart}
            lineCountCurrent={lineCountCurrent}
          />
          <MyBox>
            <GamingGrid
              guesses={state.guesses}
              word={state.word}
              currentLine={state.currentLine}
            />
            <GamingKeyBoard
              removeChar={removeChar}
              checkWord={() => {
                if (
                  state.guesses[state.currentLine].length === state.word.length
                ) {
                  validWordExistant();
                }
              }}
              addChar={addChar}
              goodChars={state.goodChars}
              inButNoPlaceChars={state.inButNoPlaceChars}
              badChars={state.badChars}
            />
          </MyBox>
        </GameContainer>
      </GamingContainer>
      <Grid container justifyContent={"center"}>
        {state.jokes?.map((joke, key) => {
          return (
            <WarningAlert
              key={key}
              severity="error"
              onClose={() => {
                setState({
                  ...state,
                  jokes: state.jokes.filter((j, i) => i !== key),
                });
              }}
            >
              {joke}
            </WarningAlert>
          );
        })}
      </Grid>
    </div>
  );
}
