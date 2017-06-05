FROM zhengxiaoyao0716/flask

MAINTAINER zhengxiaoyao0716

ADD .uwsgi.ini /web/
RUN mkdir /web/share/.log
COPY dist /web/share/public

RUN set -ex \
    && apk add --no-cache --virtual .build-deps \
        gcc \
        libc-dev \
    && /web/.env/bin/pip install --no-cache-dir gevent \
    && apk del .build-deps

# ENTRYPOINT ["uwsgi", "/web/.uwsgi.ini"]
CMD ["uwsgi", "/web/.uwsgi.ini"]
