const mailData = {
  host: "smtp.126.com",
  auth: {
    user: "xxxxxx",
    pass: "xxxxxx",
  },
  from: '"ale0720" <ale0720@126.com>',
  to: "xxxxxxx",
  subject: "xxxxxx！",
  banner: "xxxxxx", // 使用指定的banner 或者通过爬虫设置
};

// 天气位置
const local = "xxxxx";

const loveData = {
  start: "2011/07/20",
  firstMeet: "2011/01/11",
  local,
};

const settings = {
  hour: 7,
  minute: 30,
  oneUrl: "http://wufazhuce.com/",
  weatherUrl: `https://tianqi.moji.com/weather/china/${local}`,
};

module.exports = {
  mailData,
  loveData,
  settings,
};
