$(document).ready(function () {
    initPage();
    initDate();
    initTimeBar();
    registerDateChange();
    registerCheckNumPeoples();
    registerFormSubmit();
    initTime();
})


// 初始化日期选择条
function initDate() {
    let $date = $("#date");
    let offset = 1;
    // while ([0, 6].includes((new Date(transToFormat(getDateStr(offset)))).getDay())) {
    //     offset += 1;
    // }
    let firstDay = transToFormat(getDateStr(offset));
    $date.val(firstDay);
    $date.data("previous", firstDay)
    $date.prop("min", firstDay);
    handleTimes(firstDay);
}


// 初始化时间段选择条
function initTimeBar() {
    let tlAm = Array.from({length: 13 - 8}, (_, i) => (i + 8))
        .flatMap(hour => [hour + ':00', hour + ':30']).slice(1, -1);
    let tlPm = Array.from({length: 19 - 14}, (_, i) => (i + 2))
        .flatMap(hour => [hour + ':00', hour + ':30']).slice(0, -1);

    let timeChoicesAm = [...Array(tlAm.length - 1).keys()]
        .map(i => `${tlAm[i]} - ${tlAm[i + 1]}`);
    let timeChoicesPm = [...Array(tlPm.length - 1).keys()]
        .map(i => `${tlPm[i]} - ${tlPm[i + 1]}`);

    const $timeBarAm = $("#timeBarAm");
    const $timeBarPm = $("#timeBarPm");

    timeChoicesAm.forEach(timeStr => {
        $timeBarAm.append($("<div>")
            .addClass("time-segment").text(timeStr).val(timeStr.replace(/ /g, '') + "am"))
    })
    timeChoicesPm.forEach(timeStr => {
        $timeBarPm.append($("<div>")
            .addClass("time-segment").text(timeStr).val(timeStr.replace(/ /g, '') + "pm"))
    })

    const timeSegments = document.querySelectorAll('.time-segment');
    timeSegments.forEach(function (segment) {
        segment.onclick = function () {
            selectTimeSegment($(segment));
        };
    });
}


// 初始选择第一个和时间段
function initTime() {
    selectTimeSegment($(".time-segment")
        .filter(function () {
            return !$(this).hasClass("reserved") && !$(this).hasClass("unable");
        }).first());
}


// 方框选择时间段
function selectTimeSegment($selectedElement) {
    if (!$selectedElement) {
        return;
    }
    if ($selectedElement.hasClass("reserved")) {
        flash("该场次已被预订", $selectedElement);
        return;
    } else if ($selectedElement.hasClass("unable")) {
        flash("该场次不提供服务，抱歉", $selectedElement);
        return;
    } else {
        $('.time-segment').removeClass("selected");
        $selectedElement.addClass("selected");
        $('#selectedTime').val($($selectedElement).val());
    }
    refreshExplain();
}


function refreshExplain() {
    let $explain = $("#explain");
    let $formCheckLabel = $(".form-check-label");
    let $selectedElement = $(".selected");
    let $numPeoples = $("#num_peoples");
    if ($selectedElement.data("numGuiders") === undefined) {
        return
    }
    if ($selectedElement.data("numGuiders") < 3) {

        $explain.prop("disabled", true);
        $explain.prop("checked", false);
        $formCheckLabel.text("由于资源有限，此时段无法提供讲解");
    } else {
        $explain.prop("disabled", false);
        $formCheckLabel.text("需要讲解");
    }

    if ($numPeoples.val() < 10) {
        if ($explain.prop("disabled") === false) {
            $explain.prop("disabled", true);
            $explain.prop("checked", false);
            $formCheckLabel.text("由于资源有限，10人以上可提供讲解");
        }
    }
}


function registerDateChange() {
    $('#date').on('change', selectDate);
}


function selectDate() {
    const $date = $('#date');
    if (new Date($date.val()) < new Date(transToFormat(getDateStr(1)))) {
        $date.val($date.data("previous"));
        flash("不能预约今天和之前的日期");
        return;
    }
    // let weekday = (new Date($date.val())).getDay();
    // if (weekday === 0 || weekday === 6) {
    //     $date.val($date.data("previous"));
    //     flash("资源有限，周六日不提供服务，请谅解");
    //     return;
    // }
    $date.data("previous", $date.val());
    handleTimes($date.val());
}


function handleSelected(response) {
    let reservedTime = Array()
    let reservations = response["reservations"];
    reservations.forEach(reservation => reservedTime.push(reservation.time))
    $(".time-segment").removeClass("reserved").each((index, elem) => {
        let $elem = $(elem)
        if (reservedTime.includes($elem.val())) {
            $elem.addClass("reserved");
            if ($elem.hasClass("selected")) {
                $elem.removeClass("selected");
                initTime();
            }
        }
    })
}


function handleUnable(response, weekday) {
    setNumGuider("Am", response, weekday);
    setNumGuider("Pm", response, weekday);
    initTime();
}


function setNumGuider(ampm, response, weekday) {
    $("#timeBar" + ampm + " .time-segment").removeClass("unable").each((idx, elem) => {
        let $elem = $(elem);
        $elem.data("numGuiders", 0);
        response[ampm].forEach(guider => {
            let times = $elem.val().slice(0, -2).split("-");
            let start = times[0], end = times[1];
            if (weekday === "Thur") {
                console.log(start, end)
            }
            if (compareTimeStrings(guider["start"], start) <= 0 &&
                compareTimeStrings(guider["end"], end) >= 0) {
                let numGuider = $elem.data("numGuiders") + 1;
                $elem.data("numGuiders", numGuider);
            }
        })
        if ($elem.data("numGuiders") < 1) $elem.addClass("unable");
    })
}


function handleTimes(dateStr) {
    urlfor("api.reservations", {
        date: dateStr
    }).then(url => {
        $.ajax({
            type: "GET",
            url: url,
            contentType: "application/json",
            success: function (response) {
                handleSelected(response);
            },
            error: function (error) {
                console.error("error in handling reserved time:", error)
            }
        })
    })
    let weekday = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"][(new Date(dateStr)).getDay()]
    urlfor("api.guiders", {
        weekday: weekday
    }).then(url => {
        $.ajax({
            type: "GET",
            url: url,
            contentType: "application/json",
            success: function (response) {
                handleUnable(response, weekday)
            },
            error: function (error) {
                console.error(error);
            }
        })
    })
}


function registerCheckNumPeoples() {
    const $numPeoples = $("#num_peoples")
    $numPeoples.on("change",
        function () {
            if ($numPeoples.val() > 40) {
                flash("预约人数不能超过 40");
                $numPeoples.val(40);
            }
            refreshExplain();
        }
    )
}


function registerFormSubmit() {
    $("#reservationForm").submit(function (event) {
        event.preventDefault();

        const submitBtn = $('button[type="submit"]');

        submitBtn.prop('disabled', true);
        let time = $("#selectedTime").val()

        if (!time) {
            alert("此日期所有时段已被预约，请更换其他日期");
            submitBtn.prop('disabled', false);
            return;
        }

        // Collect form data
        const formData = {
            name: $("#name").val(),
            identity: $("#identity").val(),
            phone: $("#phone").val(),
            date: $("#date").val(), // 获取选定的日期
            time: time, // 获取选定的时间
            num_peoples: $("#num_peoples").val(),
            explain: $("#explain").prop("checked"),
            notes: $("#notes").val(),
            csrf_token: $("#csrf_token").val()  // Include the CSRF token
        };

        console.log(JSON.stringify(formData))

        urlfor("api.reservations").then(url => {
            $.ajax({
                type: "POST",
                url: url,
                data: JSON.stringify(formData),
                contentType: "application/json",
                headers: {"X-CSRF-Token": formData.csrf_token},  // Use the CSRF token from formData
                success: function (response) {
                    if (response.success) {
                        // You can redirect or perform other actions upon successful reservation
                        alert(response.message);
                        showResults();
                    }
                    else {
                        showErrors(response.errors)
                    }
                },
                error: function (error) {
                    console.log("Error:", error);
                    alert("预约失败，请重试！");
                },
                complete: function () {
                    // Enable the submit button
                    $('button[type="submit"]').prop('disabled', false);
                    selectDate();
                    initTime();
                }
            });
        })
    });
}


function showErrors(errors) {
    $.each(errors, function (fieldName, errorMessages) {
        let field = $('#' + fieldName);
        field.addClass('is-invalid'); // 添加Bootstrap验证状态类
        field.next('.invalid-feedback').remove(); // 移除上一个错误消息
        field.parent().addClass('has-error'); // 添加Bootstrap验证状态类
        $.each(errorMessages, function (index, errorMessage) {
            field.after('<span class="invalid-feedback" role="alert"><strong>' + errorMessage + '</strong></span>');
        });
    });
}


function showResults() {
    const container = $("#container");
    container.html(`<h2>预约结果</h2>
        <!-- Table to Display Data -->
        <table class="table table-bordered">
            <thead>
            <tr>
                <th class="th-left">日期</th>
                <th>场次</th>
                <th>人数</th>
                <th class="th-right">讲解</th>
            </tr>
            </thead>
            <tbody id="dataRows">
            <!-- Data rows will be inserted here dynamically -->
            </tbody>
        </table>
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
        </div>`)
    const params = {
        name: $("#name").val()
    }
    const dataRows = $("#dataRows");
    urlfor("api.reservations", params).then(function (url) {
        $.ajax({
            type: "GET",
            url: url,
            contentType: "application/json",
            success: function (data) {
                const records = data["reservations"];
                for (const record of records) {
                    // Create and append table rows
                    dataRows.append(`
                        <tr>
                            <td>${formatDateToCustomFormat(record.date).slice(5)}</td>
                            <td>${record.time}</td>
                            <td>${record.num_peoples}</td>
                            <td>${record.explain ? "是" : "否"}</td>
                        </tr>
                    `);
                }
            }
        })
    })
}


function initPage() {
    let container = $("#container");
    const head = `
        <div class="text-center">
            <br />
            <h2>校史馆团体预约参观</h2>
        </div>`
    const tips = `
        <div class="alert alert-primary smaller-text">
            <strong>温馨提示：<br /></strong>
            <p class="add-indent">因人手有限，暂定校史馆周一、周二、周四下午，周三、周五全天内的指定时段提供讲解服务。
               （寒暑假及法定节假日另行通知）为保障参观安全及效果，每批参观人数建议不超40人。
            </p>
        </div>`
    const form = `
        <form id="reservationForm">
            <div class="form-group">
                <label for="name">姓名：</label>
                <input type="text" class="form-control" id="name" required placeholder="请输入姓名">
            </div>
            <div class="form-group">
                <label for="identity">单位：</label>
                <input type="text" class="form-control" id="identity" required placeholder="请输入单位名称">
            </div>
            <div class="form-group">
                <label for="phone">电话：</label>
                <input type="tel" class="form-control" id="phone" required placeholder="请输入电话号码">
            </div>
            <div class="form-group">
                <label for="date">来访日期：</label>
                <input type="date" class="form-control" id="date" name="date" required>
            </div>
            <div class="form-group">
                <label for="selectedTime">场次：</label>
                <div class="ampm">Am</div><div class="time-bar" id="timeBarAm"></div>
                <div class="ampm">Pm</div><div class="time-bar" id="timeBarPm"></div>
                <input type="hidden" id="selectedTime" name="selectedTime">
            </div>
            <div class="form-group">
                <label for="num_peoples">来访人数：</label>
                <input type="number" class="form-control" id="num_peoples" required placeholder="请输入来访人数">
            </div>
            <div class="form-group">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="explain">
                    <label class="form-check-label" for="explain">需要讲解</label>
                </div>
            </div>
            <div class="form-group">
                <label for="notes">其他备注（选填）：</label>
                <textarea type="text" class="form-control" id="notes" placeholder="预祝参观愉快"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">提交预约</button>
        </form>`
    const notes = `
        <div><br />
            <h5>注意事项：</h5>
            <p class="attention">1. 请至少提前一天预约，不允许重复提交申请；<br />
            2. 如参观时间临时有变动，请提前告知；<br />
            3. 参观团体应严格遵守校史馆相关规定，维护好参观秩序；<br />
            4. 联系方式: 0311-87935180，35170。</p>
            <strong class="attention">联系电话仅限电话咨询与特殊情况预约讲解之用。</strong><br />
        </div>`

    container.append(
        head,
        tips,
        form,
        notes
    )
}
