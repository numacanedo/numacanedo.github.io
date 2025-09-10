const fileSystem = require('fs');
const moment = require('moment');
const path = require('path');
const docs = 'docs';
const prettify = require('@liquify/prettify');
const handlebars = require("handlebars");
const yaml = require('json-to-pretty-yaml');

let resume = fileSystem.readFileSync('resume.json');

console.log('Register helpers...');
registerHelpers();

console.log('Rendering resume...');
let html = prettify.formatSync(render(resume), {
    indentSize: 1,
    indentChar: '\t',
    markup: {
        preserveText: true
    }
});

if (!fileSystem.existsSync(docs)) {
    fileSystem.mkdirSync(docs);
}

console.log('Persisting resume...');
fileSystem.writeFileSync(path.join(docs, 'index.html'), html);

console.log('Creating text...');
fileSystem.writeFileSync(path.join(docs, 'resume.json'), resume);
fileSystem.writeFileSync(path.join(docs, 'resume.yaml'), yaml.stringify(JSON.parse(resume.toString())));
fileSystem.writeFileSync(path.join(docs, 'resume.txt'), text(resume, 'resume-txt.hbs'));

fileSystem.copyFile('profile.jpeg', path.join(docs, 'profile.jpeg'), (err) => {
    if (!err) console.log('File was copied to destination');
});

console.log('Creating pdf...');
pdf(path.join(docs, 'resume.pdf'), html);

function render(resume) {
    fileSystem
        .readdirSync('partials')
        .forEach(function (filename) {
            handlebars.registerPartial(
                filename.split('.')[0],
                fileSystem.readFileSync(path.join('partials', filename), 'utf8'));
        });

    return handlebars.compile(fileSystem.readFileSync('resume.hbs', 'utf-8'))({
        css: fileSystem.readFileSync('style.css', 'utf-8'),
        resume: JSON.parse(resume)
    });
}

function text(resume, template) {
    return handlebars.compile(fileSystem.readFileSync(template, 'utf-8'))({
        resume: JSON.parse(resume)
    });
}

function pdf(pdfFile, resume) {
    (async () => {
        const puppeteer = require('puppeteer');

        console.log('Launching browser...');
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: 'new'
        });

        console.log('Creating page...');
        const page = await browser.newPage();
        await page.emulateMediaType('print');

        console.log('Opening resume...');
        await page.goto(`data:text/html;charset=UTF-8,${encodeURIComponent(resume)}`);

        console.log('Printing resume...');
        await page.pdf({
            path: pdfFile,
            format: 'Letter'
        });

        console.log('Closing browser...');
        await browser.close();
    })();
}

function registerHelpers() {
    handlebars.registerHelper('format', function (startDate, endDate) {
        return `${format(startDate)} - ${format(endDate)}`;
    });

    handlebars.registerHelper('duration', function (startDate, endDate) {
        let duration = calculateDuration(startDate, endDate);

        return `${pad(duration.years(), 'y')}${pad(duration.months(), 'm')}|`;
    });

    handlebars.registerHelper('experience', function (work) {
        let duration = calculateDuration(work.at(-1).startDate);
        let months = duration.months() > 5 ? ` ${duration.months()} months` : '';

        return duration.years() > 0 ? `${duration.years()} years${months} of experience` : '';
    });

    handlebars.registerHelper('add-dot', function (text) {
        return '.' === text?.slice(-1) ? text : text + '.';
    });
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
    return isValid(date) ? moment(date).format('MMM YYYY') : date;
}

function isValid(date) {
    return new Date(date).toString() !== 'Invalid Date';
}
