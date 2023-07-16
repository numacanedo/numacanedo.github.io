console.log(render());

function render() {
    let fileSystem = require("fs");
    let path = require('path');
    let handlebars = require("handlebars");

    fileSystem
        .readdirSync(path.join(__dirname, 'partials'))
        .forEach(function (filename) {
            handlebars.registerPartial(
                filename.split(".")[0],
                fileSystem.readFileSync(path.join(__dirname, 'partials', filename), 'utf8'));
        });

    handlebars.registerHelper('format', function (startDate, endDate) {
        return `${format(startDate)} - ${format(endDate)}`;
    });

    handlebars.registerHelper('duration', function (startDate, endDate) {
        let duration = calculateDuration(startDate, endDate);

        return `${pad(duration.years(), 'y')}${pad(duration.months(), 'm')}|`.replaceAll(' ', '&nbsp;');
    });

    handlebars.registerHelper('experience', function (work) {
        let duration = calculateDuration(work.at(-1).startDate);
        let months = duration.months() > 5 ? ` ${duration.months()} months` : '';

        return duration.years() > 0
            ? `${duration.years()} years${months} of experience`.replaceAll(' ', '&nbsp;')
            : '';
    });

    handlebars.registerHelper('add-dot', function (text) {
        return '.' === text.slice(-1) ? text : text + '.';
    });

    return handlebars.compile(fileSystem.readFileSync(path.join(__dirname, 'resume.hbs'), "utf-8"))({
        css: fileSystem.readFileSync(path.join(__dirname, 'style.css'), "utf-8"),
        resume: JSON.parse(fileSystem.readFileSync(path.join(__dirname, 'resume.json'), "utf-8"))
    });
}

function calculateDuration(startDate, endDate) {
    let moment = require('moment');

    let startMoment = isValid(startDate) ? moment(startDate) : moment();
    let endMoment = isValid(endDate) ? moment(endDate) : moment();

    return moment.duration(endMoment.diff(startMoment));
}

function pad(duration, unit) {
    let newDuration = duration ? ''.concat(duration).concat(unit) : ''
    return newDuration.padStart(unit.length + 2, ' ');
}

function format(date) {
    var moment = require('moment');

    return isValid(date)
        ? moment(date).format("MMM YYYY")
        : date;
}

function isValid(date) {
    return new Date(date).toString() !== 'Invalid Date';
}