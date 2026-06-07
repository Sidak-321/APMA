FROM python:3.11-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml uv.lock* ./

# Explicitly create venv at a known path, then sync into it
RUN uv venv .venv
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

COPY app/ ./app/

ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 5001
CMD ["python", "app/main.py"]