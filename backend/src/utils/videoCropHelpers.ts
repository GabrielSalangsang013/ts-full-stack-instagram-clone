export default function getFilterValueFromClassName(className: string) {
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