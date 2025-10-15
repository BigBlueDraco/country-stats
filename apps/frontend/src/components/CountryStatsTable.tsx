import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import React, { useMemo, useState } from "react";
import type {
  CountryStats,
  CountryStatsResponse,
  SortOrder,
  CountryStatsKeys,
} from "../types";
import { TABLE_CONFIG } from "../constants";
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends string | number>(
  order: SortOrder,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const TABLE_HEADERS = [
  {
    key: "code" as const,
    label: "Country Code",
    align: "left" as const,
  },
  {
    key: "visitors" as const,
    label: "Visitors",
    align: "left" as const,
  },
] as const;

interface EnhancedTableHeadProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: CountryStatsKeys
  ) => void;
  order: SortOrder;
  orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableHeadProps) {
  const { order, orderBy, onRequestSort } = props;

  const createSortHandler =
    (property: CountryStatsKeys) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {TABLE_HEADERS.map((header) => (
          <TableCell
            key={header.key}
            align={header.align}
            sortDirection={orderBy === header.key ? order : false}
          >
            <TableSortLabel
              active={orderBy === header.key}
              direction={orderBy === header.key ? order : "asc"}
              onClick={createSortHandler(header.key)}
            >
              {header.label}
              {orderBy === header.key ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface CountryStatsTableProps {
  data: CountryStatsResponse;
}

export function CountryStatsTable({ data }: CountryStatsTableProps) {
  const [order, setOrder] = useState<SortOrder>("asc");
  const [orderBy, setOrderBy] = useState<CountryStatsKeys>("code");

  const tableRows: CountryStats[] = useMemo(() => {
    return Object.entries(data).map(([code, visitors]) => ({ code, visitors }));
  }, [data]);

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: CountryStatsKeys
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedRows = useMemo(() => {
    return stableSort(tableRows, getComparator(order, orderBy));
  }, [order, orderBy, tableRows]);

  if (!data || Object.keys(data).length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          No country statistics available
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 0,
      }}
    >
      <Table
        sx={{ minWidth: TABLE_CONFIG.MIN_WIDTH }}
        aria-label={TABLE_CONFIG.ARIA_LABEL}
        stickyHeader
      >
        <EnhancedTableHead
          order={order}
          orderBy={orderBy}
          onRequestSort={handleRequestSort}
        />
        <TableBody>
          {sortedRows.map((row) => (
            <TableRow
              key={row.code}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.code}
              </TableCell>
              <TableCell align="left">
                {row.visitors.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CountryStatsTable;
