import axios from 'axios';

function sendScrappedDataToBackend(data) {
  axios.post('/api/scrappedData', data)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
}

export default sendScrappedDataToBackend;
