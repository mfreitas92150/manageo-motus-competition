import React from 'react';

import { styled } from '@mui/material/styles';
import { Grid, Typography } from '@mui/material';

import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';

import { format, addSeconds, differenceInSeconds } from 'date-fns'

const MyGrid= styled(Grid)({
    display: 'flex',
    justifyContent: 'right',
    alignItems: 'center'
})

const ClockBox = styled(Typography)({
    fontFamily: 'Qahiri',
    fontSize: '2.5em',
    display: "inline-block",
    padding: "0 .2em",
})

const GreenBox = styled(ClockBox)({
    color: '#77A48B'
})

const WarningBox = styled(ClockBox)({
    color: '#DAB14A'
})

const ErrorBox = styled(ClockBox)({
    color: '#EA6546'
})

const MyClockIcon = styled(AccessAlarmIcon)({
    fontSize: '2em'
})

export default function GamingCountDown({ lineCountStart, lineCountCurrent }) {

    const waitingTime = process.env.NEXT_PUBLIC_GAMING_LINE_COUNTER;

    const diff = lineCountStart && lineCountCurrent && lineCountCurrent > lineCountStart ? differenceInSeconds(addSeconds(lineCountStart, waitingTime), lineCountCurrent) : waitingTime;

    const displayTime = lineCountStart && lineCountCurrent && diff > 0 ? format(new Date(addSeconds(lineCountStart, waitingTime) - lineCountCurrent), 'mm:ss') : "--:--"

    let boxCounter = <GreenBox>{displayTime}</GreenBox>;
    if (diff <= process.env.REACT_APP_GAMING_ERROR_LINE_COUNTER) {
        boxCounter = <ErrorBox>{displayTime}</ErrorBox>
    } else if (diff <= process.env.REACT_APP_GAMING_WARN_LINE_COUNTER) {
        boxCounter = <WarningBox>{displayTime}</WarningBox>
    }

    return <MyGrid><div><MyClockIcon /></div>{boxCounter}</MyGrid>

}