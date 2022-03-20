FROM python:3.8
WORKDIR /app 

COPY requirements.txt /tmp/

RUN pip install -U pip && pip install -r /tmp/requirements.txt

CMD ["uwsgi","uwsgi.ini"]

