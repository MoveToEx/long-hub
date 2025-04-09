
# long-hub

## Setup

### Prerequisites

- PostgreSQL
- Node.js

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

The `STORAGE_PROVIDER` is used to specify storage method for images. Available values are `local` and [`r2`](https://developers.cloudflare.com/r2/).

To use local storage which writes all images to an local directory, the following variables are required:

```
MEDIA_ROOT=             # Root directory that images will be saved to
MEDIA_URL_PREFIX=       # Prefix of media URL. Must end with a slash.
```

To use [Cloudflare R2](https://developers.cloudflare.com/r2/), the following variables are required:

```
R2_ACCOUNT_ID=          # |
R2_ACCESS_KEY_ID=       # |
R2_SECRET_ACCESS_KEY=   # `- Refer to cloudflare for details
R2_BUCKET_NAME=         # Storage bucket name
R2_PREFIX=              # R2 resource url prefix. Should end with a slash
                        # Images will be assigned a url of form $prefix$key
```

Other environment variables are described below:

```
COOKIE_NAME=        # Cookie name for session storage
COOKIE_SECRET=      # Key for cookie encryption. Should be a random string

DATABASE_URL=       # Database connection. e.g. mysql://user:password@host:port/longhub
```

Install dependencies:

```sh
$ yarn
```

Initialize database:

```sh
$ createdb longhub  # create pgsql table
$ yarn dotenv -c -- prisma migrate deploy
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
