FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY pyproject.toml /app/
RUN pip install --no-cache-dir -U pip \
    && pip install --no-cache-dir "fastapi[standard]" docker pydantic-settings psycopg[binary] redis boto3 requests
COPY app /app/app
EXPOSE 8000
CMD ["fastapi", "run", "app/main.py", "--port", "8000", "--workers", "2"]
