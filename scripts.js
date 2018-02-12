$(document).ready(function () {
    var url = " https://7p4o4mai44.execute-api.us-east-2.amazonaws.com/prod/habits";
    var today = dateToYMD();
    $("#formDate").val(today);

    $("form").submit(function (e) { e.preventDefault(); })

    $("#btnAttempt").click(function () {
        submitAction("attempt");
    });

    $("#btnSuccess").click(function () {
        submitAction("success");
    });

    $("#btnFail").click(function () {
        submitAction("fail");
    });

    function submitAction(action) {
        var content = {
            action: action,
            comments: $("#formComments").val(),
            date: $("#formDate").val()
        };
        $.ajax({
            url: url,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            type: "POST",
            data: JSON.stringify(content),
            success: function (result) {
                alert("Changes Saved");
                // TODO reload page
            }
        });
    }

    function dateToYMD() {
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth() + 1; //Month from 0 to 11
        var y = date.getFullYear();
        return '' + y + (m <= 9 ? '0' + m : m) + (d <= 9 ? '0' + d : d);
    }
});