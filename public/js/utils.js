
var markerColors = [
    {name: "red", hex: ["e84141", "990000"]}, 
    {name: "blue", hex: ["5dade2", "35586C"]}, 
    {name: "purple", hex: ["9969c7", "633974"]}, 
    {name: "orange", hex: ["ff7f00", "873600"]}, 
    {name: "green", hex: ["46CB18", "145a32"]},
    {name: "yellow", hex: ["fdfd04", "7e5109"]}
  ];

function leadingZero(i) {
    return (i < 10) ? '0' + i : i;
}

function getMonthWithZero(month) {
    return leadingZero((month + 1));
}

function getMonthShortName(month) {
    var monthNames = ["sty", "lut", "marz", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
    return monthNames[month];
}

function prepareDistance(distance, fixed = 1) {
    var value;

    if(distance < 1) {
        
        value = Math.round(distance * 1000);
    }
    else if(distance < 100) {
        value = parseFloat(new Number(distance).toFixed(fixed)); // parseFloat removes additional zeros; e.g. 10 -> 10.0 -> 10; 21.232 -> 21.2 -> 21.2
    }
    else {
        value = Math.round(distance);
    }

    return {
        value: value,
        unit: getDistanceUnit(distance)
    }

    function getDistanceUnit(distance) {
        return distance >= 1 ? "km" : "m";
    }
}