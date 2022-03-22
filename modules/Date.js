module.exports.today = function () {
    let today = new Date();

    today.setHours(0, 0, 0, 0);
    today = today.toISOString()
    today = today.substring(0, 10);
  
    return today
}

module.exports.format = function (date) {
    let formattedDate = date.substring(0, 10);
    return formattedDate
}

module.exports.dayString = function (date) {

    let day = date.substring(8, 10);
    let month = date.substring(5, 7);
    let year = date.substring(0, 4)
 
    const event = new Date(Date.UTC(year, ( month - 1 ), day, 3, 0, 0));
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const dayString = event.toLocaleDateString('es-ES', options)

    return dayString
}
