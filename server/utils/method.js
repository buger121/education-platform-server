//将时间戳转换为日期格式YYYY-MM-DD HH:mm:ss
function timetransfor(timestamp) {
    const date = new Date(timestamp);
    Y = date.getFullYear() + '-';
    M =
        (date.getMonth() + 1 < 10
            ? '0' + (date.getMonth() + 1)
            : date.getMonth() + 1) + '-';
    D = date.getDate() + ' ';
    h = date.getHours() + ':';
    m = date.getMinutes() + ':';
    s = date.getSeconds();
    return Y + M + D + h + m + s;
}

module.exports = { timetransfor };
