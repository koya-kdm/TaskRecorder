<!DOCTYPE html>
<meta charset="UTF-8" />
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta name="format-detection" content="telephone=no" />

<link href="https://cdn.rawgit.com/OnsenUI/OnsenUI/1.3.6/build/css/onsenui.css" rel="stylesheet"/>
<link href="https://cdn.rawgit.com/OnsenUI/OnsenUI/1.3.6/build/css/onsen-css-components.css" rel="stylesheet"/>
<script src="https://cdn.rawgit.com/OnsenUI/OnsenUI/1.3.6/build/js/angular/angular.min.js"></script>
<script src="https://cdn.rawgit.com/OnsenUI/OnsenUI/1.3.6/build/js/onsenui.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>

<link href="./tr.css" rel="stylesheet"/>
<script src='./tr.js'></script>

<!-- *************************
* タブバー
******************************-->
<ons-tabbar var="tab">
  <ons-tab page="tab_recorder.html" label="記録" icon="ion-calendar" active="true"></ons-tab>
  <ons-tab page="tab_summary.html" label="サマリー" icon="ion-stats-bars"></ons-tab>
  <ons-tab page="tab_config.html" label="設定" icon="ion-ios-cog"></ons-tab>
</ons-tabbar>

<!-- *************************
* 「記録」タブ
******************************-->
<!--++++++++++++++
  tab_recorder.html
++++++++++++++++++-->
<ons-template id="tab_recorder.html">
  <ons-navigator var="navi">
    <ons-page ng-controller="yearController">>
      <ons-list>
        <ons-list-item modifier="chevron" ng-repeat="month in months" ng-click="navi.pushPage('month.html', {ymd: {year: month.year, month: month.month}})">
          {{month.year}}年 {{month.month}}月
        </ons-list-item>
      </ons-list>
    </ons-page>
  </ons-navigator>
</ons-template>

<!--++++++++++++++
  month.html
++++++++++++++++++-->
<ons-template id="month.html">
  <ons-page ng-controller="monthController">
    <ons-toolbar>
      <div class="left">
        <ons-back-button>戻る</ons-back-button>
      </div>
      <div class="center">{{ymd.year}}年 {{ymd.month}}月</div>
    </ons-toolbar>
    <ons-list-item>
      <table>
        <tr style="color:#888888">
          <td nowarp width="60px" align="center" ></td>
          <td nowarp width="40px" align="right" >開</td>
          <td nowarp width="40px" align="right" >終</td>
          <td nowarp width="30px" align="right" >休</td>
          <td nowarp width="45px" align="right" >実働</td>
          <td nowarp width="45px" align="right" >入力</td>
        </tr>
      </table>
    </ons-list-item>
    <ons-list-item modifier="chevron" ng-repeat="day in days" ng-click="navi.pushPage('day.html', {ymd: {year: ymd.year, month: ymd.month, day: day.day, ofWeek: day.ofWeek}})">
      <table>
        <tr>
          <td nowarp width="60px" align="right" >{{day.day}} ({{day.ofWeek}})</td>
          <td nowarp width="40px" align="right" >{{tmr[day.day]['work_start']}}</td>
          <td nowarp width="40px" align="right" >{{tmr[day.day]['work_end']}}</td>
          <td nowarp width="30px" align="right" >{{tmr[day.day]['work_rest']}}</td>
          <td nowarp width="45px" align="right" >{{tmr[day.day]['work_hr']}}</td>
          <td nowarp width="45px" align="right" >{{tmr[day.day]['tasks_hr']}}</td>
        </tr>
      </table>
    </ons-list-item>
  </ons-page>
</ons-template>

<!--++++++++++++++
  day.html
++++++++++++++++++-->
<ons-template id="day.html">
  <ons-page ng-controller="dayController">
    <ons-toolbar>
      <div class="left">
        <ons-back-button>戻る</ons-back-button>
      </div>
      <div class="center">{{ymd.year}}年 {{ymd.month}}月 {{ymd.day}}日（{{ymd.ofWeek}}）</div>
    </ons-toolbar>

    <!-- ****** 入力フォーム ******-->
    <table class="t_layout" style="margin-top:10px;">
      <tr>
        <td>始</td>
        <td>
          <input type="number" id="in_start" ng-model="in_start" class="text-input" style="width:60px" value="9.5">
        </td>
        <td>終</td>
        <td>
          <input type="number" id="in_end" ng-model="in_end" class="text-input" style="width:60px" value="22.0">
        </td>
        <td>休</td>
        <td>
          <input type="number" id="in_rest" ng-model="in_rest" class="text-input" style="width:60px" value="1.5">
        </td>
      </tr>
    </table>

    <table class="t_layout" style="margin-top:10px;">
      <tr>
        <td>実働</td>
        <td align="right">{{ getWorkHours() }}</td>
        <td>入力</td>
        <td align="right">{{ getSum() }}</td>
        <td>（差 {{ getDiff() }}）</td>
      </tr>
    </table>

    ▼タスク入力
    <table class="t_tasks" id="taskTable">
      <tr ng-repeat="task in tasks">
        <td>{{task.name}}</td>
        <td align="right">
          <input type="number" ng-model="task.hr" class="text-input" style="width:50px" value="{{task.hr}}">
        </td>
      </tr>
    </table>

    <div style="margin-left: 20px;">
      <button class="button--quiet" onclick="navi.pushPage('tasks.html')"><ons-icon icon="ion-ios-plus-outline"></ons-icon> 追加</button>
    </div>

    <div style="text-align:center; margin: 20px 10px 20px 10px;">
      <ons-button modifier="large" ng-click="save()">　　保存　　</ons-button>
      <span>{{message}}</span>
    </div>

  </ons-page>
</ons-template>

<!--++++++++++++++
  tasks.html
++++++++++++++++++-->
<ons-template id="tasks.html">
  <ons-page ng-controller="tasksController">
    <ons-toolbar>
      <div class="left">
        <ons-back-button>戻る</ons-back-button>
      </div>
      <div class="center">タスク選択</div>
      <div class="right">
        <button class="button--quiet" onclick="navi.pushPage('task.html')"><ons-icon icon="ion-ios-plus-outline"></ons-icon> 新規</button>
      </div>
    </ons-toolbar>
    <ons-list-item ng-repeat="task in tasks" >
      <ons-row>
        <ons-col width="90px">
          <ons-button modifier="quiet" ng-click="selectTask(task.tid)">{{task.name}}</ons-button>
        </ons-col>
        <ons-col>
          <div style="float: right; padding-right: 16px;">
            <ons-icon icon="ion-edit" ng-click="navi.pushPage('task.html', {tid: task.tid})"></ons-icon>
          </div>
        </ons-col>
      </ons-row>
    </ons-list-item>
  </ons-page>
</ons-template>

<!--++++++++++++++
  task.html
++++++++++++++++++-->
<ons-template id="task.html">
  <ons-page ng-controller="taskController">
    <ons-toolbar>
      <div class="left">
        <ons-back-button>戻る</ons-back-button>
      </div>
      <div class="center">タスク詳細</div>
    </ons-toolbar>

    <div style="margin: 20px 5px 20px 5px">
      タスク名称<br>
      <input type="text" ng-model="task_name" class="text-input" style="width:90%;" value="">
      <input type="hidden" ng-value="tid">
    </div>

    <div style="text-align:center; margin: 20px 10px 20px 10px;">
      <ons-button modifier="large" ng-click="save();">　　保存　　</ons-button>
    </div>

  </ons-page>
</ons-template>

<!--++++++++++++++
  tab_summary.html
++++++++++++++++++-->
<ons-template id="tab_summary.html">
</ons-template>

<!--++++++++++++++
  tab_config.html
++++++++++++++++++-->
<ons-template id="tab_config.html">
  <ons-page ng-controller="configController">
    <table style="text-align:center; margin: 20px 10px 20px 10px;">
      <tr>
        <td>始業時間：</td> <td><input type="number" ng-model="df_start" class="text-input" style="width:60px;"></td>
      </tr>
      <tr>
        <td>終業時間：</td> <td><input type="number" ng-model="df_end"   class="text-input" style="width:60px;"></td>
      </tr>
      <tr>
        <td>休憩時間：</td> <td><input type="number" ng-model="df_rest"  class="text-input" style="width:60px;"></td>
      </tr>
    </table>

    <div style="text-align:center; margin: 20px 10px 20px 10px;">
      <ons-button modifier="large" ng-click="save()">　　保存　　</ons-button>
      <span>{{message}}</span>
    </div>

  </ons-page>
</ons-template>
