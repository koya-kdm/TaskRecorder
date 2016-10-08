
/*------------------------------
  GLOBAL_VAR:
-------------------------------*/
var gIsFirst = true;

/*------------------------------
  GLOBAL_FUNC: lsGetItem
-------------------------------*/
function lsGetItem(key)
{
  var strTr = localStorage.getItem('tr');
  if (null == strTr) {
    return null;
  }
  var tr = JSON.parse(strTr);
  return tr[key];
}

/*------------------------------
  GLOBAL_FUNC: lsSetItem
-------------------------------*/
function lsSetItem(key, value)
{
  var strTr = localStorage.getItem('tr');
  if (null == strTr) {
    var tr = {};
  }
  else {
    var tr = JSON.parse(strTr);
  }

  tr[key] = value;

  localStorage.removeItem('tr');
  localStorage.setItem('tr', JSON.stringify(tr));
}

/*------------------------------
  GLOBAL_FUNC: sortTasksByName
-------------------------------*/
function sortTasksByName(tasks)
{
  tasks.sort(function(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return  1;
    return 0;
  });
}

ons.bootstrap()
/*------------------------------
  CONTROLLER: yearController
-------------------------------*/
.controller('yearController', function($scope)
{
  var months = [];
  var dt = new Date();
  var month = dt.getMonth();

  // 年月の選択肢
  for (var i = -2; i <= 1; i ++)
  {
    dt.setMonth(month + i);
    months.push({year: dt.getFullYear(), month: dt.getMonth() + 1});
  }
  $scope.months = months;

  // デフォルト設定の登録
  if (null == lsGetItem('config'))
  {
    var config = {df_start: 95, df_end: 220, df_rest: 15};
    lsSetItem('config', config);
  }

  // 初回アクセス
  if (gIsFirst)
  {
    var dt = new Date();
    var ymd = {year: dt.getFullYear(), month: dt.getMonth() + 1};
    navi.pushPage('month.html', {ymd: ymd});
  }

  /*---------------
    FUNC: jumpToToday
  -----------------*/
  $scope.jumpToToday = function(){
    gIsFirst = true;
    var dt = new Date();
    var ymd = {year: dt.getFullYear(), month: dt.getMonth() + 1};
    navi.pushPage('month.html', {ymd: ymd});
  }

  /*---------------
    EVENT: jumpToToday
  -----------------*/
  $scope.$on('jumpToToday', function(e) {
    $scope.jumpToToday();
  });
})
/*------------------------------
  CONTROLLER: monthController
-------------------------------*/
.controller('monthController', function($scope, $rootScope)
{
  var op = $scope.navi.getCurrentPage().options;
  $scope.ymd = op.ymd;

  // 日付情報
  var wNames  = ['日', '月', '火', '水', '木', '金', '土'];
  var wColors = ['red', 'black', 'black', 'black', 'black', 'black', 'red'];
  var days = [];
  var lastDay = new Date(op.ymd.year, op.ymd.month - 0, 0).getDate();
  for (var d = 1; d <= lastDay; d++)
  {
    var ofWeek = new Date(op.ymd.year, op.ymd.month - 1, d).getDay();

    var color = wColors[ofWeek];
    if (isHoliday(op.ymd.year, op.ymd.month, d)) {
      color = 'red';
    }

    days.push({day: d, ofWeek: wNames[ofWeek], color: color});
  }
  $scope.days = days;

  // 勤怠情報
  var records = lsGetItem('records');
  if (null != records) {
    // 勤怠
    $scope.tmr = records[$scope.ymd.year][$scope.ymd.month]; // This Month's Records

    // 合計
    var sumWorkHr  = 0;
    var sumTasksHr = 0;
    for (var d in $scope.tmr) {
      sumWorkHr  += $scope.tmr[d].work_hr;
      sumTasksHr += $scope.tmr[d].tasks_hr;
    }
    $scope.sum = {work_hr: sumWorkHr, tasks_hr: sumTasksHr};
  }

  // 初回アクセス
  if (gIsFirst)
  {
    var dt = new Date();
    $scope.ymd.day    = dt.getDate();
    $scope.ymd.ofWeek = wNames[dt.getDay()];
    navi.pushPage('day.html', {ymd: $scope.ymd});
  }

  /*---------------
    FUNC: jumpToToday
  -----------------*/
  $scope.jumpToToday = function(){
    gIsFirst = true;
    var dt = new Date();

    if ($scope.ymd.year  == dt.getFullYear() &&
        $scope.ymd.month == dt.getMonth() + 1)
    {
      // [現在月にいる場合]
      $scope.ymd.year   = dt.getFullYear();
      $scope.ymd.month  = dt.getMonth() + 1;
      $scope.ymd.day    = dt.getDate();
      $scope.ymd.ofWeek = wNames[dt.getDay()];
      navi.pushPage('day.html', {ymd: $scope.ymd});
    }
    else
    {
      // [現在月にいない場合]
      navi.popPage(); // 年月選択に戻る
      $rootScope.$broadcast('jumpToToday');
    }
  }

  /*---------------
    EVENT: recordChanged
  -----------------*/
  $scope.$on('recordChanged', function(e, leaveOrRemain) {
    var records = lsGetItem('records');
    if (null != records) {
      $scope.tmr = records[$scope.ymd.year][$scope.ymd.month]; // This Month's Records
    }
    if (leaveOrRemain == 'leave') {
      // [勤怠入力ページを離れる場合]
      $scope.$apply();
    }
    else {
      // [勤怠入力ページに留まる場合]
      // 月ページの更新が不要のためapplyしない。
    }
  });
})
/*------------------------------
  CONTROLLER: dayController
-------------------------------*/
.controller('dayController', function($scope, $rootScope)
{
  var op = $scope.navi.getCurrentPage().options;
  var taskMaster = lsGetItem('taskMaster');

  $scope.ymd = op.ymd;

  // デフォルト勤務時間（既入力なら上書きされる）
  $scope.in_start = lsGetItem('config')['df_start'];
  $scope.in_end   = lsGetItem('config')['df_end'  ];
  $scope.in_rest  = lsGetItem('config')['df_rest' ];

  // 勤怠情報
  $scope.tasks = [];
  var records = lsGetItem('records');
  if (null != records)
  {
    if (undefined != records[$scope.ymd.year] &&
        undefined != records[$scope.ymd.year][$scope.ymd.month] &&
        undefined != records[$scope.ymd.year][$scope.ymd.month][$scope.ymd.day])
    {
      var record = records[$scope.ymd.year][$scope.ymd.month][$scope.ymd.day];

      // 勤務時間
      $scope.in_start = record['work_start'];
      $scope.in_end   = record['work_end'  ];
      $scope.in_rest  = record['work_rest' ];

      // タスク情報
      if (undefined != record['tasks'])
      {
        var tasks = record['tasks'];
        for (var i = 0; i < tasks.length; i++) {
          $scope.tasks.push({tid: tasks[i].tid, name: taskMaster[tasks[i].tid]['name'], hr: tasks[i].hr});
        }
        sortTasksByName($scope.tasks);
      }
    }
  }

  gIsFirst = false;

  /*---------------
    FUNC: getWorkHours
  -----------------*/
  $scope.getWorkHours = function(){
    return  Number($scope.in_end) - Number($scope.in_start) - Number($scope.in_rest);
  }

  /*---------------
    FUNC: getSum
  -----------------*/
  $scope.getSum = function(){
    var sum = 0;
    for (var i = 0; i < $scope.tasks.length; i++) {
      sum += Number($scope.tasks[i].hr);
    }
    return sum;
  }

  /*---------------
    FUNC: getDiff
  -----------------*/
  $scope.getDiff = function() {
    return $scope.getSum() - $scope.getWorkHours();
  }

  /*---------------
    FUNC: getDiffColor
  -----------------*/
  $scope.getDiffColor = function() {
    if      ($scope.getDiff() > 0) { return 'blue'; }
    else if ($scope.getDiff() < 0) { return 'red';  }
    else                           { return 'black';}
  }

  /*---------------
    FUNC: deleteRecord
  -----------------*/
  $scope.deleteRecord = function() {
    ons.notification.confirm({
      title: '勤怠の削除',
      message: 'この日の勤怠を削除してよろしいですか？',
      buttonLabels: ['キャンセル', '削除'],
      modifier: undefined,
      callback: function(idx) {
        switch (idx) {
          case 0:
            break;
          case 1:
            var records = lsGetItem('records');
            delete records[$scope.ymd.year][$scope.ymd.month][$scope.ymd.day];
            lsSetItem('records', records);
            navi.popPage();
            $rootScope.$broadcast('recordChanged', 'leave'); // 削除後はこのページを去る(leave)。
            break;
        }
      }
    });
  }

  /*---------------
    FUNC: deleteTask
  -----------------*/
  $scope.deleteTask = function(tid) {
    ons.notification.confirm({
      title: 'タスクの削除',
      message: '削除してよろしいですか？',
      buttonLabels: ['キャンセル', '削除'],
      modifier: undefined,
      callback: function(idx) {
        switch (idx) {
          case 0:
            break;
          case 1:
            for (var i = 0; i < $scope.tasks.length; i++)
            {
              if ($scope.tasks[i].tid == tid)
              {
                $scope.tasks.splice(i, 1);
              }
              sortTasksByName($scope.tasks);
            }
            $scope.$apply();
            break;
        }
      }
    });
  }

  /*---------------
    FUNC: save
  -----------------*/
  $scope.save = function() {

    var record = {work_start: Number($scope.in_start),
                  work_end:   Number($scope.in_end),
                  work_rest:  Number($scope.in_rest),
                  work_hr:    Number($scope.in_end) - Number($scope.in_start) - Number($scope.in_rest),
                  tasks_hr:   $scope.getSum()
                };

    var tasks = [];
    for (var i = 0; i < $scope.tasks.length; i++) {
      tasks.push( {tid: $scope.tasks[i].tid, hr: Number($scope.tasks[i].hr)} );
    }
    record['tasks'] = tasks;

    var records = lsGetItem('records');
    if (null == records) {
      records = {};
    }

    if (undefined == records[$scope.ymd.year]) {
      records[$scope.ymd.year] = {};
    }
    if (undefined == records[$scope.ymd.year][$scope.ymd.month]) {
      records[$scope.ymd.year][$scope.ymd.month] = {};
    }
    if (undefined == records[$scope.ymd.year][$scope.ymd.month][$scope.ymd.day]) {
      records[$scope.ymd.year][$scope.ymd.month][$scope.ymd.day] = {};
    }
    records[$scope.ymd.year][$scope.ymd.month][$scope.ymd.day] = record;
    lsSetItem('records', records);

    $scope.message = '保存しました。';
    $('#message_day').fadeIn('slow');
    setTimeout(function(){$('#message_day').fadeOut();}, 1500);

    $rootScope.$broadcast('recordChanged', 'remain'); // 保存後もこのページに留まる(remain)。
  }

  /*---------------
    FUNC: selectText
  -----------------*/
  $scope.selectText = function(e) {
    e.target.setSelectionRange(0, e.target.value.length);
  }

  /*---------------
    EVENT: taskSelected
  -----------------*/
  $scope.$on('taskSelected', function(e, tid) {
    var exists = false;
    for (var i = 0; i < $scope.tasks.length; i++)
    {
      if (tid == $scope.tasks[i].tid) {
        exists = true;
        break;
      }
    }
    if (false == exists) {
      var taskMaster = lsGetItem('taskMaster');
      $scope.tasks.push({tid: tid, name: taskMaster[tid]['name'],  hr: 0});
      sortTasksByName($scope.tasks);
    }
  });
})
/*------------------------------
  CONTROLLER: tasksController
-------------------------------*/
.controller('tasksController', function($scope, $rootScope)
{
  var op = $scope.navi.getCurrentPage().options;

  /*---------------
    FUNC: update
  -----------------*/
  $scope.update = function() {
    var taskMaster = lsGetItem('taskMaster');
    var arr1 = []; // よく使う
    var arr2 = []; // もうあまり使わない
    for (tid in taskMaster)
    {
      if (taskMaster[tid]['outdated'] == undefined ||
          taskMaster[tid]['outdated'] == false) {
        arr1.push({tid: tid, name: taskMaster[tid]['name']});
      }
      else {
        arr2.push({tid: tid, name: taskMaster[tid]['name']});
      }
    }
    sortTasksByName(arr1);
    sortTasksByName(arr2);

    $scope.tasks = arr1;
    $scope.outdatedTasks = arr2;
  }

  /*---------------
    FUNC: selectTask
  -----------------*/
  $scope.selectTask = function(tid) {
    navi.popPage();
    $rootScope.$broadcast('taskSelected', tid);
  }

  /*---------------
    EVENT: taskRegistered
  -----------------*/
  $scope.$on('taskRegistered', function(e, tid) {
    $scope.update();
  });

  $scope.update();
})
/*------------------------------
  CONTROLLER: taskController
-------------------------------*/
.controller('taskController', function($scope, $rootScope)
{
  var op = $scope.navi.getCurrentPage().options;

  if (undefined == op.tid)
  {
    // [新規]
    $scope.task_outdated = false;
  }
  else
  {
    // [編集]
    var taskMaster = lsGetItem('taskMaster');
    $scope.tid           = op.tid;
    $scope.task_name     = taskMaster[op.tid]['name'];
    $scope.task_outdated = taskMaster[op.tid]['outdated'];
  }

  /*---------------
    FUNC: save
  -----------------*/
  $scope.save = function() {

    var taskMaster = lsGetItem('taskMaster');
    if (null == taskMaster) {
      taskMaster = {};
    }

    // tidの採番
    if (undefined == $scope.tid)
    {
      // [新規]
      var maxTid = 't00000';
      for (var tid in taskMaster)
      {
        if (maxTid < tid) {
          maxTid = tid;
        }
      }
      var id = Number(maxTid.slice(-5)) + 1;
      var tid = 't' + ('0000' + id).slice(-5);
    }
    else
    {
      // [編集]
      var tid = $scope.tid;
    }

    taskMaster[tid] = {name: $scope.task_name, outdated: $scope.task_outdated};
    lsSetItem('taskMaster', taskMaster);

    navi.popPage();
    $rootScope.$broadcast('taskRegistered', tid);
  }
})
/*------------------------------
  CONTROLLER: summaryController
-------------------------------*/
.controller('summaryController', function($scope)
{
  /*---------------
    FUNC: getOfWeek
  -----------------*/
  $scope.getOfWeek = function(date)
  {
    if (undefined == date) {
      return '';
    }
    else {
      var wNames  = ['日', '月', '火', '水', '木', '金', '土'];
      return wNames[date.getDay()];
    }
  }
  /*---------------
    FUNC: changePeriod
  -----------------*/
  $scope.changePeriod = function(period)
  {
    //
    // 「任意」の場合
    //
    if ($scope.period == 'specific') {
      $scope.displayPeriod_fixed    = 'none';
      $scope.displayPeriod_specific = 'block';
      $scope.calc();
      return;
    }

    //
    // 「今月、先月、今週、先週」の場合
    //
    $scope.displayPeriod_fixed    = 'blcok';
    $scope.displayPeriod_specific = 'none';

    // 開始日と終了日を取得してからcalc
    var startDate = new Date();
    var endDate   = new Date();
    switch ($scope.period) {
      case 'thisMonth':
        // start
        startDate.setDate(1);
        // end
        endDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
        break;
      case 'prevMonth':
        // start
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(1);
        // end
        endDate.setDate(0);
        break;
      case 'thisWeek':
        // start
        if (startDate.getDay() == 0) {startDate.setDate(startDate.getDate() - 7                  + 1);}
        else                         {startDate.setDate(startDate.getDate() - startDate.getDay() + 1);}
        // end
        if (endDate.getDay() == 0) {endDate.setDate(endDate.getDate() - 7                + 7);}
        else                       {endDate.setDate(endDate.getDate() - endDate.getDay() + 7);}
        break;
      case 'prevWeek':
        // start
        if (startDate.getDay() == 0) {startDate.setDate(startDate.getDate() - 7                  - 6);}
        else                         {startDate.setDate(startDate.getDate() - startDate.getDay() - 6);}
        // end
        if (endDate.getDay() == 0) {endDate.setDate(endDate.getDate() - 7               );}
        else                       {endDate.setDate(endDate.getDate() - endDate.getDay());}
        break;
      default:
    }
    $scope.date_start = startDate;
    $scope.date_end   = endDate;

    $scope.calc();
  }

  /*---------------
    FUNC: calc
  -----------------*/
  $scope.calc = function()
  {
    $scope.message = '';
    $scope.summary = [];

    if ($scope.date_start.getTime() > $scope.date_end.getTime())
    {
      alert('「開始 ≦ 終了」で選択してください。');
      return;
    }

    var summary = {};
    var total   = 0;
    var records = lsGetItem('records');
    if (null != records)
    {
      for (var dt = new Date($scope.date_start.getTime()); dt <= $scope.date_end; dt.setDate(dt.getDate() + 1 ))
      {
        y = dt.getFullYear();
        m = dt.getMonth() + 1;
        d = dt.getDate();

        if (undefined != records[y] &&
            undefined != records[y][m] &&
            undefined != records[y][m][d])
        {
          if (undefined != records[y][m][d]['tasks'])
          {
            var tasks = records[y][m][d]['tasks'];

            for (var i = 0; i < tasks.length; i++)
            {
              if (undefined != summary[tasks[i].tid])
              {
                summary[tasks[i].tid] += tasks[i].hr;
              }
              else
              {
                summary[tasks[i].tid] = tasks[i].hr;
              }
              total += tasks[i].hr;
            }
          }
        }
      }
    }

    var taskMaster = lsGetItem('taskMaster');
    var arr = [];
    for (tid in summary)
    {
      arr.push({tid: tid, hr: summary[tid], name: taskMaster[tid]['name']});
    }
    sortTasksByName(arr);
    $scope.summary = arr;
    $scope.total   = total;
  }

  /*===============
    MAIN
  =================*/

  // デフォルトとして期間を「今月」にセット
  $scope.period = 'thisMonth';
  $scope.dateDisabled = true;

  $scope.displayPeriod_fixed    = 'blcok';
  $scope.displayPeriod_specific = 'none';

  /*
  var minDate = new Date();
  minDate.setMonth(minDate.getMonth() - 2);
  $scope.min_date = minDate.getFullYear() + '-' + (minDate.getMonth() + 1) + '-' + minDate.getDate();

  var maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1);
  $scope.max_date = maxDate.getFullYear() + '-' + (maxDate.getMonth() + 1) + '-' + maxDate.getDate();
  */

  $scope.changePeriod('thisMonth');
})
/*------------------------------
  CONTROLLER: configController
-------------------------------*/
.controller('configController', function($scope)
{

})
/*------------------------------
  CONTROLLER: configDefaultController
-------------------------------*/
.controller('configDefaultController', function($scope)
{
  $scope.df_start = lsGetItem('config')['df_start'];
  $scope.df_end   = lsGetItem('config')['df_end'  ];
  $scope.df_rest  = lsGetItem('config')['df_rest' ];

  /*---------------
    FUNC: save
  -----------------*/
  $scope.save = function() {
    var config = {df_start: $scope.df_start, df_end: $scope.df_end, df_rest: $scope.df_rest};
    lsSetItem('config', config);

    $scope.message = '保存しました。';
    $('#message_config').fadeIn('slow');
    setTimeout(function(){$('#message_config').fadeOut('slow');}, 2000);
  }

  /*---------------
    FUNC: selectText
  -----------------*/
  $scope.selectText = function(e) {
    e.target.setSelectionRange(0, e.target.value.length);
  }
})
/*------------------------------
  CONTROLLER: configTasksController
-------------------------------*/
.controller('configTasksController', function($scope)
{
  /*---------------
    FUNC: update
  -----------------*/
  $scope.update = function() {
    var taskMaster = lsGetItem('taskMaster');
    var arr1 = []; // よく使う
    var arr2 = []; // もうあまり使わない
    for (tid in taskMaster)
    {
      if (taskMaster[tid]['outdated'] == undefined ||
          taskMaster[tid]['outdated'] == false) {
        arr1.push({tid: tid, name: taskMaster[tid]['name']});
      }
      else {
        arr2.push({tid: tid, name: taskMaster[tid]['name']});
      }
    }
    sortTasksByName(arr1);
    sortTasksByName(arr2);

    $scope.tasks = arr1;
    $scope.outdatedTasks = arr2;
  }

  /*---------------
    FUNC: selectTask
  -----------------*/
  $scope.selectTask = function(tid) {
    navi.popPage();
    $rootScope.$broadcast('taskSelected', tid);
  }

  /*---------------
    EVENT: taskRegistered
  -----------------*/
  $scope.$on('taskRegistered', function(e, tid) {
    $scope.update();
  });

  $scope.update();
})
/*------------------------------
  CONTROLLER: configTaskController
-------------------------------*/
.controller('configTaskController', function($scope, $rootScope)
{
  var op = $scope.naviConfig.getCurrentPage().options;

  if (undefined == op.tid)
  {
    // [新規]
    $scope.task_outdated = false;
  }
  else
  {
    // [編集]
    var taskMaster = lsGetItem('taskMaster');
    $scope.tid           = op.tid;
    $scope.task_name     = taskMaster[op.tid]['name'];
    $scope.task_outdated = taskMaster[op.tid]['outdated'];
  }

  /*---------------
    FUNC: save
  -----------------*/
  $scope.save = function() {

    var taskMaster = lsGetItem('taskMaster');
    if (null == taskMaster) {
      taskMaster = {};
    }

    // tidの採番
    if (undefined == $scope.tid)
    {
      // [新規]
      var maxTid = 't00000';
      for (var tid in taskMaster)
      {
        if (maxTid < tid) {
          maxTid = tid;
        }
      }
      var id = Number(maxTid.slice(-5)) + 1;
      var tid = 't' + ('0000' + id).slice(-5);
    }
    else
    {
      // [編集]
      var tid = $scope.tid;
    }

    // nameのチェック
    if ($scope.task_name.match(/,/)) {
      alert('名称にカンマ(,)は使用できません。');
      return;
    }

    taskMaster[tid] = {name: $scope.task_name, outdated: $scope.task_outdated};
    lsSetItem('taskMaster', taskMaster);

    naviConfig.popPage();
    $rootScope.$broadcast('taskRegistered', tid);
  }
})
/*------------------------------
  CONTROLLER: configExportController
-------------------------------*/
.controller('configExportController', function($scope)
{
  /*---------------
    FUNC: toBin
  -----------------*/
  $scope.toBin = function(boolValue) {
    if (undefined == boolValue ||
        null      == boolValue ||
        false     == boolValue)
    {
      return 0;
    }
    else {
      return 1;
    }
  }

  /*---------------
    FUNC: updateRecordCsv
  -----------------*/
  $scope.updateRecordCsv = function() {
    var str = '';
    var y = $scope.month.date.getFullYear();
    var m = $scope.month.date.getMonth() + 1;

    var records = lsGetItem('records');
    if (null == records) {
      records = {};
    }

    if (undefined != records[y] &&
        undefined != records[y][m])
    {
      for (var d in records[y][m])
      {
        str += y + ',' + m + ',' + d + ',';
        str += records[y][m][d]['work_start'] + ','
             + records[y][m][d]['work_end'  ] + ','
             + records[y][m][d]['work_rest' ];

        if (undefined != records[y][m][d]['tasks'])
        {
          for (var n in records[y][m][d]['tasks'])
          {
            str += ','
                 + records[y][m][d]['tasks'][n]['tid'] + ','
                 + records[y][m][d]['tasks'][n]['hr' ];
          }
        }
        str += '\r\n';
      }
    }

    $scope.recordCsv = str;
  }

  /*---------------
    FUNC: copyCsv
  -----------------*/
  $scope.copyCsv = function(id) {
    var textarea = document.getElementById(id);
    textarea.select();
    var result = document.execCommand("copy");

    if (result) {
      alert('コピーしました。');
    }
    else {
      alert('このブラウザではコピーできません。手動で全選択・コピーしてください。');
    }
  }

  /*---------------
    FUNC: mailCsv
  -----------------*/
  $scope.mailCsv = function(id)
  {
    switch (id) {
      case 'configExportTaskCsv':
        var subject  = 'タスクマスタ';
        break;
      case 'configExportRecordCsv':
        var dt = new Date();
        var subject  = '勤怠_' + $scope.month.date.getFullYear() + '年'
                              + ('0' + ($scope.month.date.getMonth() + 1)).slice(-2) + '月';
        break;
      default:
        var subject = '';
    }
    var body = document.getElementById(id).value;
    var href = "mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    window.location.href = href;
  }

  /*===============
    MAIN
  =================*/
  //
  // タスクマスタ
  //
  var taskMaster = lsGetItem('taskMaster');
  if (null == taskMaster) {
    taskMaster = {};
  }

  var str = '';
  for (tid in taskMaster)
  {
    str += tid + ',"' + taskMaster[tid]['name'] + '",' + $scope.toBin(taskMaster[tid]['outdated']) + '\r\n';
  }
  $scope.taskCsv = str;

  //
  // 日々の勤怠
  //
  var str    = '';
  var months = [];
  var dt     = new Date();
  var month  = dt.getMonth();

  // 年月の選択肢
  for (var i = -2; i <= 1; i ++)
  {
    var dt2 = new Date();
    dt2.setMonth(month + i);
    months.push({name: dt2.getFullYear() + '年 ' + (dt2.getMonth() + 1) + '月', date: dt2});
  }
  $scope.months = months;
  $scope.month = $scope.months[2];

  $scope.updateRecordCsv();
})
/*------------------------------
  CONTROLLER: configImportController
-------------------------------*/
.controller('configImportController', function($scope)
{
  //
  // タスクマスタ
  //

  //
  // 日々の勤怠
  //
  var str    = '';
  var months = [];
  var dt     = new Date();
  var month  = dt.getMonth();

  // 年月の選択肢
  for (var i = -2; i <= 1; i ++)
  {
    var dt2 = new Date();
    dt2.setMonth(month + i);
    months.push({name: dt2.getFullYear() + '年 ' + (dt2.getMonth() + 1) + '月', date: dt2});
  }
  $scope.months = months;
  $scope.month = $scope.months[2];

  /*---------------
    FUNC: toBool
  -----------------*/
  $scope.toBool = function(bin)
  {
    if (bin == 0 || bin == '0') {return false;}
    else                        {return true; }
  }

  /*---------------
    FUNC: importTaskCsv
  -----------------*/
  $scope.importTaskCsv = function()
  {
    ons.notification.confirm({
      title: 'タスクマスタのインポート',
      message: '既存のタスクマスタは削除されます。続けますか？',
      buttonLabels: ['キャンセル', 'インポート'],
      modifier: undefined,
      callback: function(idx) {
        switch (idx) {
          case 0:
            break;
          case 1:

            var tm = {};

            // check: empty
            if ($scope.taskCsv == undefined ||
                $scope.taskCsv.trim() == '') {
              alert('インポートデータが入力されていません。');
              return;
            }

            // check: empty
            var lines = $scope.taskCsv.split('\n');
            if (lines.length == 0) {
              alert('インポートデータが入力されていません。');
              return;
            }

            for (var i = 0; i < lines.length; i++)
            {
              var lineNo = i + 1;
              var values = lines[i].split(',');

              // check: 項目数
              if (values.length != 3) {
                alert('項目数が3（ID, 名称, 不使用フラグ）ではありません。（' + lineNo + '行目）');
                return;
              }

              // check: tid
              var tid = values[0];
              if (tid.length != 6) {
                alert('IDが6文字ではありません。（' + lineNo + '行目）');
                return;
              }
              if (tid.substr(0, 1) != 't' || false == tid.match(/[^0-9]+/)) {
                alert('IDが「"t" + 5桁数字」ではありません。（' + lineNo + '行目）');
                return;
              }

              // check: name
              var name = values[1];
              if (name.substr(0, 1) != '"' || name.substr(name.length - 1, 1) != '"') {
                alert('名称がダブルクオートされていません。（' + lineNo + '行目）');
                return;
              }
              name = name.substr(1, name.length - 2);
              if (name.length > 30) {
                alert('名称の30文字を超えています。（' + lineNo + '行目）');
                return;
              }

              // check: outdated
              var outdated = values[2];
              if (outdated != '0' && outdated != '1') {
                alert('未使用フラグが{0, 1}以外です。（' + lineNo + '行目）');
                return;
              }

              // check: tidの重複
              if (undefined != tm[tid]) {
                alert('IDが重複しています。（ID: ' + tid + '）');
                return;
              }

              tm[tid] = {name: name, outdated: outdated};
            }

            lsSetItem('taskMaster', tm);
            alert('インポートに成功しました。');
            break;
        }
      }
    });
  }

  /*---------------
    FUNC: importRecordCsv
  -----------------*/
  $scope.importRecordCsv = function()
  {
    ons.notification.confirm({
      title: '勤怠データのインポート',
      message: '既存の勤怠データ（'
               +  $scope.month['date'].getFullYear()   + '年'
               + ($scope.month['date'].getMonth() + 1) + '月'
               +  '分）は削除されます。続けますか？',
      buttonLabels: ['キャンセル', 'インポート'],
      modifier: undefined,
      callback: function(idx) {
        switch (idx) {
          case 0:
            break;
          case 1:
            var monthRecords = {};

            // check: empty
            if ($scope.recordCsv == undefined ||
                $scope.recordCsv.trim() == '') {
              alert('インポートデータが入力されていません。');
              return;
            }

            // check: empty
            var lines = $scope.recordCsv.split('\n');
            if (lines.length == 0) {
              alert('インポートデータが入力されていません。');
              return;
            }

            for (var i = 0; i < lines.length; i++)
            {
              var lineNo = i + 1;
              var values = lines[i].split(',');

              // check: 日付
              var y = Number(values[0]);
              var m = Number(values[1]);
              var d = Number(values[2]);

              var dt = new Date(y, m - 1, d);
              if(dt == null || dt.getFullYear() != y || dt.getMonth() + 1 != m || dt.getDate() != d) {
                alert('日付が不正です。（' + lineNo + '行目）');
                return;
              }

              if (y != $scope.month['date'].getFullYear() ||
                  m != $scope.month['date'].getMonth() + 1) {
                alert('年月がセレクトボックスの値と異なります。（' + lineNo + '行目）');
                return;
              }

              // check: 始業時間
              var startTime = Number(values[3]);
              if (!(0 <= startTime && startTime <= 999)) {
                alert('始業時間が範囲（0〜999）外です。（' + lineNo + '行目）');
                return;
              }

              // check: 終業時間
              var endTime = Number(values[4]);
              if (!(0 <= endTime && endTime <= 999)) {
                alert('終業時間が範囲（0〜999）外です。（' + lineNo + '行目）');
                return;
              }

              // check: 休憩時間
              var restTime = Number(values[5]);
              if (!(0 <= restTime && restTime <= 99)) {
                alert('休憩時間が範囲（0〜99）外です。（' + lineNo + '行目）');
                return;
              }

              // check: 始業・終業・休憩時間の関係
              if (startTime > endTime) {
                alert('「始業 > 終業」です。（' + lineNo + '行目）');
                return;
              }
              if (endTime - startTime - restTime < 0) {
                alert('「終業 - 始業 - 休憩」がマイナスです。。（' + lineNo + '行目）');
                return;
              }

              // タスク
              var tasks = [];
              var totalHr = 0;
              for (var j = 6; j < values.length; j+=2)
              {
                // check: tid
                tid = values[j];
                if (tid.length != 6) {
                  alert('IDが6文字ではありません。（' + lineNo + '行目）');
                  return;
                }
                if (tid.substr(0, 1) != 't' || false == tid.match(/[^0-9]+/)) {
                  alert('IDが「"t" + 5桁数字」ではありません。（' + lineNo + '行目）');
                  return;
                }

                // check: hr
                if (undefined == values[j+1]) {
                  alert('ID（' + tid + '）の時間がありません。（' + lineNo + '行目）');
                  return;
                }
                hr = Number(values[j+1]);
                if (!(0 <= hr && hr <= 999)) {
                  alert('ID（' + tid + '）の時間が範囲（0〜999）外です。（' + lineNo + '行目）');
                  return;
                }

                totalHr += hr;
                tasks.push({tid: tid, hr: hr});
              }

              monthRecords[d] = {work_start : startTime,
                                 work_end   : endTime,
                                 work_rest  : restTime,
                                 work_hr    : endTime - startTime - restTime,
                                 tasks_hr   : totalHr,
                                 tasks      : tasks
              };
            }

            var records = lsGetItem('records');
            if (undefined == records[y]) {
              records[y] = {};
            }
            records[y][m] = monthRecords;
            lsSetItem('records', records);
            alert('インポートに成功しました。');
            break;
        }
      }
    });
  }
})
;
