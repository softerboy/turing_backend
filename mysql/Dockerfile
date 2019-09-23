FROM mysql:5.7

ENV MYSQL_DATABASE $DB_NAME
ENV MYSQL_ROOT_PASSWORD $DB_PASSWORD

COPY init_db.sql /docker-entrypoint-initdb.d/
