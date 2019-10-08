# Turing Back End Challenge

### Prerequisites

In order to install and run this project locally, you would need to have the following installed on you local machine.

* [**Node JS**](https://nodejs.org/en/)
* [**KoaJs**](https://koajs.com/)
* [**MySQL**](https://www.mysql.com/downloads/)

### Installation

* Run `npm install` or `yarn` to install the projects dependencies
* create a `.env` file and copy the contents of the `.env.sample` file into it and supply the values for each variable

```sh
cp .env.sample .env
```
* Create a MySQL database and run the `sql` file in the database directory to migrate the database

```sh
mysql -u <dbuser> -D <databasename> -p < ./mysql/init_db.sql
```

* Run `npm run dev` or `yarn dev` to start the app in development

## Docker

* Build image

`docker-compose build --no-cache --force-rm`

* Run container
`docker-compose up`

# Running Tests

* Run application with test environment
<br />  You can specify environment variables for testing in `.env.test.*[local | development]` file  

`npm run dev:test` or `yarn dev:test`

* After run tests itself

`npm run test` or `yarn test`
 

