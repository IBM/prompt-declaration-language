# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /pdl

# Copy the current directory contents into the container at /app
COPY . /pdl

# Install any needed dependencies specified in requirements.txt
RUN pip install .
RUN pip install '.[all]'


# Run app.py when the container launches
ENTRYPOINT ["pdl"]