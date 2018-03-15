$(document).ready(function () {
    $.ajaxSetup({ cache: false });
    //var url = "https://k1gs3gysn1.execute-api.us-east-2.amazonaws.com/prod/habits";
    var url = "http://solidfish.com/habits/habits";
    var today = dateToYMD();
    $("#formDate").val(today);
    $("#editDate").val(today);

    $("form").submit(function (e) { e.preventDefault(); });
    $("editform").submit(function (e) { e.preventDefault(); });

    $("#btnExtinguish").click(function () {
      if (dateCheck()) { submitAction("provoke"); }
    });

    $("#btnBurn").click(function () {
      if (dateCheck()) { submitAction("succumb"); }
    });

    $("#btnSave").click(function () {
      if (dateCheck()) { 
        var content = {
          provoke: $("#editExtinguish").val(),
          succumb: $("#editFire").val()
        };
        $.ajax({
          url: url + '/' + $("#editDate").val(),
          dataType: "json",
          contentType: "application/json;charset=utf-8",
          type: "POST",
          data: JSON.stringify(content),
          success: function (result) {
            success(result);
          },
          error: function (status) {
            if (status && status.status && status.status == 200) {
              success(status);
            } else {
              alert("ERROR - unable to submit request. " + JSON.stringify(status));
              console.log(JSON.stringify(status));
            }
          }
        });
      }
    });

    function submitAction(action) {
      var content = {
        action: action,
        date: $("#formDate").val()
      };
      $.ajax({
        url: url,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        type: "POST",
        data: JSON.stringify(content),
        success: function (result) {
          success(result);
        },
        error: function (status) {
          if (status && status.status && status.status == 200) {
            success(status);
          } else {
            alert("ERROR - unable to submit request. " + JSON.stringify(status));
            console.log(JSON.stringify(status));
          }
        }
      });
    }

    function dateCheck() {
      var date = $("#formDate").val();
      if (date.length != 8) {
        alert("ERROR - invalid date!");
        return false;
      }
      return true;
    }

    function dateToYMD() {
      var date = new Date();
      var d = date.getDate();
      var m = date.getMonth() + 1; //Month from 0 to 11
      var y = date.getFullYear();
      return '' + y + (m <= 9 ? '0' + m : m) + (d <= 9 ? '0' + d : d);
    }

    function drawFire(count) {
      var fire = `<i class="fas fa-fire"></i> `;
      var result = '';
      for (i = 0; i < count; i++) {
        result += fire;
      }
      return result;
    }

    function drawExtinguisher(count) {
      var fire = `<i class="fas fa-fire-extinguisher"></i> `;
      var result = '';
      for (i = 0; i < count; i++) {
        result += fire;
      }
      return result;
    }

    function success(result) {
      console.log("Successfully submitted request. " + JSON.stringify(result));
      location.reload(true);
    }

    function loadPage() {
      console.log('Loading Page...');
      $.getJSON(url, function (data) {
        var success = 0;
        var fail = 0;
        var totalExtinguish = 0;
        var totalBurn = 0;
        var days = 0;

        $.each(data, function (i, item) {
          var extinguish = parseInt(item.provoke);
          var burn = parseInt(item.succumb);
          var bkgd = 'bkgd-good';
          if (burn > 2) {
            fail++;
            bkgd = 'bkgd-danger';
          } else {
            success++;
          }
          if (days < 8) { 
            totalExtinguish = totalExtinguish + extinguish;
            totalBurn = totalBurn + burn; 
          }
          days++;

          var row = `<tr><td class='${bkgd}'">${item.date}</td><td>${drawExtinguisher(extinguish)}</td><td>${drawFire(burn)}</td></tr>`;
          $("#tableBody").append(row);
        });
        var percentSuccess = success / days;
        var percentFail = fail / days;
        $("#totalSuccess").append(`<strong title="${percentSuccess}">${success}</strong>`);
        $("#totalFail").append(`<strong title="${percentFail}">${fail}</strong>`);
        $("#totalExtinguished").append(`<strong title="In past 8 days">${totalExtinguish}</strong>`);
        $("#totalBurned").append(`<strong">${totalBurn}</strong>`);
        $("#totalDays").append(`<strong">${days}</strong>`);
      });
    }
    loadPage();
  });  