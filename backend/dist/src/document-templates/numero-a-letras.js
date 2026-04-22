"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numeroALetras = numeroALetras;
function numeroALetras(num, currency) {
    const plural = currency === 'USD' ? 'dólares' : 'bolívares';
    const singular = currency === 'USD' ? 'dólar' : 'bolívar';
    const centsPlural = currency === 'USD' ? 'centavos' : 'céntimos';
    const centsSingular = currency === 'USD' ? 'centavo' : 'céntimo';
    function Unidades(num) {
        switch (num) {
            case 1: return 'un';
            case 2: return 'dos';
            case 3: return 'tres';
            case 4: return 'cuatro';
            case 5: return 'cinco';
            case 6: return 'seis';
            case 7: return 'siete';
            case 8: return 'ocho';
            case 9: return 'nueve';
            default: return '';
        }
    }
    function Decenas(num) {
        let decena = Math.floor(num / 10);
        let unidad = num - (decena * 10);
        switch (decena) {
            case 1:
                switch (unidad) {
                    case 0: return 'diez';
                    case 1: return 'once';
                    case 2: return 'doce';
                    case 3: return 'trece';
                    case 4: return 'catorce';
                    case 5: return 'quince';
                    default: return 'dieci' + Unidades(unidad);
                }
            case 2:
                switch (unidad) {
                    case 0: return 'veinte';
                    default: return 'veinti' + Unidades(unidad);
                }
            case 3: return DecenasY('treinta', unidad);
            case 4: return DecenasY('cuarenta', unidad);
            case 5: return DecenasY('cincuenta', unidad);
            case 6: return DecenasY('sesenta', unidad);
            case 7: return DecenasY('setenta', unidad);
            case 8: return DecenasY('ochenta', unidad);
            case 9: return DecenasY('noventa', unidad);
            case 0: return Unidades(unidad);
            default: return '';
        }
    }
    function DecenasY(strSin, numUnidades) {
        if (numUnidades > 0)
            return strSin + ' y ' + Unidades(numUnidades);
        return strSin;
    }
    function Centenas(num) {
        let centenas = Math.floor(num / 100);
        let decenas = num - (centenas * 100);
        switch (centenas) {
            case 1:
                if (decenas > 0)
                    return 'ciento ' + Decenas(decenas);
                return 'cien';
            case 2: return 'doscientos ' + Decenas(decenas);
            case 3: return 'trescientos ' + Decenas(decenas);
            case 4: return 'cuatrocientos ' + Decenas(decenas);
            case 5: return 'quinientos ' + Decenas(decenas);
            case 6: return 'seiscientos ' + Decenas(decenas);
            case 7: return 'setecientos ' + Decenas(decenas);
            case 8: return 'ochocientos ' + Decenas(decenas);
            case 9: return 'novecientos ' + Decenas(decenas);
            default: return Decenas(decenas);
        }
    }
    function Seccion(num, divisor, strSingular, strPlural) {
        let cientos = Math.floor(num / divisor);
        if (cientos > 0) {
            if (cientos > 1)
                return Centenas(cientos) + ' ' + strPlural;
            else
                return strSingular;
        }
        return '';
    }
    function Miles(num) {
        let divisor = 1000;
        let cientos = Math.floor(num / divisor);
        let resto = num - (cientos * divisor);
        let strMiles = Seccion(num, divisor, 'un mil', 'mil');
        let strCentenas = Centenas(resto);
        if (strMiles === '')
            return strCentenas;
        return (strMiles + ' ' + strCentenas).trim();
    }
    function Millones(num) {
        let divisor = 1000000;
        let cientos = Math.floor(num / divisor);
        let resto = num - (cientos * divisor);
        let strMillones = Seccion(num, divisor, 'un millón', 'millones');
        let strMiles = Miles(resto);
        if (strMillones === '')
            return strMiles;
        return (strMillones + ' ' + strMiles).trim();
    }
    let enteros = Math.floor(num);
    let centavos = Math.round(num * 100) - (enteros * 100);
    let letrasEnteros = '';
    if (enteros === 0)
        letrasEnteros = 'cero';
    else if (enteros === 1)
        letrasEnteros = Millones(enteros) + ' ' + singular;
    else
        letrasEnteros = Millones(enteros) + ' ' + plural;
    letrasEnteros = letrasEnteros.replace('un millón dólares', 'un millón de dólares');
    letrasEnteros = letrasEnteros.replace('millones dólares', 'millones de dólares');
    letrasEnteros = letrasEnteros.replace('un millón bolívares', 'un millón de bolívares');
    letrasEnteros = letrasEnteros.replace('millones bolívares', 'millones de bolívares');
    let letrasCentavos = '';
    if (centavos > 0) {
        if (centavos === 1)
            letrasCentavos = 'con un ' + centsSingular;
        else
            letrasCentavos = 'con ' + Decenas(centavos) + ' ' + centsPlural;
    }
    else {
        letrasCentavos = 'con cero ' + centsPlural;
    }
    return (letrasEnteros + ' ' + letrasCentavos).trim();
}
//# sourceMappingURL=numero-a-letras.js.map