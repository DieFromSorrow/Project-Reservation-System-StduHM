$(document).ready(function () {
    initPage();
    fetchData();
    registerSubmit();
});

function checkKey() {
    let key = "secret_key"; // 这是你的密匙
    let userInput = prompt("请输入密匙："); // 弹出一个输入框，让用户输入字符串
    return userInput === key;
}


function fetchData() {
    urlfor("api.guiders")
        .then(function (url) {
            $.ajax({
                type: "GET",
                url: url,
                contentType: "application/json",
                success: function (data) {
                    // Populate the textarea with the JSON data
                    $('#jsonData').val(JSON.stringify(data, null, 4));
                },
                error: function (error) {
                    console.error(error);
                }
            });
        })
        .catch(function (error) {
            console.error(error);
        });
}


function registerSubmit() {
    $('#jsonForm').submit(function (event) {
        event.preventDefault();
        let jsonData = $('#jsonData').val();
        if (checkKey()) {
            urlfor("api.guiders")
                .then(function (url) {
                    $.ajax({
                        type: "POST",
                        url: url,
                        data: jsonData,
                        contentType: "application/json",
                        success: function (message) {
                            // Populate the textarea with the JSON data
                            alert("Success!");
                        },
                        error: function (error) {
                            console.error(error);
                        }
                    });
                })
                .catch(function (error) {
                    console.error(error);
                });
        }
        else {
            alert("密匙错误");
        }
    });
}


function initPage() {
    const headAndForm = `
        <h1>JSON Editor</h1>
        <form id="jsonForm">
            <div class="form-group">
                <label for="jsonData">JSON Data</label>
                <textarea class="form-control" id="jsonData" rows="27"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
        </form>`
    $("#container").append(headAndForm)
}
