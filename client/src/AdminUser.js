import React, { useState, useEffect } from 'react';

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

export default function AdminUser() {

    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch(`/api/user`)
            .then((res) => res.json())
            .then((data) => setUsers(data));
    }, []);

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Utilisateurs</StyledTableCell>
                        <StyledTableCell>Role</StyledTableCell>
                        <StyledTableCell>Validé</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user, key) => (
                        <StyledTableRow key={key}>
                            <StyledTableCell component="th" scope="row">
                                {user.email}
                            </StyledTableCell>
                            <StyledTableCell>
                                {user.role}
                            </StyledTableCell>
                            <StyledTableCell>
                                <Checkbox checked={user.validate} onChange={
                                    () => {
                                        const validate = !user.validate
                                        const us = users.map(u => {
                                            if (u.email === user.email) {
                                                return {
                                                    ...u,
                                                    validate
                                                }
                                            } else {
                                                return u
                                            }
                                        })
                                        setUsers(us)
                                        fetch("/api/user", {
                                            method: "PUT",
                                            headers: {
                                                'Accept': 'application/json, text/plain, */*',
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({
                                                ...user,
                                                validate
                                            })
                                        })
                                    }
                                } />
                            </StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
