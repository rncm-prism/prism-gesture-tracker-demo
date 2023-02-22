import React, { useState, } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, } from '@mui/material/';
import { Typography, Collapse, IconButton, } from '@mui/material/';


const DEFAULT_CONTROLS = [
  { label: "Voicing confidence threshold", description: "CREPE confidence level in the presence of a pitch.", },
  { label: "Min gesture length", description: "Minimum length for a tracked sequence of pitches. Sequences below this length will not be considrred gesture candidates, and will be ignored.", },
  { label: "Max gesture segment gap", description: "Maximum number of sequential values below the voicing confidence threshold, after which a new value above the threshold will be considered the start of a new gesture candidate.", },
]

const Row = ({ row }) => {

  const values = Object.values(row);

  return (
    <TableRow>
      { values.map((val) => <TableCell>{ val }</TableCell>) }
    </TableRow>
  )
}

const ControlsGuide = ({ controls=DEFAULT_CONTROLS, }) => {

  return (
    <TableContainer component={Paper} sx={{ width: "60%", margin: "auto", marginTop: "0", }}>
      <Typography sx={{ fontWeight: 500, padding: "2px 16px", }}>Guide to Controls</Typography>
      <Table sx={{ maxWidth: 960, margin: "auto", }} size="small" aria-label="controls guide">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "45%", }}>Name</TableCell>
            <TableCell sx={{ width: "55%", }}>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            controls && controls.length > 0 &&
            controls.map((row) => <Row row={row}/>)
          }
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ControlsGuide;