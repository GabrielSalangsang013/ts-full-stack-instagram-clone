import moment from 'moment';

export default function handleTimeDifference(date: any) {

    const mongodbDate = date;
    const parsedDate = moment(mongodbDate);
    const now = moment();

    const hoursDiff = now.diff(parsedDate, 'hours');
    const minutesDiff = now.diff(parsedDate, 'minutes');
    const daysDiff = now.diff(parsedDate, 'days');
    const weeksDiff = now.diff(parsedDate, 'weeks');
    const monthsDiff = now.diff(parsedDate, 'months');
    const secondsDiff = now.diff(parsedDate, 'seconds');

    let formattedDate;

    if (monthsDiff >= 1) {
        formattedDate = `${monthsDiff}mo`;
    } else if (weeksDiff >= 1) {
        formattedDate = `${weeksDiff}w`;
    } else if (daysDiff >= 1) {
        formattedDate = `${daysDiff}d`;
    } else if (hoursDiff >= 1) {
        formattedDate = `${hoursDiff}h`;
    } else if (minutesDiff >= 1) {
        formattedDate = `${minutesDiff}m`;
    } else {
        formattedDate = `${secondsDiff}s`;
    }

    return formattedDate;
}