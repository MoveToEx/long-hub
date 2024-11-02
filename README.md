
# long-hub

## Setup

### Prerequisites

- A database supported by [Prisma](https://www.prisma.io/docs/orm/reference/supported-databases)
- Node.js
- [Yarn berry](https://yarnpkg.com/migration/overview) enabled

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

Initialize database:

```sh
$ yarn run dotenv -e .env.local -- prisma migrate deploy
```

> [!NOTE]
> On powershell, you need to quote the double dash, so it looks like:
> ```powershell
> PS > yarn run dotenv -e .env.local "--" prisma migrate deploy
> ```
> This is because the double dash is a special token in Powershell which is offically called _end-of-parameters token_. Refer to [Powershell document](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parsing?view=powershell-7.4#the-end-of-parameters-token) for details.

Build and run:

```sh
$ yarn build
$ yarn start
```

Visit `http://localhost:3000`.
