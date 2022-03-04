import React, { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "#4A63A1",
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export default function Ranking() {
    const [ranking, setRanking] = useState([])

    useEffect(() => {
        fetch(`/api/ranking`)
            .then((res) => res.json())
            .then((data) => setRanking(data));

    }, [])
    return <Container>
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Utilisateurs</StyledTableCell>
                        <StyledTableCell>Points</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {ranking.map((user, key) => (
                        <StyledTableRow key={key}>
                            <StyledTableCell component="th" scope="row">
                                {user.email}
                            </StyledTableCell>
                            <StyledTableCell>
                                {user.rank}
                            </StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Container>
}