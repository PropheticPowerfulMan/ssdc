FROM python:3.11-slim
WORKDIR /srv
COPY pyproject.toml ./
COPY app ./app
RUN pip install --no-cache-dir . && useradd --uid 10001 --create-home ssdc && mkdir -p /srv/var/objects && chown -R ssdc:ssdc /srv/var
COPY alembic.ini ./
COPY migrations ./migrations
USER ssdc
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
