var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')
//import dayjs from 'dayjs' // ES 2015
//dayjs().format()

dayjs.extend(utc)
dayjs.extend(timezone)

let n = dayjs.tz().tz("Europe/London");
console.log(n.format("hh:mm A"));