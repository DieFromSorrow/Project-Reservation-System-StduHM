$(document).ready(function () {
    initPage();
    fetchData();
    registerSubmit();
});

function checkKey(key) {
    let userInput = prompt("请输入密匙："); // 弹出一个输入框，让用户输入字符串
    if (userInput === null) { return null; }
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
        urlfor("admin_password").then(url => {$.ajax({
            type: "INTERNAL",
            url: url,
            contentType: "application/jon",
            success: function (response) {
                let res = checkKey(response.password)
                if (res) {
                    urlfor("api.guiders")
                        .then(function (url) {
                            $.ajax({
                                type: "POST",
                                url: url,
                                data: jsonData,
                                contentType: "application/json",
                                success: function (message) {
                                    // Populate the textarea with the JSON data
                                    if (message.success) {
                                        alert("Success!");
                                    }
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
                    if (res === false) alert("密匙错误");
                }
            }
        })})
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
