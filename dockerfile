FROM python:3.8
WORKDIR /app 

RUN pip install -r requirements.txt 
CMD ["uwsgi","uwsgi.ini"]

