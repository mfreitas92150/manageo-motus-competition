import React from "react";

import { differenceInSeconds, format } from "date-fns";
import { Grid, Paper, Stack, Typography } from "@mui/material";
import styled from "@emotion/styled";

const MyPaper = styled(Paper)({
  padding: "5px",
  margin: "5px",
  backgroundColor: "#77A48B",
});

const MyTypo = styled(Typography)({
  padding: "5px",
  margin: "5px",
  textAlign: "left",
});

export default function GamingTestMode({
  started,
  startTime,
  currentTime,
  endTime,
  lineCountStart,
  lineCountCurrent,
  badWord,
  state,
}) {
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={2}>
          <MyPaper>mot</MyPaper>
        </Grid>
        <Grid item xs={2}>
          <MyTypo>{state.word}</MyTypo>
        </Grid>
        <Grid item xs={2}>
          <MyPaper>currentLine</MyPaper>
        </Grid>
        <Grid item xs={2}>
          <MyTypo>{state.currentLine}</MyTypo>
        </Grid>
        <Grid item xs={2}>
          <MyPaper>success</MyPaper>
        </Grid>
        <Grid item xs={2}>
          <MyTypo>{state.success ? "true" : "false"}</MyTypo>
        </Grid>
        
        <Grid item xs={2}>
          <MyPaper>started</MyPaper>
        </Grid>
        <Grid item xs={2}>
          <MyTypo>{started ? "true" : "false"}</MyTypo>
        </Grid>
        <Grid item xs={2}>
          <MyPaper>badWord</MyPaper>
        </Grid>
        <Grid item xs={5}>
          <MyTypo>{badWord ? "true" : "false"}</MyTypo>
        </Grid>

        <Grid item xs={2}>
          <MyPaper>startTime</MyPaper>
        </Grid>
        <Grid item xs={2}>
          <MyTypo>
            {startTime ? format(new Date(startTime), "hh:mm:ss") : "--:--:--"}
          </MyTypo>
        </Grid>
        <Grid item xs={2}>
          <MyPaper>currentTime</MyPaper>
        </Grid>
        <Grid item xs={2}>
          <MyTypo>
            {currentTime
              ? format(new Date(currentTime), "hh:mm:ss")
              : "--:--:--"}
          </MyTypo>
        </Grid>
        <Grid item xs={2}>
          <MyPaper>endTime</MyPaper>
        </Grid>
        <Grid item xs={2}>
          <MyTypo>
            {endTime ? format(new Date(endTime), "hh:mm:ss") : "--:--:--"}
          </MyTypo>
        </Grid>

        <Grid item xs={2}>
          <MyPaper>lineCountStart</MyPaper>
        </Grid>
        <Grid item xs={2}>
          <MyTypo>
            {lineCountStart ? format(new Date(lineCountStart), "hh:mm:ss") : "--:--:--"}
          </MyTypo>
        </Grid>
        <Grid item xs={2}>
          <MyPaper>lineCountCurrent</MyPaper>
        </Grid>
        <Grid item xs={2}>
          <MyTypo>
            {lineCountCurrent
              ? format(new Date(lineCountCurrent), "hh:mm:ss")
              : "--:--:--"}
          </MyTypo>
        </Grid>

      </Grid>
    </>
  );
}
