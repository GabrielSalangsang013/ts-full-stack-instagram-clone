export default function OptimizeImage(url: string, options: string[]) {
    let newUrl = url;
    let firstPart = newUrl.substring(0, newUrl.indexOf('/image/upload/')) + '/';
    let secondPart = '/' + url.slice(url.indexOf('/image/upload/') + '/image/upload/'.length);

    return firstPart + options.toString() + secondPart;
}