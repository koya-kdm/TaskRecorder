<!DOCTYPE html>
<meta charset="UTF-8" />
<!--<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">-->
<!--<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">-->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta name="format-detection" content="telephone=no" />

<title>TaskRecorder</title>

<link href="https://cdn.rawgit.com/OnsenUI/OnsenUI/1.3.6/build/css/onsenui.css" rel="stylesheet"/>
<link href="https://cdn.rawgit.com/OnsenUI/OnsenUI/1.3.6/build/css/onsen-css-components.css" rel="stylesheet"/>
<script src="https://cdn.rawgit.com/OnsenUI/OnsenUI/1.3.6/build/js/angular/angular.min.js"></script>
<script src="https://cdn.rawgit.com/OnsenUI/OnsenUI/1.3.6/build/js/onsenui.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>

<!-- iOS Safari and Chrome -->
<link rel="apple-touch-icon" sizes="192x192" href="/ios7-calendar-outline.png">

<!-- Android標準ブラウザ(一部) -->
<link rel="shortcut icon" href="/icon_tr.png"><!-- ios7-calendar-outline.png -->

<link href="./tr.css" rel="stylesheet"/>
<script src='./tr.js'></script>
<script src='./holidays.js'></script>

<!-- *************************
* タブバー
******************************-->
<ons-tabbar var="tab">
  <ons-tab page="tab_recorder.html" label="記録" icon="ion-ios-calendar-outline" active="true" no-reload persistent></ons-tab>
  <ons-tab page="tab_summary.html"  label="集計" icon="ion-stats-bars"></ons-tab>
  <ons-tab page="tab_config.html"   label="設定" icon="ion-ios-cog"></ons-tab>
</ons-tabbar>

<!-- *************************
* 「記録」タブ
******************************-->
<!--++++++++++++++
  tab_recorder.html
++++++++++++++++++-->
<ons-template id="tab_recorder.html">
  <ons-navigator var="navi">
    <ons-page ng-controller="yearController">
      <ons-toolbar>
        <div class="center">Task Recorder</div>
        <div class="right">
          <ons-toolbar-button ng-click="jumpToToday()">今日</ons-toolbar-button>
        </div>
      </ons-toolbar>
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
        <ons-back-button>年月</ons-back-button>
      </div>
      <div class="center">{{ymd.year}}年 {{ymd.month}}月</div>
      <div class="right">
        <ons-toolbar-button ng-click="jumpToToday()">今日</ons-toolbar-button>
      </div>
    </ons-toolbar>
    <ons-list>
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
            <td nowarp width="60px" align="right" style="color:{{day.color}};">{{day.day}} ({{day.ofWeek}})</td>
            <td nowarp width="40px" align="right" >{{tmr[day.day]['work_start']}}</td>
            <td nowarp width="40px" align="right" >{{tmr[day.day]['work_end']}}</td>
            <td nowarp width="30px" align="right" >{{tmr[day.day]['work_rest']}}</td>
            <td nowarp width="45px" align="right" >{{tmr[day.day]['work_hr']}}</td>
            <td nowarp width="45px" align="right" >{{tmr[day.day]['tasks_hr']}}</td>
          </tr>
        </table>
      </ons-list-item>
      <ons-list-item>
        <table>
          <tr style="color:#888888">
            <td nowarp width="60px" align="center">合計</td>
            <td nowarp width="40px" align="right" ></td>
            <td nowarp width="40px" align="right" ></td>
            <td nowarp width="30px" align="right" ></td>
            <td nowarp width="45px" align="right" >{{sum.work_hr}}</td>
            <td nowarp width="45px" align="right" >{{sum.tasks_hr}}</td>
          </tr>
        </table>
      </ons-list-item>
    </ons-list>
  </ons-page>
</ons-template>

<!--++++++++++++++
  day.html
++++++++++++++++++-->
<ons-template id="day.html">
  <ons-page ng-controller="dayController">
    <ons-toolbar>
      <div class="left">
        <ons-back-button>月</ons-back-button>
      </div>
      <div class="center">{{ymd.year}}年 {{ymd.month}}月 {{ymd.day}}日（{{ymd.ofWeek}}）</div>
      <div class="right">
        <ons-toolbar-button ng-click="deleteRecord()">
          <ons-icon icon="ion-ios-trash-outline" size="30px"></ons-icon>
        </ons-toolbar-button>
      </div>
    </ons-toolbar>

    <!-- ****** 入力フォーム ******-->
    <table class="t_layout" style="margin-top:10px;">
      <tr>
        <td><span style="color:#888888">始</span></td>
        <td><span style="color:#888888">終</span></td>
        <td><span style="color:#888888">休</span></td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td>
          <input type="tel" ng-model="in_start" class="text-input" maxlength="3" style="text-align:right; width:60px; font-size:140%;">
        </td>
        <td>
          <input type="tel" ng-model="in_end"   class="text-input" maxlength="3" style="text-align:right; width:60px; font-size:140%;">
        </td>
        <td>
          <input type="tel" ng-model="in_rest"  class="text-input" maxlength="2" style="text-align:right; width:50px; font-size:140%;">
        </td>
        <td>
          <span style="color:#888888">実働</span>
        </td>
        <td align="right">
          <span style="font-size:140%;">{{ getWorkHours() }}</span>
        </td>
      </tr>
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td>
          <span style="color:#888888">入力</span><br>
          <span style="color:#888888">差</span>
        </td>
        <td align="right">
          <span style="font-size:140%;">{{ getSum()  }}</span><br>
          <span style="font-size:140%; color:{{getDiffColor()}};">{{ getDiff() }}</span>
        </td>
      </tr>
    </table>

    <table class="t_tasks" id="taskTable">
      <tr ng-repeat="task in tasks">
        <td>
          {{task.name}}
        </td>
        <td nowrap align="right">
          <input type="tel" ng-model="task.hr" class="text-input" maxlength="3" value="{{task.hr}}" style="text-align:right; width:60px; font-size:140%;">
          <ons-icon icon="ion-ios-close" ng-click="deleteTask(task.tid)" style="color:#bbbbbb;" size="18px"></ons-icon>
        </td>
      </tr>
    </table>

    <div style="margin-left: 20px;">
      <button class="button--quiet" ng-click="navi.pushPage('tasks.html')"><ons-icon icon="ion-ios-plus-outline"></ons-icon> 追加</button>
    </div>

    <div style="text-align:center; margin: 20px 10px 20px 10px;">
      <ons-button modifier="large" ng-click="save()">保存</ons-button>
    </div>

    <table id="message_day" class="messageBox" style="display:none;">
      <tr>
        <td>
          <ons-icon icon="ion-ios-checkmark"></ons-icon>&nbsp;<span>{{message}}</span>
        </td>
      </tr>
    </table>

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
        <ons-toolbar-button ng-click="navi.pushPage('task.html')"><ons-icon icon="ion-ios-plus-empty" size="35px"></ons-icon>&nbsp;&nbsp;</ons-toolbar-button>
      </div>
    </ons-toolbar>
    <ons-list>
      <ons-list-header>よく使う</ons-list-header>
      <ons-list-item ng-repeat="task in tasks" >
        <ons-row>
          <ons-col width="80%" style="overflow:hidden;">
            <ons-button modifier="quiet" ng-click="selectTask(task.tid)">{{task.name}}</ons-button>
          </ons-col>
          <ons-col>
            <div style="float: right; padding-right: 16px;">
              <ons-icon icon="ion-ios-compose-outline" ng-click="navi.pushPage('task.html', {tid: task.tid})"></ons-icon>
            </div>
          </ons-col>
        </ons-row>
      </ons-list-item>
      <ons-list-header>もうあまり使わない</ons-list-header>
      <ons-list-item ng-repeat="task in outdatedTasks" >
        <ons-row>
          <ons-col width="80%" style="overflow:hidden;">
            <ons-button modifier="quiet" ng-click="selectTask(task.tid)">{{task.name}}</ons-button>
          </ons-col>
          <ons-col>
            <div style="float: right; padding-right: 16px;">
              <ons-icon icon="ion-ios-compose-outline" ng-click="navi.pushPage('task.html', {tid: task.tid})"></ons-icon>
            </div>
          </ons-col>
        </ons-row>
      </ons-list-item>
    </ons-list>
  </ons-page>
</ons-template>

<!--++++++++++++++
  task.html
++++++++++++++++++-->
<ons-template id="task.html">
  <ons-page ng-controller="taskController">
    <ons-toolbar>
      <div class="left">
        <ons-back-button>タスク選択</ons-back-button>
      </div>
      <div class="center">タスク詳細</div>
    </ons-toolbar>

    <input type="hidden" ng-value="tid">

    <table class="t_task">
      <tr>
        <td nowrap>
          名称
        </td>
        <td nowrap style="position:relative">
          <input type="text" ng-model="task_name" class="text-input" maxlength="30" size="50" style="width:100%; box-sizing:border-box">
        </td>
      </tr>
      <tr>
        <td colspan="2" class="td_note">
          ※30文字まで。カンマ(,)は使用不可。<br>
          ※各ページのタスク一覧は名称でソートされます。
        </td>
      </tr>
    </table>
    <table class="t_task">
      <tr>
        <td nowrap>
          もうあまり使わない
        </td>
        <td align="right">
          <label class="switch">
            <input type="checkbox" class="switch__input" ng-model="task_outdated">
            <div class="switch__toggle"></div>
          </label>
        </td>
      </tr>
      <tr>
        <td colspan="2" class="td_note">
          ※タスクは原則 削除できません。不要なタスクはこのオプションをオンにしてください。
        </td>
      </tr>
    </table>

    <div style="text-align:center; margin: 20px 10px 20px 10px;">
      <ons-button modifier="large" ng-click="save();">保存</ons-button>
    </div>

  </ons-page>
</ons-template>

<!--++++++++++++++
  tab_summary.html
++++++++++++++++++-->
<ons-template id="tab_summary.html">
  <ons-page ng-controller="summaryController">

    <ons-toolbar>
      <div class="center">集計</div>
    </ons-toolbar>

    <div class="button-bar" style="width:325px;margin:20px auto; 0px">
      <div class="button-bar__item">
        <input type="radio" ng-model="period" value="thisMonth" ng-change="changePeriod()">
        <button class="button-bar__button">今月</button>
      </div>
      <div class="button-bar__item">
        <input type="radio" ng-model="period" value="prevMonth" ng-change="changePeriod()">
        <button class="button-bar__button">先月</button>
      </div>
      <div class="button-bar__item">
        <input type="radio" ng-model="period" value="thisWeek" ng-change="changePeriod()">
        <button class="button-bar__button">今週</button>
      </div>
      <div class="button-bar__item">
        <input type="radio" ng-model="period" value="prevWeek" ng-change="changePeriod()">
        <button class="button-bar__button">先週</button>
      </div>
      <div class="button-bar__item">
        <input type="radio" ng-model="period" value="specific" ng-change="changePeriod()">
        <button class="button-bar__button">任意</button>
      </div>
    </div>

    <div style="width:100%; margin:30px auto 0px; text-align:center; display:{{displayPeriod_specific}};">
      <input type="date" class="text-input" ng-model="date_start">
      ～
      <input type="date" class="text-input" ng-model="date_end">
      <ons-button modifier="quiet" ng-click='calc()'>更新</ons-button>
    </div>

    <div style="width:100%; margin:30px auto 0px; text-align:center; display:block; display:{{displayPeriod_fixed}};">
      {{date_start.getFullYear()}}年{{date_start.getMonth() + 1}}月{{date_start.getDate()}}日({{ getOfWeek(date_start) }})～{{date_end.getFullYear()}}年{{date_end.getMonth() + 1}}月{{date_end.getDate()}}日({{ getOfWeek(date_end) }})
    </div>

    <table class="t_summary">
      <tr ng-repeat="sum in summary">
        <td>{{sum.name}}</td>
        <td align="right" nowrap>
          {{sum.hr}}
        </td>
      </tr>
      <tr>
        <td>
          <span style="color:#888888">合計</span>
        </td>
        <td align="right" nowrap>
          <span style="color:#888888">{{total}}</span>
        </td>
      </tr>
    </table>

  </ons-page>
</ons-template>

<!--++++++++++++++
  tab_config.html
++++++++++++++++++-->
<ons-template id="tab_config.html">
  <ons-navigator var="naviConfig">
    <ons-page ng-controller="configController">

      <ons-toolbar>
        <div class="center">設定</div>
      </ons-toolbar>

      <ons-list>
        <ons-list-item class="list__item--tappable list__item__line-height" modifier="chevron" ng-click="naviConfig.pushPage('config_default.html')">デフォルト勤務時間</ons-list-item>
        <ons-list-item class="list__item--tappable list__item__line-height" modifier="chevron" ng-click="naviConfig.pushPage('config_tasks.html')"  >タスク</ons-list-item>
        <ons-list-item class="list__item--tappable list__item__line-height" modifier="chevron" ng-click="naviConfig.pushPage('config_export.html')" >エクスポート</ons-list-item>
        <ons-list-item class="list__item--tappable list__item__line-height" modifier="chevron" ng-click="naviConfig.pushPage('config_import.html')" >インポート</ons-list-item>
      </ons-list>

    </ons-page>

  </ons-navigator>
</ons-template>

<!--++++++++++++++
  config_default.html
++++++++++++++++++-->
<ons-template id="config_default.html">
  <ons-page ng-controller="configDefaultController">

    <ons-toolbar>
      <div class="left">
        <ons-back-button>戻る</ons-back-button>
      </div>
      <div class="center">デフォルト勤務時間</div>
    </ons-toolbar>

    <table style="text-align:center; margin: 20px 10px 20px 10px;">
      <tr>
        <td>始業時間：</td> <td><input type="tel" ng-model="df_start" class="text-input" maxlength="3" style="width:60px; text-align:right;"></td>
      </tr>
      <tr>
        <td>終業時間：</td> <td><input type="tel" ng-model="df_end"   class="text-input" maxlength="3" style="width:60px; text-align:right;"></td>
      </tr>
      <tr>
        <td>休憩時間：</td> <td><input type="tel" ng-model="df_rest"  class="text-input" maxlength="2" style="width:60px; text-align:right;"></td>
      </tr>
    </table>

    <div style="color:#888888; padding-left:30px;">
      ※始業終業の例）9:30→95, 2:30→265<br>
      ※休憩の例）1:30→15
    </div>

    <div style="text-align:center; margin: 20px 10px 20px 10px;">
      <ons-button id="btn_save" modifier="large" ng-click="save()">保存</ons-button>
    </div>

    <table id="message_config" class="messageBox" style="display:none;">
      <tr>
        <td>
          <ons-icon icon="ion-ios-checkmark"></ons-icon>&nbsp;<span>{{message}}</span>
        </td>
      </tr>
    </table>

  </ons-page>
</ons-template>

<!--++++++++++++++
  config_tasks.html
++++++++++++++++++-->
<ons-template id="config_tasks.html">
  <ons-page ng-controller="configTasksController">
    <ons-toolbar>
      <div class="left">
        <ons-back-button>設定</ons-back-button>
      </div>
      <div class="center">タスク管理</div>
      <div class="right">
        <ons-toolbar-button ng-click="naviConfig.pushPage('config_task.html')"><ons-icon icon="ion-ios-plus-empty" size="35px"></ons-icon>&nbsp;&nbsp;</ons-toolbar-button>
      </div>
    </ons-toolbar>
    <ons-list>
      <ons-list-header>よく使う</ons-list-header>
      <ons-list-item ng-repeat="task in tasks" ng-click="naviConfig.pushPage('config_task.html', {tid: task.tid})" class="list__item--tappable list__item__line-height" modifier="chevron">
        {{task.name}}
      </ons-list-item>
      <ons-list-header>もうあまり使わない</ons-list-header>
      <ons-list-item ng-repeat="task in outdatedTasks" ng-click="naviConfig.pushPage('config_task.html', {tid: task.tid})" class="list__item--tappable list__item__line-height" modifier="chevron">
        {{task.name}}
      </ons-list-item>
    </ons-list>
  </ons-page>
</ons-template>

<!--++++++++++++++
  config_task.html
++++++++++++++++++-->
<ons-template id="config_task.html">
  <ons-page ng-controller="configTaskController">
    <ons-toolbar>
      <div class="left">
        <ons-back-button>戻る</ons-back-button>
      </div>
      <div class="center">タスク詳細</div>
    </ons-toolbar>

    <input type="hidden" ng-value="tid">

    <table class="t_task">
      <tr>
        <td nowrap>
          名称
        </td>
        <td nowrap style="position:relative">
          <input type="text" ng-model="task_name" class="text-input" maxlength="30" size="50" style="width:100%; box-sizing:border-box">
        </td>
      </tr>
      <tr>
        <td colspan="2" class="td_note">
          ※30文字まで。カンマ(,)は使用不可。<br>
          ※各ページのタスク一覧は名称でソートされます。
        </td>
      </tr>
    </table>
    <table class="t_task">
      <tr>
        <td nowrap>
          もうあまり使わない
        </td>
        <td align="right">
          <label class="switch">
            <input type="checkbox" class="switch__input" ng-model="task_outdated">
            <div class="switch__toggle"></div>
          </label>
        </td>
      </tr>
      <tr>
        <td colspan="2" class="td_note">
          ※タスクは原則 削除できません。不要なタスクはこのオプションをオンにしてください。
        </td>
      </tr>
    </table>

    <div style="text-align:center; margin: 20px 10px 20px 10px;">
      <ons-button modifier="large" ng-click="save();">保存</ons-button>
    </div>

  </ons-page>
</ons-template>

<!--++++++++++++++
  config_export.html
++++++++++++++++++-->
<ons-template id="config_export.html">
  <ons-page ng-controller="configExportController">
    <ons-toolbar>
      <div class="left">
        <ons-back-button>戻る</ons-back-button>
      </div>
      <div class="center">エクスポート</div>
    </ons-toolbar>

    <ons-list-header>タスクマスタ</ons-list-header>
    <ons-list-item>
      <textarea ng-model="taskCsv" rows="8" style="width:100%"></textarea>
      <br>
      <br>
    </ons-list-item>

    <ons-list-header>日々の勤怠</ons-list-header>
    <ons-list-item>
      <select ng-model="month" ng-options="m.name for m in months" ng-change="updateRecordCsv()"></select>
      <textarea ng-model="recordCsv" rows="8" style="width:100%"></textarea>
      <br>
      <br>
    </ons-list-item>
  </ons-page>
</ons-template>

<!--++++++++++++++
  config_import.html
++++++++++++++++++-->
<ons-template id="config_import.html">
  <ons-page ng-controller="configImportController">
    <ons-toolbar>
      <div class="left">
        <ons-back-button>戻る</ons-back-button>
      </div>
      <div class="center">インポート</div>
    </ons-toolbar>

    <ons-list-header>タスクマスタ</ons-list-header>
    <ons-list-item>
      <textarea ng-model="taskCsv" rows="8" style="width:100%"></textarea>
      <ons-button modifier="outline" ng-click="importTaskCsv();">インポートの実行</ons-button>
      <br>
      <br>
    </ons-list-item>

    <ons-list-header>日々の勤怠</ons-list-header>
    <ons-list-item>
      <select ng-model="month" ng-options="m.name for m in months"></select>
      <textarea ng-model="recordCsv" rows="8" style="width:100%"></textarea>
      <ons-button modifier="outline" ng-click="importRecordCsv();">インポートの実行</ons-button>
      <br>
      <br>
    </ons-list-item>
  </ons-page>
</ons-template>
