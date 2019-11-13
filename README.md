# Mysql Data API Wapper
[![CircleCI](https://circleci.com/gh/Fyreware/mysql-data-api/tree/master.svg?style=svg)](https://circleci.com/gh/Fyreware/mysql-data-api/tree/master)

This package was created to easily enabled the sequelize package to utilize the AWS data-api for **Aurora Serverless MySQL** by mocking parts of the interface of the [mysql2](https://github.com/brianmario/mysql2) package that is utilize in sequelize mysql dialect.

## Getting Started
This package has only been testes for sequelize v5, and only for the *mysql* dialect.

### Prerequisites
When getting started make sure you are using **Aurora Serverless MySQL** and that the **Data API** is enabled.
And that you cluster is configured to use secrets from **AWS Secrets Manager**

Install sequelize in project
```
npm i --save sequelize
```

### Installing

Install Wrapper

```
npm install @fyreware/mysql-data-api --save
```
### Usage
When using the data api wrapper you will configure sequelize like normal with the exception of of certain fields that are *ignored*, or have been *hijacked* by the wrapper as shown below.

``` javascript
const database = 'testDb'
// Arn of Aurora serverless cluster cluster
const host = 'arn:aws:rds:us-east-1:123456789000:cluster:http-endpoint-test';

// This param is ignored by the wrapper.
const username = 'anything'; 

// Arn of secrets manager secret containing the rds credentials
const passowrd = 'arn:aws:secretsmanager:region:123456789012:secret:tutorials/MyFirstTutorialSecret-jiObOV'

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: 'mysql'

  // This tells sequelize to load our module instead of the `mysql2` module
  dialectModulePath: '@fyreware/mysql-data-api',
});
```

### Things to know
* When using the **Data API** is that you will not be able to insert or select *zero date values* on the database ass both will result in error. This is a limitation of the **Data API** its self so not much can be done about it. We suggest ensuring these values are not zero values by either explicitly setting the date on insert or setting a default value of *NULL* or *CURRENT_TIMESTAMP*.

* Currently AWS credentials can only be passed in via the environment. So local development is only works when you use the **AWS Environment Variables** or have the default profile set in your **Shared Credentials File**

## Running the tests

Explain how to run the automated tests for this system


### And coding style tests

```
npm test
```

## Deployment

Add additional notes about how to deploy this on a live system

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Michael Strong** - *Initial work* - [mtstrong17](https://github.com/mtstrong17)
* **Travis Delly** - *Initial work* - [Dellybro](https://github.com/Dellybro)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
