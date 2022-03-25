import React from 'react';

import { format } from 'date-fns'

export default function GamingHeader({ endTime, currentTime, startTime }) {

    const displayTime = format(new Date((endTime ? endTime : currentTime) - startTime), 'mm:ss')


    return <h2>Jeux {startTime && startTime < currentTime && displayTime}</h2>
}