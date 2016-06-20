const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const PORT = process.env.port;

const app = express();

const err = (error) => {
  console.log('ERROR: ', error);
};

app.use('/css', express.static(`${__dirname}/css`));
app.use('/js', express.static(`${__dirname}/js`));
app.use('/data', express.static(`${__dirname}/data`));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

app.get('/data', (req, res) => {
  new Promise((resolve, reject) => {
    // if (err) throw error; //this errors, find out why
    fs.readdir('./data', (error, list) => {
      if (error) return reject(error);
      return resolve(list.map((e) => {
        const shortened = e.slice(0, -5);
        return shortened;
      }));
    });
  }).then((list) => {
    res.send({ data: list });
  }).catch((error) => {
    err(error);
  });
});

app.post('/data', (req, res) => {
  new Promise((resolve, reject) => {
    fs.writeFile(`data/${Date.now()}.json`, JSON.stringify(req.body), (error, data) => {
      if (error) return reject(error);
      return resolve(data);
    });
  }).then((data) => {
    res.send({ data });
  }).catch((error) => {
    err(error);
  });
});

app.post('/times', (req, res) => {
  const all = [];
  JSON.parse(req.body.data).forEach((timeStamp) => {
    const p = new Promise((resolve, reject) => {
      fs.readFile(`data/${timeStamp}.json`, (error, data) => {
        if (error) return reject(error);
        return resolve(JSON.parse(data));
      });
    });
    all.push(p);
  });
  Promise.all(all).then((allObjects) => {
    res.send({ data: allObjects });
  }).catch((error) => {
    err(error);
  });
});

const server = app.listen(PORT || 3002, () => {
  console.log('Server running at http://localhost:', server.address().port);
});

module.exports = app;
