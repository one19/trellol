/* global _ */
/*  global shouldStore getObjects writeObject generateDate retDataNames d3 nv */
const filterBoards = (allBoards, preGist) => {
  const someBoards = allBoards.filter((board) => {
    if (!preGist.state.ignore) return true;
    const shouldFilter = !_.includes(preGist.blackList.boards, board.key);
    return shouldFilter;
  });
  return someBoards;
};
const populateName = (fullObj, preGist) => {
  const named = fullObj.map((board) => {
    const retBoard = { values: board.values };
    retBoard.key = _.find(preGist.boards, { id: board.key }).name;
    return retBoard;
  });
  return named;
};
const compareNested = (a, b) => {
  const compared = a[0] - b[0];
  return compared;
};
const padder = (allDates, nestedArraysObj) => {
  const fullNestedArrays = nestedArraysObj.data.map((board) => {
    if (board.values.length === allDates.length) return board;
    allDates.forEach((date) => {
      if (!_.includes(_.flatMap(board.values), date)) {
        board.values.push([date, 0]);
      }
    });
    const boardSorted = {
      key: board.key,
      values: board.values.sort(compareNested)
    };
    return boardSorted;
  });
  return fullNestedArrays;
};
const formatData = (histData, page, preGist) => {
  const flatData = histData.map((dat) => {
    const parsedDataPoint = JSON.parse(dat.data);
    return parsedDataPoint;
  });
  const formattedData = { data: [] };
  const theseDates = [];
  if (page === 'board') {
    flatData.forEach((date) => {
      theseDates.push(date.date);
      date.data.boards.forEach((board) => {
        const existKeyIndex = _.findIndex(formattedData.data, (o) => {
          const wasFound = o.key === board.id;
          return wasFound;
        });
        if (existKeyIndex < 0) {
          formattedData.data.push({
            key: board.id,
            values: [[date.date, board.unDoneCards]]
          });
        } else {
          formattedData.data[existKeyIndex].values.push(
            [date.date, board.unDoneCards]
          );
        }
      });
    });
  }
  const fullFormattedData = padder(theseDates, formattedData);
  const fullFilteredData = filterBoards(fullFormattedData, preGist);
  const fullNamedData = populateName(fullFilteredData, preGist);
  return fullNamedData;
};
const nvRender = (page, pageObj, preGist) => { // eslint-disable-line
  const week = 1000 * 60 * 60 * 24 * 7;
  retDataNames(Date.now() - week, null, null).then((names) => {
    getObjects(names).then((allData) => {
      const graphData = formatData(allData.data, page, preGist);
      window.graphData = graphData;

      nv.addGraph(() => {
        const chart = nv.models.stackedAreaChart()
          .margin({ right: 100 })
          .x((d) => { return d[0]; }) // eslint-disable-line
          .y((d) => { return d[1]; }) // eslint-disable-line
          .useInteractiveGuideline(true)    // Tooltips which show all data points. Very nice!
          .rightAlignYAxis(true)      // Let's move the y-axis to the right side.
          .showControls(true)       // Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.
          .clipEdge(true);

        // Format x-axis labels with custom function.
        chart.xAxis
          .tickFormat((d) => {
            const formattedTime = d3.time.format('%x')(new Date(d));
            return formattedTime;
          });

        chart.yAxis
          .tickFormat(d3.format(',.2f'));

        d3.select('#graphBack svg')
          .datum(graphData)
          .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
      });
    });
  });
};
