/* A function that returns the code of the municipality. */
module.exports.getCode = function (municipio) {

    const CODE_SAGUNTO = 46220;
    const CODE_BOADILLA = 28022;

    let code;

    let municipioUpper = municipio.toUpperCase()

    if (municipioUpper.includes("SAGUNTO") || municipioUpper.includes("SEGUNTO") || municipioUpper.includes("SAGUN") || municipioUpper.includes("SEGUN") || municipioUpper.includes("1")) {
        code = CODE_SAGUNTO;
    };

    if (municipioUpper.includes("BOADILLA") || municipioUpper.includes("BOADILL") || municipioUpper.includes("MONTE") || municipioUpper.includes("BOAD") || municipioUpper.includes("2")) {
        code = CODE_BOADILLA;
    };

    return code;
}
/* A function that returns the name of the municipality. */
module.exports.getName = function (municipio) {

    const SAGUNTO = "Sagunto";
    const BOADILLA = "Boadilla del Monte";

    let name;

    let municipioUpper = municipio.toUpperCase()

    if (municipioUpper.includes("SAGUNTO") || municipioUpper.includes("SEGUNTO") || municipioUpper.includes("SAGUN") || municipioUpper.includes("SEGUN") || municipioUpper.includes("1")) {
        name = SAGUNTO;
    };

    if (municipioUpper.includes("BOADILLA") || municipioUpper.includes("BOADILL") || municipioUpper.includes("MONTE") || municipioUpper.includes("BOAD") || municipioUpper.includes("2")) {
        name = BOADILLA;
    };

    return name;
}