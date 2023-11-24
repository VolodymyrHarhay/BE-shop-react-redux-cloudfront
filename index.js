const serverless = require('serverless-http');
const express = require('express');
const { default: axios } = require('axios');
require('dotenv').config();
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;
 
app.use((req, res) => {
  console.log('originalUrl = ', req.originalUrl);
  console.log('method = ', req.method);
  console.log('body = ', req.body);

  const recipient = req.originalUrl.split('/')[1];
  console.log('recipient = ', recipient);
  console.log('process.env = ', process.env);
  const recipientUrl = process.env[recipient];
  console.log({recipientUrl});

  if(recipientUrl) {
    const asiosConfig = {
      method: req.method,
      url: `${recipientUrl}${req.originalUrl}`,
      ...(Object.keys(req.body || {}).length > 0 && {data: req.body})
    };

    if(recipient === 'cart') {
      asiosConfig.headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Basic Vk9MT0RZTVlSSEFSSEFZOlRFU1RfUEFTU1dPUkQ='
      }
    };

    console.log('axios.config = ', asiosConfig);
    axios(asiosConfig)
      .then((response) =>{
        console.log('response from recipient = ', response.data);
        res.send(response.data);
      })
      .catch(error => {
        console.log('error from recipient = ', JSON.stringify(error));
        if(error.response) {
          const { status, data } = error.response;
          res.status(status).json(data);
        } else {
          res.status(500).json({error: error.message})
        }
      });
  } else {
    res.status(502).json({error: 'Cannot process request'});
  }
});

app.listen(PORT, () => {
  console.log(`app listening at http://localhost:${PORT}`);
});
 
module.exports.handler = serverless(app);
