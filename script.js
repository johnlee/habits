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
        var totalSuccess = 0;
        var totalFail = 0;
        var totalExtinguish =0;
        var totalBurn =0;
        var totalDays = 0;
        var percentFail = 0;
        var percentSuccess = 0;
        var monthSuccess = 0;
        var monthFail = 0;
        var extinguishes = [];
        var burns = [];
        var dates = [];

        $.getJSON(url, function (data) {
            $.each(data, function (i, item) {
                var extinguish = parseInt(item.provoke);
                var burn = parseInt(item.succumb);
                var bkgd = 'bkgd-good';
                if (burn > 2) {
                    totalFail++;
                    bkgd = 'bkgd-danger';
                    if (totalDays < 31) {
                        monthFail++;
                    }
                } else {
                    totalSuccess++;
                    if (totalDays < 31) {
                        monthSuccess++;
                    }
                }
                if (totalDays < 8) {
                    totalExtinguish = totalExtinguish + extinguish;
                    totalBurn = totalBurn + burn;
                }
                totalDays++;
                extinguishes.push(extinguish);
                burns.push(burn);
                dates.push(item.date.slice(-2));

                var row = `<tr><td class='${bkgd}'">${item.date}</td><td>${drawExtinguisher(extinguish)}</td><td>${drawFire(burn)}</td></tr>`;
                $("#tableBody").append(row);
            });
            percentSuccess = totalSuccess / totalDays;
            percentFail = totalFail / totalDays;
            $("#totalSuccess").append(`<strong title="${percentSuccess}">${totalSuccess}</strong>`);
            $("#totalFail").append(`<strong title="${percentFail}">${totalFail}</strong>`);
            $("#totalExtinguished").append(`<strong title="In past 8 days">${totalExtinguish}</strong>`);
            $("#totalBurned").append(`<strong">${totalBurn}</strong>`);
            $("#totalDays").append(`<strong">${totalDays}</strong>`);
            extinguishes = extinguishes.reverse();
            burns = burns.reverse();
            dates = dates.reverse();
            if (totalDays > 30) {
                extinguishes = extinguishes.slice(totalDays - 30);
                burns = burns.slice(totalDays - 30);
                dates = dates.slice(totalDays - 30);
            }
            var bar_config = {
                type: 'bar',
                data: {
                    labels: dates,
                    datasets: [
                        {
                            label: 'Extinguished',
                            backgroundColor: 'rgb(75, 192, 192)',
                            data: extinguishes
                        },
                        {
                            label: 'Burned',
                            backgroundColor: 'rgb(255, 99, 132)',
                            data: burns
                        }
                    ]
                },
                options: {
                    responsive: true
                }
            }
            var pie_config = {
                type: 'pie',
                data: {
                    datasets: [{
                        data: [monthSuccess, monthFail],
                        backgroundColor: [
                            'rgb(75, 192, 192)',
                            'rgb(255, 99, 132)'
                        ]
                    }],
                    labels: [
                        'Success',
                        'Fail'
                    ]
                },
                options: {
                    responsive: true
                }
            };    
            var barChart = document.getElementById('chart-bar').getContext('2d');
            window.myBar = new Chart(barChart, bar_config);
            var pieChart = document.getElementById('chart-pie').getContext('2d');
            window.myPie = new Chart(pieChart, pie_config);
        });
    }
    loadPage();
});