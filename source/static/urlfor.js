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
        Object.entries(obj).filter(([key, value]) => value !== null && value !== undefined && value !== '')
    );
    return Object.entries(filteredObject)
        .map(([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`)
        .join('&');
}

