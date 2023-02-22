import React, { useState, } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, } from '@mui/material/';
import { Typography, Collapse, IconButton, } from '@mui/material/';


const DEFAULT_GESTURES = [
  { label: "a", description: "Upward short runs", },
  { label: "b", description: "Downward short runs", },
  { label: "c", description: "Repeated notes, staccato", },
  { label: "d", description: "Upward rips", },
  { label: "e", description: "Downward rips", },
  { label: "f", description: "Long trill", },
  { label: "h", description: "Long flutter tongue", },
  { label: "j", description: "Long cresc-dim", },
]

const Row = ({ row }) => {

  const values = Object.values(row);

  return (
    <TableRow>
      { values.map((val) => <TableCell>{ val }</TableCell>) }
    </TableRow>
  )
}

const GestureList = ({ gestures=DEFAULT_GESTURES, }) => {

  return (
    <TableContainer component={Paper} sx={{ width: "40%", margin: "auto", marginTop: "0", }}>
      <Typography sx={{ fontWeight: 500, padding: "2px 16px", }}>List of Gestures</Typography>
      <Table sx={{ maxWidth: 960, margin: "auto", }} size="small" aria-label="gesture list">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "30%", }}>Label</TableCell>
            <TableCell sx={{ width: "70%", }}>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            gestures && gestures.length > 0 &&
            gestures.map((row) => <Row row={row}/>)
          }
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default GestureList;