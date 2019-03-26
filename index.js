const path = require("path");
const nodemailer = require("nodemailer");
const schedule = require("node-schedule");
const template = require("art-template");
const superagent = require("superagent");
const cheerio = require("cheerio");

const { mailData, loveData, settings } = require("./config.js");
const { removeBlank, getToday, getTogetherDays } = require("./utils.js");

/**
 * 获取 ONE 数据
 * @returns
 */
function getOneData() {
  return new Promise((resolve, reject) => {
    superagent.get(settings.oneUrl).end(function(err, res) {
      if (err) {
        reject(err);
      }
      const $ = cheerio.load(res.text);
      const todayItem = $("#carousel-one .carousel-inner .item")[0];
      const imgUrl = $(todayItem)
        .find(".fp-one-imagen")
        .attr("src");
      const text = $(todayItem)
        .find(".fp-one-cita")
        .text();
      const todayData = {
        imgUrl,
        text: removeBlank(text),
      };
      resolve(todayData);
    });
  });
}

/**
 * 爬取天气数据
 * @returns
 */
function getWeatherData() {
  return new Promise((resolve, reject) => {
    superagent.get(settings.weatherUrl).end(function(err, res) {
      if (err) {
        reject(err);
      }
      const $ = cheerio.load(res.text);
      const tips = $(".wea_tips")
        .find("em")
        .text();
      const today = $(".forecast .days")[0];
      const weather = $(today).find("li");
      const weaImg = $(weather[1])
        .find("img")
        .attr("src");
      const weaText = $(weather[1]).text();
      const temper = $(weather[2]).text();
      const wind = $(weather[3])
        .text()
        .replace(/\s*/g, "");
      const airQuality = $(weather[4]).text();
      const weatherData = {
        tips: removeBlank(tips),
        weaImg,
        weaText: removeBlank(weaText),
        temper,
        wind,
        airQuality: removeBlank(airQuality),
      };

      resolve(weatherData);
    });
  });
}

/**
 * 发送邮件
 */
async function sendMail(data) {
  const {
    host,
    auth: { user, pass },
    from,
    to,
    subject,
  } = mailData;
  // 开启压缩
  template.defaults.minimize = true;
  const html = template(path.resolve(__dirname, "mail.art"), data);

  const transporter = nodemailer.createTransport({
    host,
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
  });
  const mailOptions = {
    from,
    to,
    subject,
    html,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("MailToMyBaby: %s", info.messageId);
  } catch (error) {
    console.log(error);
    sendMail(data);
  }
}

async function main() {
  const together = getTogetherDays(loveData.start);
  const today = getToday();

  try {
    const requests = [getOneData(), getWeatherData()];
    const data = await Promise.all(requests);
    const htmlData = {
      title: mailData.subject,
      banner: mailData.banner, // 或者使用爬取的 ONE 上的图片
      together,
      today,
      ...data[0],
      ...data[1],
    };
    sendMail(htmlData);
  } catch (error) {
    console.log(error);
    main();
  }
}

(function() {
  const { hour, minute } = settings;
  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [0, new schedule.Range(1, 6)];
  rule.hour = hour;
  rule.minute = minute;
  console.log("MailToMyBaby: 期待美好的一刻~~~");
  let job = schedule.scheduleJob(rule, function() {
    console.count("MailToMyBaby: Everything is fine!");
    main();
  });
})();
