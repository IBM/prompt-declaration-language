FROM python:3.11-slim

WORKDIR /pdl

RUN apt-get update && apt-get install -y git

COPY . /pdl

RUN pip install prompt-declaration-language[examples]

ENTRYPOINT ["pdl"]
