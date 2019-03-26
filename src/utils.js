/**
 * 去除字符串首尾的空白字符
 * @param {*} str
 * @returns
 */
function removeBlank(str) {
  const pattern = /(^\s*) | (\s*$)/g;
  return str.replace(pattern, "");
}

/**
 * 获取今天的日期
 * @returns
 */
function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return [year, month, day].map(padZero).join(" / ");
}

/**
 * 不足两位前面补零
 * @param {*} num
 * @returns
 */
function padZero(num) {
  return num.toString().padStart(2, "0");
}

/**
 * 计算时间差，精确到天数
 * @returns
 */
function getTogetherDays(date) {
  const start = new Date(date);
  const today = Date.now();

  return ~~((today - start) / (1000 * 60 * 60 * 24)) + 1;
}

module.exports = {
  removeBlank,
  getToday,
  getTogetherDays,
};
