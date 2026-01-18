FROM public.ecr.aws/lambda/python:3.12

# Copy API files
COPY *.py ${LAMBDA_TASK_ROOT}/
COPY conf/ ${LAMBDA_TASK_ROOT}/conf/

# Install dependencies
COPY pyproject.toml poetry.lock* ./
RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --only main --no-interaction --no-ansi

CMD ["main.handler"]
