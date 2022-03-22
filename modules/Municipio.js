module.exports.getCode = function (municipio) {

    let code;

    let municipioUpper = municipio.toUpperCase()

    if (municipioUpper.includes("SAGUNTO") || municipioUpper.includes("SEGUNTO") || municipioUpper.includes("SAG") || municipioUpper.includes("SEG")) {
        code = 46220;
    };

    return code;
}