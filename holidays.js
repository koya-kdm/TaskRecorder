/*------------------------------
  GLOBAL_VAR: gHolidays
-------------------------------*/
var gHolidays = [
'2016-01-01', // 元日
'2016-01-11', // 成人の日
'2016-02-11', // 建国記念の日
'2016-03-20', // 春分の日
'2016-03-21', // 振替休日
'2016-04-29', // 昭和の日
'2016-05-03', // 憲法記念日
'2016-05-04', // みどりの日
'2016-05-05', // こどもの日
'2016-07-18', // 海の日
'2016-08-11', // 山の日
'2016-09-19', // 敬老の日
'2016-09-22', // 秋分の日
'2016-10-10', // 体育の日
'2016-11-03', // 文化の日
'2016-11-23', // 勤労感謝の日
'2016-12-23', // 天皇誕生日

'2017-01-01', // 元日
'2017-01-02', // 振替休日
'2017-01-09', // 成人の日
'2017-02-11', // 建国記念の日
'2017-03-20', // 春分の日
'2017-04-29', // 昭和の日
'2017-05-03', // 憲法記念日
'2017-05-04', // みどりの日
'2017-05-05', // こどもの日
'2017-07-17', // 海の日
'2017-08-11', // 山の日
'2017-09-18', // 敬老の日
'2017-09-23', // 秋分の日
'2017-10-09', // 体育の日
'2017-11-03', // 文化の日
'2017-11-23', // 勤労感謝の日
'2017-12-23', // 天皇誕生日

'2018-01-01', // 元日
'2018-01-08', // 成人の日
'2018-02-11', // 建国記念の日
'2018-02-12', // 振替休日
'2018-03-21', // 春分の日
'2018-04-29', // 昭和の日
'2018-04-30', // 振替休日
'2018-05-03', // 憲法記念日
'2018-05-04', // みどりの日
'2018-05-05', // こどもの日
'2018-07-16', // 海の日
'2018-08-11', // 山の日
'2018-09-17', // 敬老の日
'2018-09-23', // 秋分の日
'2018-09-24', // 振替休日
'2018-10-08', // 体育の日
'2018-11-03', // 文化の日
'2018-11-23', // 勤労感謝の日
'2018-12-23', // 天皇誕生日
'2018-12-24', // 振替休日

'2019-01-01', // 元日
'2019-01-14', // 成人の日
'2019-02-11', // 建国記念の日
'2019-03-21', // 春分の日
'2019-04-29', // 昭和の日
'2019-05-03', // 憲法記念日
'2019-05-04', // みどりの日
'2019-05-05', // こどもの日
'2019-05-06', // 振替休日
'2019-07-15', // 海の日
'2019-08-11', // 山の日
'2019-08-12', // 振替休日
'2019-09-16', // 敬老の日
'2019-09-23', // 秋分の日
'2019-10-14', // 体育の日
'2019-11-03', // 文化の日
'2019-11-04', // 振替休日
'2019-11-23', // 勤労感謝の日
'2019-12-23', // 天皇誕生日
];

/*------------------------------
  GLOBAL_FUNC: isHoliday
-------------------------------*/
function isHoliday(y, m, d)
{
  var str = y + '-'
          + ("0" + m).slice(-2) + '-'
          + ("0" + d).slice(-2);

  if (gHolidays.indexOf(str) >= 0){
    return true;
  }
  return false;
}
