import React, { useState, useEffect } from "react";

import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button, Stack, Typography } from "@mui/material";
import { addDays, format } from "date-fns";

import CreateChampionship from "./CreateChampionship";
import UserChampionship from "./UserChampionship";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#4A63A1",
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const DateStyledTableCell = styled(StyledTableCell)(() => ({
  width: "20em",
}));

const ActionStyledTableCell = styled(StyledTableCell)(() => ({
  width: "3em",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default function Championship() {
  const [championships, setChampionship] = useState([]);
  const [refresh, toggleRefresh] = useState(false);
  const [championshipCreateModal, setChampionshipCreateModal] = useState(null);
  const [championshipUserModal, setChampionshipUserModal] = useState(null);

  const handleOpen = () => {
    const begin = new Date();
    const end = addDays(new Date(), 15);
    setChampionshipCreateModal({
      name: `Championnat du ${format(begin, "dd/MM/yyyy")} au ${format(
        end,
        "dd/MM/yyyyy"
      )}`,
      begin,
      end,
    });
  };
  const handleClose = () => {
    setChampionshipCreateModal(null);
  };

  useEffect(() => {
    fetch(`/api/championship`)
      .then((res) => res.json())
      .then((data) => {
        setChampionship(data);
      });
  }, [refresh]);

  return (
    <TableContainer component={Paper}>
      {championshipCreateModal && (
        <CreateChampionship
          element={championshipCreateModal}
          handleClose={handleClose}
        />
      )}
      {championshipUserModal && (
        <UserChampionship
          championship={championshipUserModal}
          handleClose={() => setChampionshipUserModal(null)}
        />
      )}
      <Typography>Pour voir les modifications, veuillez rafraichir</Typography>
      <Table aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Nom</StyledTableCell>
            <DateStyledTableCell>Début</DateStyledTableCell>
            <DateStyledTableCell>Fin</DateStyledTableCell>
            <ActionStyledTableCell>
              <Stack spacing={2} direction="row">
                <Button>
                  <RefreshIcon onClick={() => toggleRefresh(!refresh)} />
                </Button>
                <Button>
                  <AddIcon onClick={handleOpen} />
                </Button>
              </Stack>
            </ActionStyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {championships.map((championship, key) => (
            <StyledTableRow key={key}>
              <StyledTableCell component="th" scope="row">
                {championship.name}
              </StyledTableCell>
              <StyledTableCell>
                {format(new Date(championship?.begin), "dd/MM/yyyy")}
              </StyledTableCell>
              <StyledTableCell>
                {format(new Date(championship?.end), "dd/MM/yyyy")}
              </StyledTableCell>
              <StyledTableCell>
                <Stack spacing={2} direction="row">
                  <Button>
                    <EditIcon
                      onClick={() =>
                        setChampionshipCreateModal({
                          id: championship.id,
                          name: championship.name,
                          begin: championship.begin,
                          end: championship.end,
                        })
                      }
                    />
                  </Button>
                  <Button>
                    <DeleteIcon
                      onClick={() => {
                        fetch(`/api/championship?id=${championship.id}`, {
                          method: "DELETE",
                          headers: {
                            Accept: "application/json, text/plain, */*",
                            "Content-Type": "application/json",
                          },
                        });
                      }}
                    />
                  </Button>
                  <Button>
                    <PersonIcon
                      onClick={() => {
                        setChampionshipUserModal({
                          id: championship.id,
                          name: championship.name,
                        });
                      }}
                    />
                  </Button>
                </Stack>
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
