/**/
const endpoint = "api.reservations"; // Update with your actual API endpoint
let min_id = null;


$(document).ready(function () {
    let admin_input = prompt("请输入密匙：");
    if (admin_input === null) {} else {
        urlfor("admin_password").then(url => {$.ajax({
            type: "INTERNAL",
            url: url,
            contentType: "application/jon",
            success: function (response) {
                if (admin_input === response.password) x();
                else alert("密匙错误");
            }
        })})
    }
});


function x() {
    let limit = 20;
    // Initial web page
    initPage();

    // Initial load of the first 100 records
    loadRecords(limit);

    // Load more records when "加载更多" button is clicked
    $("#loadMoreBtn").click(function () {
        loadRecords(limit, min_id, false);
    });

    $("#refreshBtn").click(function () {
        loadRecords(limit, null, true);
    })

    // Filtering logic
    $(".form-control").each((idx, elem) => {
        $(elem).change(function () {
            loadRecords(limit);
        })
    });

    let socket = io();

    socket.on('connect', function () {
        console.log('Connected to the server');
    });

    socket.on('new_reservation', function (data) {
        // 处理新的数据
        console.log('New data:', data);
        putNewRecord(data)
    });
}


function putNewRecord(record) {
    let pName = $("#name").val();
    let pIdentity = $("#identity").val();
    let pDate = $("#date").val();
    let pTime = $("#time").val();
    if (pName && (pName !== record.name)) return;
    if (pIdentity && pIdentity !== record.identity) return;
    if (pDate && pDate !== record.date) return;
    if (pTime && pTime !== record.time) return;
    console.log("OK")
    $("#dataRows").prepend($(constructRecord(record)));
}


function getUrl(limit = null, begin_id = null, end_id = null) {
    const params = {
        name: $("#name").val(),
        identity: $("#identity").val(),
        date: $("#date").val(),
        time: $("#time").val(),
        limit: limit,
        begin_id: begin_id,
        end_id: end_id
    }

    return urlfor(endpoint, params)
}


function constructRecord(record) {
    return `
        <tr>
            <td>${record.id}</td>
            <td>${record.name}</td>
            <td>${record.identity}</td>
            <td>${record.phone}</td>
            <td>${formatDateToCustomFormat(record.date)}</td>
            <td>${record.time}</td>
            <td>${record.num_peoples}</td>
            <td>${record.explain ? "是" : "否"}</td>
            <td>${handleNotes(record["notes"])}</td>
            <td>${formatDateTimeToCustomFormat(record["time_submitted"])}</td>
        </tr>`
}


function renderData(records, dropped_all) {
    const dataRows = $("#dataRows");
    if (dropped_all) {
        dataRows.empty();
    }

    for (const record of records) {
        // Create and append table rows
        dataRows.append(constructRecord(record));
    }
}


function registerClick() {
    $(".view-text").click(function () {
        let textContent = $(this).next(".text-content").html();
        $("#text-modal-body").html(textContent);
        $('#text-modal').modal('show');
    })
}


function loadRecords(limit = null, end_id = null, dropped_all = true) {
    getUrl(limit, null, end_id).then(function (url) {
        $.ajax({
            type: "GET",
            url: url,
            contentType: "application/json",
            success: function (data) {
                // Process and display the data in the table
                const records = data["reservations"]; // Replace with your actual response data
                const $loadMoreBtn = $("#loadMoreBtn");
                if (dropped_all || records.length > 0) {
                    if ($loadMoreBtn.prop("disabled")) {
                        $loadMoreBtn.prop("disabled", false);
                    }
                    renderData(records, dropped_all);
                    registerClick();
                    min_id = records[records.length - 1].id - 1
                } else {
                    $loadMoreBtn.innerText = "已到底";
                    $loadMoreBtn.prop("disabled", true);
                }
            },
            error: function (error) {
                console.error("Error loading data: " + error);
            }
        });
    })
        .catch(function (error) {
            console.error("Error building URL: " + error);
        });
}

function initPage() {
    const container = $("#container");
    const head = `
        <h1>校史馆预约管理后台</h1>`;
    const form = `
        <!-- Filter and Search Bar -->
        <div class="form-group">
            <div class="row">
                <div class="col">
                    <label for="name">姓名</label>
                    <input type="text" class="form-control" id="name" placeholder="姓名筛选">
                </div>
                <div class="col">
                    <label for="identity">单位</label>
                    <input type="text" class="form-control" id="identity" placeholder="单位筛选">
                </div>
                <div class="col">
                    <label for="date">日期</label>
                    <input type="date" class="form-control" id="date" placeholder="日期筛选">
                </div>
                <div class="col">
                    <label for="time">场次</label>
                    <input type="text" class="form-control" id="time" placeholder="场次筛选">
                </div>
            </div>
        </div>`;
    const table = `
        <!-- Table to Display Data -->
        <table class="table table-bordered">
            <thead>
            <tr>
                <th class="th-left">ID</th>
                <th>姓名</th>
                <th>单位</th>
                <th>电话</th>
                <th>日期</th>
                <th>场次</th>
                <th>人数</th>
                <th>讲解</th>
                <th>备注</th>
                <th class="th-right">提交时间</th>
            </tr>
            </thead>
            <tbody id="dataRows">
            <!-- Data rows will be inserted here dynamically -->
            </tbody>
        </table>`;
    const loadMoreBtn = `
        <!-- Load More Button -->
        <button class="btn btn-primary" id="loadMoreBtn">加载更多</button>
        <button class="btn btn-primary" id="refreshBtn">刷新数据</button>`;
    const modal = `
        <!-- 模态框 -->
        <div class="modal" id="text-modal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title">备注内容</h4>
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                    </div>
                    <div class="modal-body" id="text-modal-body">
                        <!-- 这里将显示文本内容 -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>
                    </div>
                </div>
            </div>
        </div>`;
    container.append(
        head,
        form,
        table,
        loadMoreBtn,
        modal
    );
}
