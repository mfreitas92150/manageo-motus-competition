import React, { useState, useEffect } from 'react';

import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';


import AdminAddWord from './AdminAddWord'

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

export default function AdminWord() {

    const [words, setWords] = useState([]);
    const [showAddWord, setShowAddWord] = useState(false)

    useEffect(() => {
        fetch(`/api/word`)
            .then((res) => res.json())
            .then((data) => setWords(data));
    }, []);

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Listes de mots</StyledTableCell>
                        <StyledTableCell align="right">
                            <AddBoxIcon onClick={() => setShowAddWord(true)} />
                        </StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {words.map((row, key) => (
                        <StyledTableRow key={key}>
                            <StyledTableCell component="th" scope="row">
                                {row.word}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                                <DeleteForeverIcon onClick={() => {
                                    setWords(words.filter(word => word.word !== row.word))
                                    fetch(`/api/word?word=${row.word}`, {
                                        method: "DELETE"
                                    })
                                }} />
                            </StyledTableCell>
                        </StyledTableRow>
                    ))}
                    {showAddWord && <AdminAddWord
                        handleClose={() => {
                            setShowAddWord(false)
                        }}
                        submitWord={(word) => {
                            setWords([...words, { word }])

                            fetch("/api/word", {
                                method: "POST",
                                headers: {
                                    'Accept': 'application/json, text/plain, */*',
                                    'Content-Type': 'application/json'
                                  },
                                body: JSON.stringify({
                                    word
                                })
                            })

                            setShowAddWord(false)
                        }}
                    />}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
