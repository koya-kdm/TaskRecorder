var gIsFirst = true;

/*
records['2016']['08']['16']['work_start']
                           ['work_end'  ]
                           ['work_rest' ]
                           ['work_hr'   ]
                           ['tasks_hr'  ]
                           ['tasks'     ][n]['name']
                                            ['hr']
*/

//localStorage.removeItem('tr');

function lsGetItem(key)
{
  var strTr = localStorage.getItem('tr');
  if (null == strTr)
  {
    return null;
  }
  var tr = JSON.parse(strTr);
  return tr[key];
}
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


ons.bootstrap()

/*
records['2016']['08']['16']['work_start']
                           ['work_end'  ]
                           ['work_rest' ]
                           ['work_hr'   ]
                           ['tasks_hr'  ]
                           ['tasks'     ][tid ]['name']
                                         ['hr']
*/

/*------------------------------
  yearController
-------------------------------*/
.controller('yearController', function($scope)
{
  var months = [];
  var dt = new Date();
  var month = dt.getMonth();

  for (var i = -3; i <= 1; i ++)
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
})
/*------------------------------
  monthController
-------------------------------*/
.controller('monthController', function($scope){
  var op = $scope.navi.getCurrentPage().options;
  $scope.ymd = op.ymd;

  var wNames = ['日', '月', '火', '水', '木', '金', '土'];
  var days = [];
  var lastDay = new Date(op.ymd.year, op.ymd.month - 0, 0).getDate();
  for (var d = 1; d <= lastDay; d++)
  {
    var ofWeek = new Date(op.ymd.year, op.ymd.month - 1, d).getDay();
    days.push({day: d, ofWeek: wNames[ofWeek]});
  }
  $scope.days = days;

  if (gIsFirst)
  {
    var dt = new Date();
    var todayDay = {day: dt.getDate(), ofWeek: wNames[dt.getDay()]};
    $scope.ymd.day    = dt.getDate();
    $scope.ymd.ofWeek = wNames[dt.getDay()];
    navi.pushPage('day.html', {ymd: $scope.ymd});
  }
  else
  {
    var records = lsGetItem('records');
    if (null != records) {
      $scope.tmr = records[$scope.ymd.year][$scope.ymd.month]; // This Month's Records
    }
  }
})
/*------------------------------
  dayController
-------------------------------*/
.controller('dayController', function($scope) {
  var op = $scope.navi.getCurrentPage().options;
  var taskMaster = lsGetItem('taskMaster');

  $scope.ymd = op.ymd;

  $scope.in_start = lsGetItem('config')['df_start'];
  $scope.in_end   = lsGetItem('config')['df_end'  ];
  $scope.in_rest  = lsGetItem('config')['df_rest' ];

  $scope.tasks = [];
  var records = lsGetItem('records');
  if (null != records)
  {
    if (undefined != records[$scope.ymd.year] &&
        undefined != records[$scope.ymd.year][$scope.ymd.month] &&
        undefined != records[$scope.ymd.year][$scope.ymd.month][$scope.ymd.day])
    {
      var record = records[$scope.ymd.year][$scope.ymd.month][$scope.ymd.day];

      $scope.in_start = record['work_start'];
      $scope.in_end   = record['work_end'  ];
      $scope.in_rest  = record['work_rest' ];

      if (undefined != record['tasks'])
      {
        var tasks = record['tasks'];
        for (var i = 0; i < tasks.length; i++)
        {
          $scope.tasks.push({tid: tasks[i].tid, name: taskMaster[tasks[i].tid], hr: tasks[i].hr});
        }
        $scope.tasks.sort(function(a, b) {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return  1;
          return 0;
        });
      }
    }
  }

  gIsFirst = false;

  /*---------------
    getWorkHours
  -----------------*/
  $scope.getWorkHours = function(){
    return  Number($scope.in_end) - Number($scope.in_start) - Number($scope.in_rest);
  }

  /*---------------
    getSum
  -----------------*/
  $scope.getSum = function(){
    var sum = 0;
    for (var i = 0; i < $scope.tasks.length; i++)
    {
      sum = sum + Number($scope.tasks[i].hr);
    }
    return  sum;
  }

  /*---------------
    getDiff
  -----------------*/
  $scope.getDiff = function(){
    return  $scope.getWorkHours() - $scope.getSum();
  }

  /*---------------
    save
  -----------------*/
  $scope.save = function() {

    /*
    records['2016']['08']['16']['work_start']
                               ['work_end'  ]
                               ['work_rest' ]
                               ['work_hr'   ]
                               ['tasks_hr'  ]
                               ['tasks'     ][tid]['tid']
                                                  ['hr']
    */

    var record = {work_start: Number($scope.in_start),
                  work_end:   Number($scope.in_end),
                  work_rest:  Number($scope.in_rest),
                  work_hr:    Number($scope.in_end) - Number($scope.in_start) - Number($scope.in_rest),
                  tasks_hr:   $scope.getSum()
                };

    var tasks = [];
    for (var i = 0; i < $scope.tasks.length; i++)
    {
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
      $scope.tasks.push({tid: tid, name: taskMaster[tid],  hr: 0});
      $scope.tasks.sort(function(a, b) {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return  1;
        return 0;
      });
    }
  });
})
/*------------------------------
  tasksController
-------------------------------*/
.controller('tasksController', function($scope, $rootScope) {
  var op = $scope.navi.getCurrentPage().options;

  var taskMaster = lsGetItem('taskMaster');
  var arr = [];
  for (tid in taskMaster)
  {
    arr.push({tid: tid, name: taskMaster[tid]});
  }
  arr.sort(function(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return  1;
    return 0;
  });
  $scope.tasks = arr;

  /*---------------
    selectTask
  -----------------*/
  $scope.selectTask = function(tid) {
    navi.popPage();
    $rootScope.$broadcast('taskSelected', tid);
  }

  /*---------------
    EVENT: taskRegistered
  -----------------*/
  $scope.$on('taskRegistered', function(e, tid) {
    var taskMaster = lsGetItem('taskMaster');
    var arr = [];
    for (tid in taskMaster)
    {
      arr.push({tid: tid, name: taskMaster[tid]});
    }
    arr.sort(function(a, b) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return  1;
      return 0;
    });
    $scope.tasks = arr;
  });
})
/*------------------------------
  taskController
-------------------------------*/
.controller('taskController', function($scope, $rootScope) {
  var op = $scope.navi.getCurrentPage().options;

  if (undefined == op.tid)
  {
    //【新規】

  }
  else
  {
    //【編集】

    var taskMaster = lsGetItem('taskMaster');

    $scope.tid = op.tid;
    $scope.task_name = taskMaster[op.tid];
  }

  /*---------------
    save
  -----------------*/
  $scope.save = function() {

    var taskMaster = lsGetItem('taskMaster');
    if (null == taskMaster) {
      taskMaster = {};
    }

    if (undefined == $scope.tid)
    {
      //【新規】
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
      //【編集】
      var tid = $scope.tid;
    }

    taskMaster[tid] = $scope.task_name

    lsSetItem('taskMaster', taskMaster);

    navi.popPage();
    $rootScope.$broadcast('taskRegistered', tid);
  }
})
/*------------------------------
  configController
-------------------------------*/
.controller('configController', function($scope) {

  $scope.df_start = lsGetItem('config')['df_start'];
  $scope.df_end   = lsGetItem('config')['df_end'  ];
  $scope.df_rest  = lsGetItem('config')['df_rest' ];

  /*---------------
    save
  -----------------*/
  $scope.save = function() {
    var config = {df_start: $scope.df_start, df_end: $scope.df_end, df_rest: $scope.df_rest};
    lsSetItem('config', config);
    $scope.message = '保存しました。';
  }
})
;
