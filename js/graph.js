/* global _ */
/*  global shouldStore getObjects writeObject generateDate retDataNames d3 nv */

const filterBoards = (allObj, preGist) => {
  const someBoards = allObj.filter((single) => {
    if (!preGist.state.ignore) return true;
    let shouldFilter;
    if (preGist.state.page === 'board') {
      shouldFilter = !_.includes(preGist.blackList.boards, single.key);
    } else if (preGist.state.page === 'list') {
      shouldFilter = !_.includes(preGist.blackList.lists, single.key);
    }
    return shouldFilter;
  });
  return someBoards;
};
const populateName = (allObj, preGist) => {
  const named = allObj.map((single) => {
    const retBoard = { values: single.values };
    if (preGist.state.page === 'board') {
      retBoard.key = _.find(preGist.boards, { id: single.key }).name;
    } else if (preGist.state.page === 'list') {
      retBoard.key = _.find(preGist.state.obj.lists, { id: single.key }).name;
    }
    return retBoard;
  });
  return named;
};
const compareNested = (a, b) => {
  const compared = a[0] - b[0];
  return compared;
};
const padder = (allDates, nestedArraysObj) => {
  const fullNestedArrays = nestedArraysObj.data.map((single) => {
    if (single.values.length === allDates.length) return single;
    allDates.forEach((date) => {
      if (!_.includes(_.flatMap(single.values), date)) {
        single.values.push([date, 0]);
      }
    });
    const singleSorted = {
      key: single.key,
      values: single.values.sort(compareNested)
    };
    return singleSorted;
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
  flatData.forEach((date) => {
    theseDates.push(date.date);
    if (page === 'board') {
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
    } else if (page === 'list') {
      const bN = _.findIndex(date.data.boards, { id: preGist.state.obj.id });
      date.data.boards[bN].lists.forEach((list) => {
        const existKeyIndex = _.findIndex(formattedData.data, (o) => {
          const wasFound = o.key === list.id;
          return wasFound;
        });
        if (existKeyIndex < 0) {
          formattedData.data.push({
            key: list.id,
            values: [[date.date, list.totalCards]]
          });
        } else {
          formattedData.data[existKeyIndex].values.push(
            [date.date, list.totalCards]
          );
        }
      });
    }
  });
  const fullFormattedData = padder(theseDates, formattedData);
  const fullFilteredData = filterBoards(fullFormattedData, preGist);
  const fullNamedData = populateName(fullFilteredData, preGist);
  return fullNamedData;
};
const nvRender = (page, pageObj, preGist) => {
  const week = 1000 * 60 * 60 * 24 * 7;
  retDataNames(Date.now() - week, null, null).then((names) => {
    getObjects(names).then((allData) => {
      const graphData = formatData(allData.data, page, preGist);
      window.graphData = graphData;

      nv.addGraph(() => {
        const chart = nv.models.stackedAreaChart()
          .margin({ right: 100 })
          .x((d) => { return d[0]; })
          .y((d) => { return d[1]; })
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
