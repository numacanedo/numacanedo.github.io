FROM node

# do not require puppeteer download of Chronium;
# resume-cli uses puppeteer for PDF export, which we do not use.
ENV PUPPETEER_SKIP_DOWNLOAD=1

LABEL repository="https://github.com/kelvintaywl/jsonresume-github-page"
LABEL homepage="https://github.com/kelvintaywl/jsonresume-github-page"
LABEL maintainer="Kelvin Tay <kelvintaywl@gmail.com>"

RUN npm install -g resume-cli
COPY entrypoint.sh /entrypoint.sh
RUN chmod 755 /entrypoint.sh

RUN ls -lsah
RUN ls -lsah /

ENTRYPOINT ["/entrypoint.sh"]