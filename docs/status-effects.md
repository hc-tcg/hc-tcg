## Proper Use Of Status Effects

Status effects should be used to store information between turns.

### Adding a New Status Effect

To create a status effect, create a file in `common/status-effects/`.

### Status Effect Types

- `normal` - A status effct that can be cleared by status effect removal abilities, for example Bad Omen. These status effects are displayed in the status effect gutters.
- `damage` - Similar to `normal` status effects but also deals damage. This tag should be used when the status effect should display on the Hermit's health box.
- `system` - A status effect to provide clarity for a card ability, or to store information between rounds. These status effects are displayed in the status effect gutters.
- `hiddenSystem` - A system status effect that should not be visible to the user.

