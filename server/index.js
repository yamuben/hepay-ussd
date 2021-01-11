
import express from "express";

import ussdRouter from './Routes/ussdRoute';


const app = express();
app.get("/api", (req, res) => {
    res.send({ Server: " Welcome to Rwanda Hepay USSD server" });
  });


app.use("/", ussdRouter);





export default app;
