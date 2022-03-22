module.exports.today = function () {
    let today = new Date();

    today.setHours(0, 0, 0, 0);
    today = today.toISOString()
    today = today.substring(0, 10);
  
    return today
}
