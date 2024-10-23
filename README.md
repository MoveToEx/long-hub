
# long-hub

## Setup

Clone the repo:

```sh
$ git clone https://github.com/MoveToEx/long-hub.git
$ cd long-hub
```

Configure environment variables:

```sh
$ cp .env_template .env.local
$ vim .env.local
```

Note that the `COOKIE_SECRET` is used for cookie encryption and is suggested to be a random string. And can be generated with:

```sh
$ dd if=/dev/urandom bs=1 count=32 2>/dev/null | base64
```

Other environment variables are described below:

```
COOKIE_NAME=        # Cookie name for session storage

MEDIA_ROOT=         # Root directory to store user-uploaded images
MEDIA_URL_PREFIX=   # Prefix of media URL, e.g. https://mysite.com/img/

DATABASE_URL=       # Database connection. e.g. mysql://user:password@host:port/longhub
```

Install dependencies:

```sh
$ yarn
```

Apply migrations:

```sh
$ yarn prisma migrate deploy
```

Build and run:

```sh
$ yarn build
$ yarn start
```

Visit `http://localhost:3000`.
