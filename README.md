
# long-hub

## Setup

### Prerequisites

- PostgreSQL
- Node.js
- [pgvector](https://github.com/pgvector/pgvector)

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

Some environment variables are described below:

```
COOKIE_NAME=         # Cookie name for session storage
COOKIE_SECRET=       # Key for cookie encryption. Should be a random string
SILICONFLOW_API_KEY= # Used for text embedding generation

DATABASE_URL=        # Database connection. e.g. postgres://user:password@host:port/longhub
```

Install dependencies:

```sh
$ yarn
```

Initialize database:

```sh
$ createdb longhub  # create pgsql table
$ yarn dotenv -c -- prisma migrate deploy
$ yarn dotenv -c -- prisma migrate generate
```

> [!NOTE]
> On powershell, you need to quote the double dash, so it looks like:
> ```powershell
> PS > yarn dotenv -c '--' prisma migrate deploy
> ```
> This is because the double dash is a special token in Powershell which is offically called _end-of-parameters token_. Refer to [Powershell document](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parsing?view=powershell-7.4#the-end-of-parameters-token) for details.

Build and run:

```sh
$ yarn build
$ yarn start
```

Visit `http://localhost:3000`.
