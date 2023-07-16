const fileSystem = require('fs');
const moment = require('moment');
const core = require('@actions/core');
const path = require('path');
const docs = 'docs';

let resume = fileSystem.readFileSync(core.getInput('resume') || 'resume.json');
let html = render(resume);

if (!fileSystem.existsSync(docs)) {
    fileSystem.mkdirSync(docs);
}
fileSystem.writeFileSync(path.join(docs, 'index.html'), html);
pdf(html).then();

function render(resume) {
    const handlebars = require("handlebars");

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

    return handlebars.compile(fileSystem.readFileSync('resume.hbs', "utf-8"))({
        css: fileSystem.readFileSync('style.css', "utf-8"),
        resume: JSON.parse(resume)
    });
}

async function pdf(resume) {
    const puppeteer = require('puppeteer');

    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.emulateMediaType('screen');
    await page.goto(
        `data:text/html;base64,${btoa(unescape(encodeURIComponent(resume)))}`,
        { waitUntil: 'networkidle0' },
    );

    await page.pdf({
        path: 'resume.pdf',
        format: 'Letter',
        printBackground: true
    });

    await browser.close();
}

function calculateDuration(startDate, endDate) {
    let startMoment = isValid(startDate) ? moment(startDate) : moment();
    let endMoment = isValid(endDate) ? moment(endDate) : moment();

    return moment.duration(endMoment.diff(startMoment));
}

function pad(duration, unit) {
    return `${duration}${unit}`.padStart(unit.length + 2, ' ');
}

function format(date) {
    return isValid(date)
        ? moment(date).format("MMM YYYY")
        : date;
}

function isValid(date) {
    return new Date(date).toString() !== 'Invalid Date';
}