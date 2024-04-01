
# long-hub

## Setup

Clone the repo:

```sh
$ git clone https://github.com/MoveToEx/long-hub.git
$ cd long-hub
```

Config environment variables:

```sh
$ cp .env_template .env.local
$ cp ./prisma/.env_template ./prisma/.env
$ vim .env.local
$ vim ./prisma/.env
```

Note that the `COOKIE_SECRET` is used for cookie encryption and is suggested to be a random string. And can be generated with:

```sh
$ dd if=/dev/urandom bs=1 count=32 2>/dev/null | base64
```

Other environment variables are described below:

```
# .env.local
COOKIE_NAME=        # Cookie name for session storage

MEDIA_ROOT=         # Root directory to store user-uploaded images
MEDIA_URL_PREFIX=   # Prefix of media URL, e.g. https://mysite.com/img/

# prisma/.env
DATABASE_URL="mysql://user:password@host:port/db_name"
```

Install dependencies:

```sh
$ yarn
```

Create a mysql database:
```sh
$ mysql -u root -p
Enter password:

mysql> create database DB_NAME;
mysql> exit
```

Apply migrations:

```sh
$ yarn prisma db push
```

Build and run:

```sh
$ yarn run build
$ yarn run start
```

Visit `http://localhost:3000`.
