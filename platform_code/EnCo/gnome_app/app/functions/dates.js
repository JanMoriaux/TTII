var moment = require("moment-timezone");

export function convertUtcToCetTimeString(UtcString) {
  let CetString = convertToCetString(UtcString);
  return moment(CetString).format("HH:mm:ss");
}

export function convertUtcToCetDateString(UtcString) {
  let CetString = convertToCetString(UtcString);
  return moment(CetString).format("DD/MM/YYYY");
}

export function convertUtcToCetShortDateString(UtcString) {
  let CetString = convertToCetString(UtcString);
  return moment(CetString).format("DD/MM");
}

export function convertToCetString(UTCTimeString) {
  return moment.tz(UTCTimeString, "Europe/Berlin").format();
}
