# Ergo token swap - backend

## Migrations
Migrations need to be crafted by hand, as sequelize is not directly supporting
TypeScript migrations. If you modify models, you need to add a new migration
by hand (**do not use `sequelize-cli` for that!**) and then migrating the
database using `sequelize-cli`:
- Open `/src/db/migrations` and copy `000000-initial_migration.ts` to a new file
  that you name appropriately.
- Modify that file such that it represents a valid migration.
- Run `npx sequelize-cli db:migrate`
