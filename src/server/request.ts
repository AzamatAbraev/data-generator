import axios from "axios";

const request = axios.create({
  baseURL: "https://random-data-generator.up.railway.app/",
  timeout: 10000,
});

export default request;
