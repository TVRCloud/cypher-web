# Bot schema (shared with cypher-v2)

The web app reads the Telegram bot's MongoDB (`BOT_DB_URI` / `BOT_DB_NAME`). The bot
(`cypher-v2`) owns the data and the schema. The Mongoose models in `lib/bot/models/*`
are a hand-maintained mirror, so they can drift. Treat the bot as the source of truth.

## Rules

- All models use `strict: false`, so unknown fields pass through. Do not rely on it to hide drift.
- The bot owns collections and indexes. The web app must not create, change or drop
  indexes on the bot DB. `index` options in the models are documentation of what the
  bot already has (and `file_name` text search needs the bot's text index).
- Reads only unless an API route explicitly says otherwise.
- When the bot changes a field, update the matching model here in the same release.

## Collections and fields used

| Collection | Model | Fields |
|---|---|---|
| `files` | `file.ts` | `_id` (string), `file_link`, `file_name` (text index), `file_size`, `file_type`, `created_at`, `language`, `quality`, `year` |
| `downloads` | `download.ts` | `uniq_id`, `file_name`, `user_id`, `file_size`, `timestamp` |
| `users` | `user.ts` | `_id` (number), `first_name`, `last_name`, `username`, `phone`, `lang_code`, `is_premium`, `photo_id` (mixed), `dc_id`, `date`, `time`, `permission` |
| `groups` | `group.ts` | `chat_id`, `title`, `status` (approved/pending/banned/paused), `member_count`, `description`, `last_stats_check`, `added_by`, `added_by_name`, `added_at`, `alert_msg_id` |
| `feedbacks` | `feedback.ts` | `user_id`, `username`, `feedback`, `ticket_id`, `status`, `type`, `date`, `time`, `timestamp` |
| `logs` | `log.ts` | `type`, `user_id`, `meta` (mixed), `timestamp`, `date`, `time` |
| `settings` | `setting.ts` | `_id` (key), `value` (mixed) |
| `config` | `config.ts` | `_id` (key), `value` (mixed) |

## Known drift

- `files.year` is declared as `String` in the model, but the bot has written both strings
  and numbers. Queries must handle both (see `app/api/bot/files/route.ts`, which matches
  the numeric and string form), and UI code must not assume a type.
- Idea (not done): have the bot write a `schema_version` entry into `config` so the web
  app can detect a mismatch at startup.
