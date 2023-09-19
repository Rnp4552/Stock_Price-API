const express = require("express");
const { default: puppeteer } = require("puppeteer");
const nodecron = require("node-cron");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

const port =  5000;

// console.log("hello users");

nodecron.schedule("* * * * *", async () => {
  console.log("nodecron is in working process");
});

app.get("/", (req, res) => {
  res.send("this is homepage");
});


var stockApi;


async function scrapping(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const [elementone] = await page.$x(
    "/html/body/div/div[2]/div[2]/div[2]/div/div/div[1]/div/div/table/tbody/tr[1]/td[1]/a"
  );
  const text = await elementone.getProperty("textContent");
  const sName = await text.jsonValue();

  console.log([elementone]);
  console.log(text);
  console.log(sName);
  const [elementtwo] = await page.$x(
    "/html/body/div/div[2]/div[2]/div[2]/div/div/div[1]/div/div/table/tbody/tr[1]/td[3]/text()"
  );
  const pricesrc = await elementtwo.getProperty("textContent");
  const priceval = await pricesrc.jsonValue();

  const [elementthree] = await page.$x(
    "/html/body/div/div[2]/div[2]/div[2]/div/div/div[1]/div/div/table/tbody/tr[1]/td[4]"
  );
  const lowsrc = await elementthree.getProperty("textContent");
  const lowval = await lowsrc.jsonValue();

  const [elementfourth] = await page.$x(
    "/html/body/div/div[2]/div[2]/div[2]/div/div/div[1]/div/div/table/tbody/tr[1]/td[5]"
  );
  const highsrc = await elementfourth.getProperty("textContent");
  const highval = await highsrc.jsonValue();

  
  const [elementfifth] = await page.$x(
    "/html/body/div/div[2]/div[2]/div[2]/div/div/div[1]/div/div/table/tbody/tr[1]/td[3]/div"
  );
  const downsrc = await elementfifth.getProperty("textContent");
  const downval = await downsrc.jsonValue();

  // console.log(downval)

  let downvalmod = downval.replace(/\(.*?\)/gm, "");
  downvalmod = downvalmod.replace(/\+/g, "");
  downvalmod = downvalmod.replace(/\-/g, "");
  pricevalmod = priceval.replace(/\₹/g, "");

  let pricetemp = (downvalmod / pricevalmod) * 100;
  let percentage = parseFloat(pricetemp + 2).toFixed(2);
    console.log(percentage);
  if (percentage * 100 > 1000) {
    function sendMail() {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GID,
          pass: process.env.GPW,
        },
        tls: {
          rejectUnauthorized: false,
        }
      });

      let maildetail = {
        from: process.env.GID,
        to: process.env.GTO,
        subject: `your stock is down by ${percentage}%`,
        text: `your stock ${sName} is down by ${downval}, current price is ${priceval}`,
      }
    

    transporter.sendMail(maildetail, function (err, data) {
      if (err) {
        console.log("error is occuring" + err);
      } else {
        console.log("Mail send successfully");
      }
    });
    
  }

  sendMail();
  }


stockApi = {
  stockname: sName,
  currentprice: priceval,
  lowprice: lowval,
  highprice: highval,
  downprice: downval,
};

browser.close();
}

scrapping("https://groww.in/markets/top-losers?index=GIDXNIFTY100");

app.listen(port, () => {
  console.log(`server is running on ${port} port number`);
});
