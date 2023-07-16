const https = require("https");
const fileSystem = require("fs");
https
    .get('https://gist.githubusercontent.com/numacanedo/8826eee009df27288db9ef2784e70bda/raw', resp => {
        let resume = '';

        resp.on("data", chunk => {
            resume += chunk;
        });

        resp.on("end", () => {
            if (!fileSystem.existsSync('docs')) {
                fileSystem.mkdirSync('docs');
            }
            fileSystem.writeFileSync('docs/index.html', render(resume));
        });
    });

function render(resume) {
    let path = require('path');
    let handlebars = require("handlebars");

    fileSystem
        .readdirSync('partials')
        .forEach(function (filename) {
            handlebars.registerPartial(
                filename.split(".")[0],
                fileSystem.readFileSync(path.join('partials', filename), 'utf8'));
        });

    handlebars.registerHelper('format', function (startDate, endDate) {
        return `${format(startDate)} - ${format(endDate)}`;
    });

    handlebars.registerHelper('duration', function (startDate, endDate) {
        let duration = calculateDuration(startDate, endDate);

        return `${pad(duration.years(), 'y')}${pad(duration.months(), 'm')}|`
            .replaceAll(' ', '&nbsp;');
    });

    handlebars.registerHelper('experience', function (work) {
        let duration = calculateDuration(work.at(-1).startDate);
        let months = duration.months() > 5 ? ` ${duration.months()} months` : '';

        return duration.years() > 0
            ? `${duration.years()} years${months} of experience`
                .replaceAll(' ', '&nbsp;')
            : '';
    });

    handlebars.registerHelper('add-dot', function (text) {
        return '.' === text.slice(-1) ? text : text + '.';
    });

    return handlebars.compile(fileSystem.readFileSync(path.join(__dirname, 'resume.hbs'), "utf-8"))({
        css: fileSystem.readFileSync(path.join(__dirname, 'style.css'), "utf-8"),
        resume: JSON.parse(resume)
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
    let moment = require('moment');

    return isValid(date)
        ? moment(date).format("MMM YYYY")
        : date;
}

function isValid(date) {
    return new Date(date).toString() !== 'Invalid Date';
}