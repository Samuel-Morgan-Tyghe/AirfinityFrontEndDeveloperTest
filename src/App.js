import React, { useState, useEffect } from "react";
import "./App.css";
import {
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  useExpanded,
} from "react-table";
import axios from "axios";
import GlobalFilter from "./globalFilter";

function App() {
  const [apiData, setApiData] = useState("");

  useEffect(() => {
    axios
      .get("https://disease.sh/v3/covid-19/nyt/counties?lastdays=1")
      .then(function (response) {
        // create an emcompassing array with state, totaldeaths/cases and array of individual objects ( counties)

        // init variables
        let tempState = response.data[0].state;
        let stateArray = [];
        let totalDeaths = 0;
        let totalCases = 0;
        let totalStateData = [];
        let tempTotalStateData;

        // iterate through data sorting , this assumes its categorised

        for (let i = 0; i < response.data.length; i++) {
          // has this changed geographical state?
          if (response.data[i].state == tempState) {
            // nope then add the categorise new data onto an array of that geographical state
            let tempObject = {
              State: response.data[i].county,
              County: response.data[i].county,
              Cases: response.data[i].cases,
              Deaths: response.data[i].deaths,
            };
            stateArray.push(tempObject);

            // work out parent total numbers
            totalCases += response.data[i].cases;
            totalDeaths += response.data[i].deaths;
          } else {
            // new geographical state, add the array of all ie alaska's info plus child content to master array
            tempTotalStateData = {
              State: tempState,
              Cases: totalCases,
              Deaths: totalDeaths,
              subRows: stateArray,
            };
            // update geo state to new geo state
            tempState = response.data[i].state;
            // push array of all state data and all its countys onto an array of all states
            totalStateData.push(tempTotalStateData);

            // reset variables move onto next state
            stateArray = [];
            totalCases = 0;
            totalDeaths = 0;

            let tempObject = {
              State: tempState,
              County: response.data[i].county,
              Cases: response.data[i].cases,
              Deaths: response.data[i].deaths,
            };
            stateArray.push(tempObject);
          }
        }
        // update state
        setApiData(totalStateData);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);
  // when state changes update info in table
  const data = apiData ? apiData : [];

  // the following is using react-table library ( used in Chakra) just following documentation
  const columns = React.useMemo(
    () => [
      {
        id: "expander",
        Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }) => (
          <span {...getToggleAllRowsExpandedProps({})}>
            {isAllRowsExpanded ? "👇" : "👉"}
          </span>
        ),
        Cell: ({ row }) =>
          row.canExpand ? (
            <span
              {...row.getToggleRowExpandedProps({
                style: {
                  paddingLeft: `${row.depth * 2}rem`,
                },
              })}
            >
              {row.isExpanded ? "👇" : "👉"}
            </span>
          ) : null,
      },

      {
        Header: "State",
        accessor: "State",
      },
      {
        Header: "Total Cases",
        accessor: "Cases",
      },
      {
        Header: "Deaths",
        accessor: "Deaths",
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    visibleColumns,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    { columns, data },
    useFilters,
    useGlobalFilter,
    useSortBy,
    useExpanded
  );

  const firstPageRows = rows.slice(0, 20);

  return (
    <>
      <table {...getTableProps()} style={{ border: "solid 1px blue" }}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  style={{
                    background: "aliceblue",
                    color: "black",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
          <tr>
            <th
              colSpan={visibleColumns.length}
              style={{
                textAlign: "left",
              }}
            >
              <GlobalFilter
                preGlobalFilteredRows={preGlobalFilteredRows}
                globalFilter={state.globalFilter}
                setGlobalFilter={setGlobalFilter}
              />
            </th>
          </tr>
        </thead>

        <tbody {...getTableBodyProps()}>
          {firstPageRows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  prepareRow(row);
                  return (
                    <td
                      {...cell.getCellProps()}
                      style={{
                        padding: "10px",
                        border: "solid 1px gray",
                      }}
                    >
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div>Showing the first 20 results of {rows.length} rows</div>
    </>
  );
}
export default App;
