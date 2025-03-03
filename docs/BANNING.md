## How To Ban A User

Unforunately, banning is a little scuffed right now, but theres a system.

```sh
# Open Postgres On The Fly App
flyctl proxy 5434:5432 -a hc-tcg-postgres
# As the postgres user, set the user to banned.
UPDATE users SET banned = true WHERE uuid = "THE UUID TO BAN";
```

