const toTimeString = (sec: any, showMilliSeconds = true) => {
    sec = parseFloat(sec);
    let hours: any = Math.floor(sec / 3600);
    let minutes: any = Math.floor((sec - hours * 3600) / 60);
    let seconds: any = sec - hours * 3600 - minutes * 60;

    // add 0 if value < 10; Example: 2 => 02

    if(hours < 10) {
        hours = "0" + hours;
    }

    if(minutes < 10) {
        minutes = "0" + minutes;
    }

    if(seconds < 10) {
        seconds = "0" + seconds;
    }

    let maltissaRegex = /\..*$/; // matches the decimal point and the digits after it e.g if the number is 4.567 it matches .567
    let millisec = String(seconds).match(maltissaRegex);
    return (
        hours + ":" + minutes + ":" + String(seconds).replace(maltissaRegex, "") + (showMilliSeconds ? (millisec ? millisec[0] : ".000") : "")
    );
};

const readFileAsBase64 = async(file: Blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
    });
};

const download = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "");
    link.click();
};

function base64DataUriToBlob(inputURI: any) {
    var binaryVal;
  
    // mime extension extraction
    var inputMIME = inputURI.split(',')[0].split(':')[1].split(';')[0];

    // Extract remaining part of URL and convert it to binary value
    if (inputURI.split(',')[0].indexOf('base64') >= 0)
        binaryVal = atob(inputURI.split(',')[1]);

    // Decoding of base64 encoded string
    else
        binaryVal = unescape(inputURI.split(',')[1]);

    // Computation of new string in which hexadecimal
    // escape sequences are replaced by the character 
    // it represents

    // Store the bytes of the string to a typed array
    var blobArray:any = [];
    for (var index = 0; index < binaryVal.length; index++) {
        blobArray.push(binaryVal.charCodeAt(index));
    }

    return new Blob([blobArray], {
        type: inputMIME
    });
  }


function getFilterValueFromClassName(className: string) {
    switch (className) {
        case "aden":
            return "sepia(.2) brightness(1.15) saturate(1.4)";
        case "clarendon":
            return "sepia(.15) contrast(1.25) brightness(1.25) hue-rotate(5deg)";
        case "crema":
            return "sepia(.5) contrast(1.25) brightness(1.15) saturate(.9) hue-rotate(-2deg)";
        case "gingham":
            return "contrast(1.1) brightness(1.1)";
        case "juno":
            return "sepia(.35) contrast(1.15) brightness(1.15) saturate(1.8)";
        case "lark":
            return "sepia(.25) contrast(1.2) brightness(1.3) saturate(1.25)";
        case "ludwig":
            return "sepia(.25) contrast(1.05) brightness(1.05) saturate(2)";
        case "moon":
            return "brightness(1.4) contrast(.95) saturate(0) sepia(.35)";
        case "original":
            return "";
        case "perpetua":
            return "contrast(1.1) brightness(1.25) saturate(1.1)";
        case "reyes":
            return "sepia(.75) contrast(.75) brightness(1.25) saturate(1.4)";
        case "slumber":
            return "sepia(.35) contrast(1.25) saturate(1.25)";
        default:
            return "";
    }
 }

function blobToFile(fileBlob: any, fileName: string){
    return new File([fileBlob], fileName, { lastModified: new Date().getTime(), type: fileBlob.type })
}

export {toTimeString, readFileAsBase64, download, base64DataUriToBlob, blobToFile, getFilterValueFromClassName};