import React from 'react';

import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';

import { format, addSeconds, differenceInSeconds } from 'date-fns'

const ClockBox = styled(Typography)({
    fontFamily: 'Qahiri',
    fontSize: '5em',
    display: "inline-block",
    padding: "0 .2em",
    backgroundColor: '#FFF',
})

const GreenBox = styled(ClockBox)({
    color: '#71CC51'
})

const WarningBox = styled(ClockBox)({
    color: '#FBE337'
})

const ErrorBox = styled(ClockBox)({
    color: '#F7786B'
})

export default function GamingCountDown({ started, lineCountStart, lineCountCurrent }) {

    const waitingTime = process.env.REACT_APP_GAMING_LINE_COUNTER;

    const diff = lineCountStart && lineCountCurrent && lineCountCurrent > lineCountStart ? differenceInSeconds(addSeconds(lineCountStart, waitingTime), lineCountCurrent) : waitingTime;

    const displayTime = lineCountStart && lineCountCurrent && diff > 0 ? format(new Date(addSeconds(lineCountStart, waitingTime) - lineCountCurrent), 'mm:ss') : "--:--"

    let boxCounter = <GreenBox>{displayTime}</GreenBox>;
    if (diff <= process.env.REACT_APP_GAMING_ERROR_LINE_COUNTER) {
        boxCounter = <ErrorBox>{displayTime}</ErrorBox>
    } else if (diff <= process.env.REACT_APP_GAMING_WARN_LINE_COUNTER) {
        boxCounter = <WarningBox>{displayTime}</WarningBox>
    }

    return <p>{boxCounter}</p>

}