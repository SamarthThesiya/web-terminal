# Use Python Alpine image
FROM python:alpine3.19

# Set the working directory
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose the port
EXPOSE 5000

# Run the application
CMD ["python", "run.py"]
#ENTRYPOINT ["/entrypoint.sh"]
