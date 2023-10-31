function urlfor(endpoint, params = {}) {
    let baseApi = "/api/v1/url/";
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: "GET",
            url: baseApi + endpoint,
            contentType: "application/json",
            success: function (data) {
                let url = data["url"];
                if (params !== {}) {
                    url += '?' + objectToQueryString(params);
                }
                resolve(url);
            },
            error: function (error) {
                reject(error);
            }
        })
    });
}


function objectToQueryString(obj) {
    const filteredObject = Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== null && value !== undefined && value !== '')
    );
    return Object.entries(filteredObject)
        .map(([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`)
        .join('&');
}


function getDateStr(offset) {
    const today = new Date();
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    return date.toLocaleDateString('zh-CN').replaceAll('/', '-');
}


function transToFormat(dateStr) {
    let strs = dateStr.split("-");
    if (strs[1].length < 2) {
        strs[1] = '0' + strs[1];
    }
    if (strs[2].length < 2) {
        strs[2] = '0' + strs[2];
    }
    return strs[0] + "-" + strs[1] + "-" + strs[2];
}


function compareTimeStrings(timeStr1, timeStr2) {
    const [hour1, minute1] = timeStr1.split(":").map(Number);
    const [hour2, minute2] = timeStr2.split(":").map(Number);

    if (isNaN(hour1) || isNaN(minute1) || isNaN(hour2) || isNaN(minute2)) {
        // 输入的时间字符串无效
        console.error('time string error');
    }
    if (hour1 < hour2) {
        return -1; // timeStr1 < timeStr2
    } else if (hour1 > hour2) {
        return 1; // timeStr1 > timeStr2
    } else {
        // 小时相同，比较分钟
        if (minute1 < minute2) {
            return -1; // timeStr1 < timeStr2
        } else if (minute1 > minute2) {
            return 1; // timeStr1 > timeStr2
        } else {
            return 0; // timeStr1 === timeStr2
        }
    }
}


function flash(message) {
    let flashMessage = $(".flash-message");
    if (flashMessage) {
        flashMessage.remove();
    }
    // 创建一个新的段落元素来展示闪烁信息
    flashMessage = $('<p>').addClass('flash-message').text(message);
    // 将新的段落元素添加到页面中并设置样式
    $('body').append(flashMessage);
    // 闪烁效果
    flashMessage.fadeIn(618).delay(1000).fadeOut(382, () => {
        $(this).remove();
    });
}


function handleNotes(notes) {
    if (notes === null || notes === "" || notes === undefined) {
        return "无";
    }
    return handleLongText(notes);
}


function handleResultNotes(notes) {
    if (notes === null || notes === "" || notes === undefined) {
        return "无";
    }
    return notes.slice(0, 7) + "...";
}


function handleLongText(text) {
    if (text.length <= 7) {
        return text;
    }
    return `
    <button class="btn btn-primary view-text">查看备注</button>
    <div class="text-content" style="display: none;">
        ${text}
    </div>`;
}


function formatDateTimeToCustomFormat(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}年${month}月${day}日-${hours}:${minutes}`;
}


function formatDateToCustomFormat(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}年${month}月${day}日`;
}
