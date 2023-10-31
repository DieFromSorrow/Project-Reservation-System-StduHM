$(document).ready(function () {
    initPage();
    fetchData();
    registerSubmit();
});


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
        if (confirm("Are you sure you want to submit this data?")) {
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
    });
}


function initPage() {
    const headAndForm = `
        <h1>JSON Editor</h1>
        <form id="jsonForm">
            <div class="form-group">
                <label for="jsonData">JSON Data</label>
                <textarea class="form-control" id="jsonData" rows="30"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
        </form>`
    $("#container").append(headAndForm)
}
