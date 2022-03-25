import React from 'react';

import { differenceInSeconds, format } from 'date-fns'

export default function GamingTestMode({ word, lineCountCurrent, lineCountStart, currentLine, startTime, currentTime, endTime }) {

    return <>
        <p>mot: {word}</p>
        <p>diff: {differenceInSeconds(lineCountCurrent, lineCountStart)}</p>
        <p>currentLine: {currentLine}</p>
        <p>startTime: <b>{startTime && format(startTime, "dd/MM/yyyy HH:mm:ss")}</b> currentTime: <b>{currentTime && format(currentTime, "dd/MM/yyyy HH:mm:ss")}</b> endTime: <b>{endTime && format(endTime, "dd/MM/yyyy HH:mm:ss")}</b> </p>
    </>

}